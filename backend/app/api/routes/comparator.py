from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.metric_service import MetricService
from app.schemas.comparator import ComparatorResponse
import numpy as np
import cv2
import base64
import io

router = APIRouter()

def process_upload(file: UploadFile) -> np.ndarray:
    try:
        contents = file.file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Invalid image file")
        # Resize to standard size (e.g., 256x256)
        img = cv2.resize(img, (256, 256))
        # Normalize to [0,1]
        return img.astype(np.float32) / 255.0
    except Exception as e:
        raise ValueError(f"Processing error: {str(e)}")

@router.post("/evaluate", response_model=ComparatorResponse)
async def evaluate_comparator(
    test_image: UploadFile = File(...),
    reference_image: UploadFile = File(None)
):
    try:
        test_np = process_upload(test_image)
        ref_np = None
        if reference_image:
            ref_np = process_upload(reference_image)
        
        # 1. Run Metrics
        metrics_results = MetricService.run_all_metrics(test_np, ref_np)
        
        # 2. Generate Difference Heatmap (if ref is provided)
        heatmap_b64 = None
        if ref_np is not None:
            # Simple absolute difference heatmap
            diff = np.abs(ref_np - test_np)
            # Scale to 0-255 and apply JET colormap
            diff_mapped = cv2.applyColorMap((diff * 255).astype(np.uint8), cv2.COLORMAP_JET)
            _, buffer = cv2.imencode('.png', diff_mapped)
            heatmap_b64 = base64.b64encode(buffer).decode('utf-8')
            
        return ComparatorResponse(
            metrics=metrics_results,
            heatmap_base64=heatmap_b64,
            status="success"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
