from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.inference_service import InferenceService
from app.services.gradcam_service import GradCAMService
import numpy as np
import cv2
import torch
import io

router = APIRouter()
infer_service = InferenceService()
cam_service = GradCAMService()

@router.post("/diagnose")
async def run_diagnostics(
    image: UploadFile = File(...),
    signal: UploadFile = File(None),
    model_name: str = Form("paqnet"),
    weight_file: str = Form("best_paqnet.pth")
):
    try:
        # 1. Process Main Image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Invalid image file")
            
        img_resized = cv2.resize(img, (128, 128))
        image_tensor = torch.tensor(img_resized, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.0
        
        # 2. Process Signal (if provided)
        signal_tensor = None
        if signal:
            sig_contents = await signal.read()
            sig_nparr = np.frombuffer(sig_contents, np.uint8)
            sig_img = cv2.imdecode(sig_nparr, cv2.IMREAD_GRAYSCALE)
            if sig_img is not None:
                sig_resized = cv2.resize(sig_img, (128, 128))
                signal_tensor = torch.tensor(sig_resized, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.0
        
        # 3. Load Model Weights
        infer_service.load_model(model_name, weight_file)
        
        # 4. Predict
        prediction = infer_service.predict(image_tensor, signal_tensor)
        
        # 5. Optional: Grad-CAM (Only for IQA models as CAM is designed for classification/regression headers)
        heatmap_b64 = None
        if prediction["type"] == "iqa":
            try:
                heatmap_b64 = cam_service.generate_cam(infer_service.active_model, image_tensor, img_resized)
            except Exception as cam_err:
                print(f"Grad-CAM skipped: {str(cam_err)}")
        
        return {
            "prediction": prediction,
            "heatmap_base64": heatmap_b64,
            "status": "success",
            "model_used": model_name
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_available_models():
    import sys
    import os
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    import model_manager
    return model_manager.list_saved_models()
