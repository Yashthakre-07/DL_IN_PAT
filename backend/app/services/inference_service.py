import sys
import os
import torch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
import model_manager
from models.paqnet import PhotoacousticQualityNet
from models.iqdcnn import IQDCNN
from models.efficientnet_iqa import EfficientNetIQA
from models.unet_fdunet import UNet, FDUNet, PixelDL
from models.pixel_gan import PixelGANGenerator, PixelCGANGenerator

class InferenceService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.active_model = None

    def load_model(self, model_name: str, filename: str):
        model_name_lower = model_name.lower()
        if "paqnet" in model_name_lower:
            model = PhotoacousticQualityNet()
        elif "iqdcnn" in model_name_lower:
            model = IQDCNN()
        elif "efficientnet" in model_name_lower:
            model = EfficientNetIQA()
        elif "fdynet" in model_name_lower:
            model = FDYNet()
        elif "ynet" in model_name_lower:
            model = YNet()
        elif "fdunet" in model_name_lower:
            model = FDUNet()
        elif "pixeldl" in model_name_lower:
            model = PixelDL()
        elif "pixelcgan" in model_name_lower:
            model = PixelCGANGenerator()
        elif "pixelgan" in model_name_lower:
            model = PixelGANGenerator()
        elif "unet" in model_name_lower:
            model = UNet()
        else:
            raise ValueError(f"Unknown architecture: {model_name}")
            
        self.active_model = model_manager.load_model_weights(model, filename)
        self.active_model.to(self.device)
        return {"status": "success", "model": model_name}

    def predict(self, image_tensor):
        if not self.active_model:
            raise RuntimeError("No model loaded.")
        with torch.no_grad():
            output = self.active_model(image_tensor.to(self.device))
        return output.item()
