from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException, BackgroundTasks
import asyncio
import json
import os
import shutil
import uuid
from app.services.dataset_service import DatasetService
from app.ml.training.train_loop import run_training

router = APIRouter()

# In-memory task registry for tracking progress without Redis
task_registry = {}

import traceback

class LocalTaskInstance:
    def __init__(self, task_id):
        self.task_id = task_id
    
    def update_state(self, state, meta):
        # Merge existing info with new meta
        current = task_registry.get(self.task_id, {"info": {}})
        task_registry[self.task_id] = {
            "state": state,
            "info": {**current.get("info", {}), **meta}
        }

def background_train_runner(task_id: str, file_path: str, model_name: str, epochs: int, batch_size: int, dataset_name: str):
    try:
        task_registry[task_id] = {"state": "PENDING", "info": {"message": "Initializing Engine..."}}
        
        ds_service = DatasetService()
        # Process zip and create loaders
        try:
            task_registry[task_id]["info"]["message"] = "Extracting Dataset Archive..."
            train_df, val_df, test_df = ds_service.process_zip(file_path)
            
            task_registry[task_id]["info"]["message"] = f"Generating DataLoaders (Train: {len(train_df)} samples)..."
            loaders = ds_service.create_dataloaders(train_df, val_df, test_df, batch_size=batch_size)
        except Exception as e:
            error_details = traceback.format_exc()
            error_msg = f"Data Preparation Failed: {str(e)}"
            print(error_details)
            task_registry[task_id] = {
                "state": "FAILURE", 
                "info": {
                    "message": error_msg,
                    "details": error_details
                }
            }
            return
        
        task_instance = LocalTaskInstance(task_id)
        
        task_registry[task_id]["info"]["message"] = f"Training Pipeline Started (Model: {model_name}, Epochs: {epochs})..."
        try:
            result = run_training(
                epochs=epochs, 
                model_name=model_name, 
                train_loader=loaders['train'], 
                val_loader=loaders['val'], 
                task_instance=task_instance,
                dataset_name=dataset_name
            )
            task_registry[task_id] = {"state": "SUCCESS", "result": result, "info": {"message": "Model Training Complete."}}
        except Exception as e:
            error_details = traceback.format_exc()
            error_msg = f"Training Loop Failure: {str(e)}"
            print(error_details)
            task_registry[task_id] = {
                "state": "FAILURE", 
                "info": {
                    "message": error_msg,
                    "details": error_details
                }
            }
        
    except Exception as e:
        error_details = traceback.format_exc()
        error_msg = f"Critical Pipeline Error: {str(e)}"
        print(error_details)
        task_registry[task_id] = {
            "state": "FAILURE", 
            "info": {
                "message": error_msg,
                "details": error_details
            }
        }

@router.post("/start")
async def start_training(
    background_tasks: BackgroundTasks,
    dataset: UploadFile = File(...),
    model_name: str = Form("paqnet"),
    epochs: int = Form(10),
    batch_size: int = Form(16)
):
    """
    Saves the uploaded dataset zip and triggers a background training task.
    """
    # Save the file temporarily
    log_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../debug_training.log"))
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data"))
    temp_dir = os.path.join(base_dir, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{dataset.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(dataset.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save dataset: {str(e)}")
        
    task_id = str(uuid.uuid4())
    
    # Initialize task registry entry
    task_registry[task_id] = {"state": "PENDING", "info": {"message": "Queuing task..."}}
    
    try:
        background_tasks.add_task(
            background_train_runner,
            task_id,
            file_path,
            model_name,
            epochs,
            batch_size,
            dataset.filename.replace(".zip", "") if dataset.filename else "unknown"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger task: {str(e)}")
    
    return {"task_id": task_id, "status": "Training started"}

@router.websocket("/ws/{task_id}")
async def websocket_training_endpoint(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint to stream task progress (epochs, loss) to the frontend.
    """
    await websocket.accept()
    try:
        last_info = None
        while True:
            task = task_registry.get(task_id)
            
            if not task:
                await websocket.send_json({"status": "PENDING", "message": "Waiting for worker..."})
            else:
                state = task.get("state")
                info = task.get("info", {})
                
                # Only send if info has changed to reduce traffic
                if info != last_info:
                    await websocket.send_json({
                        "status": state,
                        "data": info,
                        "result": task.get("result")
                    })
                    last_info = info.copy()

                if state in ['SUCCESS', 'FAILURE']:
                    break
                
            await asyncio.sleep(0.5) 
            
    except WebSocketDisconnect:
        print(f"Client disconnected from WebSocket for task {task_id}")
    except Exception as e:
        print(f"WebSocket Error: {str(e)}")
        if not websocket.client_state.name == "DISCONNECTED":
            await websocket.close()

