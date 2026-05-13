import sys
import os
import torch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
import model_manager
from models.paqnet import PhotoacousticQualityNet
from models.iqdcnn import IQDCNN
from models.efficientnet_iqa import EfficientNetIQA

class InferenceService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.active_model = None

    def load_model(self, model_name: str, filename: str):
        if "paqnet" in model_name.lower():
            model = PhotoacousticQualityNet()
        elif "iqdcnn" in model_name.lower():
            model = IQDCNN()
        elif "efficientnet" in model_name.lower():
            model = EfficientNetIQA()
        else:
            raise ValueError("Unknown architecture")
            
        self.active_model = model_manager.load_model_weights(model, filename)
        self.active_model.to(self.device)
        return {"status": "success", "model": model_name}

    def predict(self, image_tensor):
        if not self.active_model:
            raise RuntimeError("No model loaded.")
        with torch.no_grad():
            output = self.active_model(image_tensor.to(self.device))
        return output.item()
