from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
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
# Thread-safe message queues for active training tasks
task_queues: Dict[str, asyncio.Queue] = {}

class TaskInstance:
    def __init__(self, task_id, loop=None):
        self.task_id = task_id
        try:
            self.loop = loop or asyncio.get_running_loop()
        except RuntimeError:
            self.loop = loop or asyncio.get_event_loop()
            
    def update_state(self, state, meta):
        training_tasks[self.task_id] = {"status": state, "meta": meta}
        # Thread-safe dispatch of updates to the active WebSocket queue if present
        if self.task_id in task_queues:
            self.loop.call_soon_threadsafe(
                task_queues[self.task_id].put_nowait,
                {"status": state, "data": meta}
            )

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
    
    # Initialize the queue early so websocket can listen from the very start
    task_queues[task_id] = asyncio.Queue()
    
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
        res = await asyncio.to_thread(
            run_training, 
            epochs, model_name, loaders["train"], loaders["val"], task, dataset_name,
            lr, opt, loss
        )
        task.update_state("SUCCESS", {
            "message": f"Training completed successfully! Best Validation Loss: {res['best_val']:.6f}",
            "model_path": res["model_path"]
        })
    except Exception as e:
        import traceback
        task.update_state("FAILURE", {"message": str(e), "details": traceback.format_exc()})

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in training_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return training_tasks[task_id]

@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    
    # Initialize a queue for this task if it doesn't exist yet
    if task_id not in task_queues:
        task_queues[task_id] = asyncio.Queue()
        
    # Send current state if the task has already started
    if task_id in training_tasks:
        initial_task = training_tasks[task_id]
        await websocket.send_json({
            "status": initial_task["status"],
            "data": initial_task["meta"]
        })
        
    queue = task_queues[task_id]
    try:
        while True:
            # Wait for logs or metrics from the training loop
            data = await queue.get()
            await websocket.send_json(data)
            queue.task_done()
            
            # Close connection if task reaches a terminal state
            if data["status"] in ["SUCCESS", "FAILURE", "COMPLETED", "FAILED"]:
                break
    except WebSocketDisconnect:
        pass
    finally:
        # Clean up queue when client disconnects
        if task_id in task_queues:
            del task_queues[task_id]

