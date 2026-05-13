import torch
import torch.nn as nn
import os
import sys
import traceback
from datetime import datetime

# Add the project root so we can import models and model_manager
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
sys.path.insert(0, PROJECT_ROOT)

SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, "saved_models")

from models.paqnet import PhotoacousticQualityNet
from models.iqdcnn import IQDCNN
from models.efficientnet_iqa import EfficientNetIQA


def _create_model(model_name: str):
    """Create a fresh model architecture (no weights) for training from scratch."""
    name = model_name.lower()
    if "paqnet" in name:
        return PhotoacousticQualityNet()
    elif "iqdcnn" in name:
        return IQDCNN()
    elif "efficientnet" in name:
        return EfficientNetIQA()
    elif "resnet" in name:
        # Fallback to PAQNet for resnet selection
        return PhotoacousticQualityNet()
    else:
        raise ValueError(f"Unknown architecture: '{model_name}'. Supported: paqnet, iqdcnn, efficientnet")


def run_training(epochs, model_name, train_loader, val_loader, task_instance, dataset_name="unknown"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if task_instance:
        task_instance.update_state(state='TRAINING', meta={
            'message': f"Initializing Compute Device: {device.type.upper()}",
            'device': str(device)
        })

    # Create model architecture directly (no weight loading needed for training)
    try:
        model = _create_model(model_name)
        model = model.to(device)
        
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={
                'message': f"Model Architecture '{model_name}' Initialized Successfully."
            })
    except Exception as e:
        error_msg = f"Failed to create model '{model_name}': {str(e)}"
        if task_instance:
            task_instance.update_state(state='FAILURE', meta={'message': error_msg, 'details': traceback.format_exc()})
        raise RuntimeError(error_msg)
    
    # Huber Loss was specifically used in the paper for robustness
    criterion = nn.HuberLoss() 
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    
    best_val_loss = float('inf')
    
    # Ensure saved_models directory exists
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={
                'message': f"Epoch {epoch + 1}/{epochs}: Training Phase Started",
                'epoch': epoch + 1
            })

        for i, (images, labels) in enumerate(train_loader):
            try:
                images, labels = images.to(device), labels.to(device)
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs.squeeze(), labels.squeeze())
                loss.backward()
                optimizer.step()
                train_loss += loss.item()
                
                # Update status every 10 batches if dataset is large
                if i % 10 == 0 and task_instance:
                    task_instance.update_state(state='TRAINING', meta={
                        'message': f"Epoch {epoch + 1}: Processing Batch {i+1}/{len(train_loader)}",
                        'loss': train_loss / (i + 1)
                    })
            except Exception as e:
                error_msg = f"Batch Processing Error (Epoch {epoch+1}, Batch {i+1}): {str(e)}"
                if task_instance:
                    task_instance.update_state(state='FAILURE', meta={'message': error_msg, 'details': traceback.format_exc()})
                raise RuntimeError(error_msg)
            
        train_loss /= len(train_loader)
        
        # Validation
        model.eval()
        val_loss = 0
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={
                'message': f"Epoch {epoch + 1}/{epochs}: Validation Phase Started",
                'loss': train_loss
            })

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs.squeeze(), labels.squeeze())
                val_loss += loss.item()
                
        val_loss /= len(val_loader)
        
        # Save best checkpoint
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            # Use a consistent timestamp for this training run's "best" file
            if not hasattr(run_training, "_run_date"):
                run_training._run_date = datetime.now().strftime("%Y-%m-%d")
            
            save_path = os.path.join(SAVED_MODELS_DIR, f"{model_name}_{dataset_name}_{run_training._run_date}.pth")
            torch.save(model.state_dict(), save_path)
            if task_instance:
                task_instance.update_state(state='TRAINING', meta={
                    'message': f"New Best Model Saved (Val Loss: {val_loss:.6f})",
                    'best_val_loss': best_val_loss
                })
            
        # Update task state for frontend WebSocket streaming
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={
                'message': f"Epoch {epoch + 1} Complete. Train Loss: {train_loss:.6f}, Val Loss: {val_loss:.6f}",
                'epoch': epoch + 1,
                'loss': train_loss,
                'val_loss': val_loss,
                'best_val_loss': best_val_loss
            })
            
    # Automated Registration via model_manager
    try:
        import model_manager
        
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={'message': "Finalizing: Registering Model Weights..."})

        model_manager.save_model(
            model=model,
            model_name=model_name,
            architecture_type=model_name,
            dataset_name=dataset_name,
            metrics_achieved={"best_val_huber": best_val_loss}
        )
    except Exception as e:
        print(f"Registration Warning: {str(e)}")
        if task_instance:
            task_instance.update_state(state='TRAINING', meta={'message': f"Warning: Model registration skipped: {str(e)}"})
            
    if hasattr(run_training, "_run_date"):
        final_model_name = f"{model_name}_{dataset_name}_{run_training._run_date}.pth"
        delattr(run_training, "_run_date")
    else:
        # Fallback if no best model was saved (rare)
        final_model_name = f"{model_name}_{datetime.now().strftime('%Y-%m-%d')}.pth"

    return {"status": "Complete", "best_val": best_val_loss, "model_path": final_model_name}
