from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from app.services.dataset_service import DatasetService
import os
import uuid
import asyncio
from typing import Dict

router = APIRouter()
dataset_service = DatasetService()

# In-memory store for task states (for demo/simplicity)
# In production, use Redis/DB
training_tasks: Dict[str, dict] = {}

class TaskInstance:
    def __init__(self, task_id):
        self.task_id = task_id
    def update_state(self, state, meta):
        training_tasks[self.task_id] = {"status": state, "meta": meta}

@router.post("/train")
async def start_training(
    background_tasks: BackgroundTasks,
    model_name: str = Form(...),
    dataset: UploadFile = File(...),
    epochs: int = Form(50),
    batch_size: int = Form(16),
    learning_rate: float = Form(1e-4),
    optimizer_type: str = Form("adam"),
    loss_type: str = Form("mse")
):
    task_id = str(uuid.uuid4())
    training_tasks[task_id] = {"status": "INITIALIZING", "meta": {"message": "Processing dataset..."}}
    
    # Save file
    file_path = os.path.join(dataset_service.upload_dir, f"{task_id}_{dataset.filename}")
    with open(file_path, "wb") as buffer:
        buffer.write(await dataset.read())
    
    # Start background process
    background_tasks.add_task(
        execute_training, 
        task_id, file_path, model_name, epochs, batch_size, learning_rate, optimizer_type, loss_type, dataset.filename
    )
    
    return {"task_id": task_id, "status": "Training started"}

async def execute_training(task_id, file_path, model_name, epochs, batch_size, lr, opt, loss, dataset_name):
    task = TaskInstance(task_id)
    try:
        # Process Dataset
        data, format_type = dataset_service.process_file(file_path, model_name)
        loaders = dataset_service.create_dataloaders(data, format_type, model_name, batch_size)
        
        from app.ml.training.train_loop import run_training
        # Pass the new hyperparameters to the training loop
        await asyncio.to_thread(
            run_training, 
            epochs, model_name, loaders["train"], loaders["val"], task, dataset_name,
            lr, opt, loss
        )
    except Exception as e:
        import traceback
        task.update_state("FAILURE", {"message": str(e), "details": traceback.format_exc()})

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in training_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return training_tasks[task_id]
