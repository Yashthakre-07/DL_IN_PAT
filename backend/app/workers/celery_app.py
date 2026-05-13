from celery import Celery
from app.ml.training.train_loop import run_training
import os

# Configure Celery to use Redis as broker and backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "training_worker", 
    broker=REDIS_URL, 
    backend=REDIS_URL
)

@celery_app.task(bind=True)
def start_training_task(self, config):
    """
    Task to run the training loop in the background.
    config should contain: epochs, model_name, and dataset_path.
    """
    # In a real scenario, we would use DatasetService here to load data
    # For now, we assume the DataLoaders are passed or handled inside
    # Note: Objects like DataLoaders cannot be easily serialized, 
    # so we usually pass paths and initialize them inside the task.
    
    from app.services.dataset_service import DatasetService
    ds_service = DatasetService()
    
    # Process zip and create loaders
    train_df, val_df, test_df = ds_service.process_zip(config['dataset_path'])
    loaders = ds_service.create_dataloaders(train_df, val_df, test_df, batch_size=config.get('batch_size', 16))
    
    return run_training(
        epochs=config['epochs'], 
        model_name=config['model_name'], 
        train_loader=loaders['train'], 
        val_loader=loaders['val'], 
        task_instance=self
    )
