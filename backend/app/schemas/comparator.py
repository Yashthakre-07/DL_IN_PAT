from pydantic import BaseModel
from typing import Dict, Any

class ComparatorResponse(BaseModel):
    metrics: Dict[str, Dict[str, float]]
    heatmap_base64: str = None
    status: str
