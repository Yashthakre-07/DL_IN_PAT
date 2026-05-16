import sys
import os
import torch
import torch.nn.functional as F
import numpy as np
import cv2
import base64

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
import model_manager
from models.paqnet import PhotoacousticQualityNet
from models.iqdcnn import IQDCNN
from models.efficientnet_iqa import EfficientNetIQA
from models.unet_fdunet import UNet, FDUNet, PixelDL, YNet, FDYNet
from models.pixel_gan import PixelGANGenerator, PixelCGANGenerator

class InferenceService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.active_model = None
        self.active_model_name = ""

    def load_model(self, model_name: str, filename: str):
        model_name_lower = model_name.lower()
        self.active_model_name = model_name_lower
        
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
        self.active_model.eval()
        return {"status": "success", "model": model_name}

    def predict(self, image_tensor, signal_tensor=None):
        if not self.active_model:
            raise RuntimeError("No model loaded.")
            
        is_dual = "ynet" in self.active_model_name
        is_reconstruction = any(x in self.active_model_name for x in ["unet", "fdunet", "pixeldl", "ynet", "gan"])
        
        with torch.no_grad():
            if is_dual:
                if signal_tensor is None:
                    raise ValueError("This model (Y-Net) requires both an Image and a Signal input.")
                output = self.active_model(image_tensor.to(self.device), signal_tensor.to(self.device))
            else:
                output = self.active_model(image_tensor.to(self.device))

        # Handle Score vs Image Output
        if is_reconstruction:
            # Output is a reconstructed image tensor (B, C, H, W)
            # Normalize and convert to base64
            reconstructed_img = output.squeeze().cpu().numpy()
            
            # Normalize to 0-255
            reconstructed_img = (reconstructed_img - reconstructed_img.min()) / (reconstructed_img.max() - reconstructed_img.min() + 1e-8)
            reconstructed_img = (reconstructed_img * 255).astype(np.uint8)
            
            # Encode to base64
            _, buffer = cv2.imencode('.png', reconstructed_img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "type": "reconstruction",
                "image_base64": img_base64,
                "psnr": float(self._calculate_psnr(image_tensor.squeeze().cpu().numpy(), reconstructed_img / 255.0))
            }
        else:
            # Output is a quality score scalar
            return {
                "type": "iqa",
                "score": float(output.item())
            }

    def _calculate_psnr(self, original, reconstructed):
        mse = np.mean((original - reconstructed) ** 2)
        if mse == 0: return 100
        return 20 * np.log10(1.0 / np.sqrt(mse))
