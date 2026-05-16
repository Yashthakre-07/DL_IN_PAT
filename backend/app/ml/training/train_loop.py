import torch
import torch.nn as nn
import os
import sys
import traceback
from datetime import datetime

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
sys.path.insert(0, PROJECT_ROOT)

SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, "saved_models")

from models.paqnet import PhotoacousticQualityNet
from models.iqdcnn import IQDCNN
from models.efficientnet_iqa import EfficientNetIQA
from models.unet_fdunet import UNet, FDUNet, PixelDL, YNet, FDYNet
from models.pixel_gan import PixelGANGenerator, PixelCGANGenerator

def _create_model(model_name: str):
    name = model_name.lower()
    if "paqnet" in name: return PhotoacousticQualityNet()
    elif "iqdcnn" in name: return IQDCNN()
    elif "efficientnet" in name: return EfficientNetIQA()
    elif "unet" == name: return UNet()
    elif "fdunet" == name: return FDUNet()
    elif "pixeldl" == name: return PixelDL()
    elif "pixelgan" == name: return PixelGANGenerator()
    elif "pixelcgan" == name: return PixelCGANGenerator()
    elif "ynet" == name: return YNet()
    elif "fdynet" == name: return FDYNet()
    else:
        supported = "paqnet, iqdcnn, efficientnet, unet, fdunet, pixeldl, pixelgan, pixelcgan, ynet, fdynet"
        raise ValueError(f"Unknown architecture: '{model_name}'. Supported: {supported}")

def run_training(epochs, model_name, train_loader, val_loader, task_instance, dataset_name="unknown", 
                 lr=1e-4, optimizer_type="adam", loss_type="mse"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    is_dual = "ynet" in model_name.lower()
    
    # Configure Loss Function
    if loss_type.lower() == "mse":
        criterion = nn.MSELoss()
    elif loss_type.lower() == "l1":
        criterion = nn.L1Loss()
    elif loss_type.lower() == "huber":
        criterion = nn.HuberLoss()
    else:
        criterion = nn.MSELoss()

    try:
        model = _create_model(model_name).to(device)
    except Exception as e:
        if task_instance: task_instance.update_state('FAILURE', {'message': str(e)})
        raise RuntimeError(e)
    
    # Configure Optimizer
    if optimizer_type.lower() == "adam":
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    elif optimizer_type.lower() == "sgd":
        optimizer = torch.optim.SGD(model.parameters(), lr=lr, momentum=0.9)
    elif optimizer_type.lower() == "rmsprop":
        optimizer = torch.optim.RMSprop(model.parameters(), lr=lr)
    else:
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    
    best_val_loss = float('inf')
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        
        for i, (inputs, labels) in enumerate(train_loader):
            try:
                if is_dual:
                    img, sig = inputs
                    img, sig, labels = img.to(device), sig.to(device), labels.to(device)
                    optimizer.zero_grad()
                    outputs = model(img, sig)
                else:
                    images, labels = inputs.to(device), labels.to(device)
                    optimizer.zero_grad()
                    outputs = model(images)
                
                # Dynamic shape handling
                if outputs.shape != labels.shape:
                    if outputs.numel() == labels.numel():
                        loss = criterion(outputs.view(-1), labels.view(-1))
                    else:
                        loss = criterion(outputs.mean(dim=(1,2,3)), labels)
                else:
                    loss = criterion(outputs, labels)
                    
                loss.backward()
                optimizer.step()
                train_loss += loss.item()
                
                if i % 10 == 0 and task_instance:
                    task_instance.update_state('TRAINING', {
                        'message': f"Epoch {epoch + 1}: Batch {i+1}/{len(train_loader)} | Loss: {loss.item():.4f}",
                        'loss': train_loss / (i + 1)
                    })
            except Exception as e:
                if task_instance: task_instance.update_state('FAILURE', {'message': str(e)})
                raise RuntimeError(e)
            
        train_loss /= len(train_loader)
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                if is_dual:
                    img, sig = inputs
                    img, sig, labels = img.to(device), sig.to(device), labels.to(device)
                    outputs = model(img, sig)
                else:
                    images, labels = inputs.to(device), labels.to(device)
                    outputs = model(images)
                
                if outputs.shape != labels.shape:
                    if outputs.numel() == labels.numel():
                        loss = criterion(outputs.view(-1), labels.view(-1))
                    else:
                        loss = criterion(outputs.mean(dim=(1,2,3)), labels)
                else:
                    loss = criterion(outputs, labels)
                val_loss += loss.item()
                
        val_loss /= len(val_loader)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            if not hasattr(run_training, "_run_date"):
                run_training._run_date = datetime.now().strftime("%Y-%m-%d")
            save_path = os.path.join(SAVED_MODELS_DIR, f"{model_name}_{dataset_name}_{run_training._run_date}.pth")
            torch.save(model.state_dict(), save_path)
            
        if task_instance:
            task_instance.update_state('TRAINING', {
                'message': f"Epoch {epoch + 1} Complete. Val Loss: {val_loss:.6f}",
                'epoch': epoch + 1,
                'loss': train_loss,
                'val_loss': val_loss,
                'best_val_loss': best_val_loss
            })
            
    final_model_name = f"{model_name}_{dataset_name}_{run_training._run_date}.pth" if hasattr(run_training, "_run_date") else "model.pth"
    if hasattr(run_training, "_run_date"): delattr(run_training, "_run_date")
    return {"status": "Complete", "best_val": best_val_loss, "model_path": final_model_name}
