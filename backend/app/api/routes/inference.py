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
    model_name: str = Form("paqnet"),
    weight_file: str = Form("best_paqnet.pth")
):
    """
    Performs inference on a single image and generates a Grad-CAM heatmap for interpretability.
    """
    try:
        # 1. Process Image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Invalid image file")
            
        img_resized = cv2.resize(img, (128, 128))
        # Convert to Tensor (B, C, H, W)
        tensor = torch.tensor(img_resized, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.0
        
        # 2. Load Model Weights
        # This will load the architecture based on model_name and weights from saved_models/
        infer_service.load_model(model_name, weight_file)
        
        # 3. Predict Quality Score
        score = infer_service.predict(tensor)
        
        # 4. Generate Grad-CAM Heatmap
        # This will visualize the activation regions of the final conv layer
        heatmap_b64 = cam_service.generate_cam(infer_service.active_model, tensor, img_resized)
        
        return {
            "score": score,
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
    """
    Exposes available models from the saved_models directory.
    """
    import sys
    import os
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    import model_manager
    return model_manager.list_saved_models()
@router.patch("/models/{filename}/rename")
async def rename_model(filename: str, payload: dict):
    """
    Renames the display name of a specific weight file in the registry.
    """
    new_name = payload.get("new_name")
    if not new_name:
        raise HTTPException(status_code=400, detail="New name is required")
        
    import sys
    import os
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    import model_manager
    
    success = model_manager.update_model_name(filename, new_name)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found in registry")
        
    return {"status": "success", "message": f"Model renamed to {new_name}"}
@router.delete("/models/{filename}")
async def delete_model(filename: str):
    """
    Deletes a specific weight file and its registry entry.
    """
    import sys
    import os
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    import model_manager
    
    success = model_manager.delete_model(filename)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
        
    return {"status": "success", "message": "Model deleted successfully"}
