import os

pp2_dir = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\pp2"
os.makedirs(pp2_dir, exist_ok=True)

files_content = {
    "3.1.md": """# Step 3.1: Neural Diagnostics Inference Service (Code Implementation)

## Overview
Phase 3 is all about Interpretability and single-image inference.

## 1. Inference Router (`app/api/routes/inference.py`)
```python
from fastapi import APIRouter, UploadFile, File, Form
from app.services.inference_service import InferenceService
from app.services.gradcam_service import GradCAMService
import numpy as np
import cv2

router = APIRouter()
infer_service = InferenceService()
cam_service = GradCAMService()

@router.post("/diagnose")
async def run_diagnostics(
    image: UploadFile = File(...),
    model_name: str = Form(...),
    weight_file: str = Form(...)
):
    # Process Image
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img_resized = cv2.resize(img, (128, 128))
    tensor = torch.tensor(img_resized, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.0
    
    # Load Model
    infer_service.load_model(model_name, weight_file)
    
    # Predict
    score = infer_service.predict(tensor)
    
    # Grad-CAM
    heatmap_b64 = cam_service.generate_cam(infer_service.active_model, tensor, img_resized)
    
    return {"score": score, "heatmap_base64": heatmap_b64}
```
""",

    "3.2.md": """# Step 3.2: Grad-CAM Explainability (Code Implementation)

## 1. Grad-CAM Service (`app/services/gradcam_service.py`)
The paper emphasizes interpreting the quality prediction using Grad-CAM.
```python
import torch
import torch.nn.functional as F
import cv2
import numpy as np
import base64

class GradCAMService:
    def __init__(self):
        self.gradients = None
        self.activations = None

    def save_gradient(self, grad):
        self.gradients = grad

    def generate_cam(self, model, image_tensor, original_image_np):
        model.eval()
        
        # Determine target layer dynamically (e.g., last conv layer)
        # For PAQNet, this is model.conv4
        target_layer = None
        for name, module in model.named_modules():
            if isinstance(module, torch.nn.Conv2d):
                target_layer = module
        
        if target_layer is None:
            return None
            
        # Register hooks
        def forward_hook(module, input, output):
            self.activations = output
            output.register_hook(self.save_gradient)
            
        handle = target_layer.register_forward_hook(forward_hook)
        
        # Forward and backward pass
        output = model(image_tensor)
        model.zero_grad()
        output.backward()
        handle.remove()
        
        # Compute CAM
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        for i in range(self.activations.shape[1]):
            self.activations[:, i, :, :] *= pooled_gradients[i]
            
        heatmap = torch.mean(self.activations, dim=1).squeeze()
        heatmap = F.relu(heatmap)
        heatmap /= torch.max(heatmap)
        
        # Overlay
        heatmap_np = heatmap.cpu().detach().numpy()
        heatmap_resized = cv2.resize(heatmap_np, (original_image_np.shape[1], original_image_np.shape[0]))
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        
        # Original is grayscale, convert to BGR to blend
        original_bgr = cv2.cvtColor(original_image_np, cv2.COLOR_GRAY2BGR)
        superimposed = cv2.addWeighted(original_bgr, 0.5, heatmap_colored, 0.5, 0)
        
        _, buffer = cv2.imencode('.png', superimposed)
        return base64.b64encode(buffer).decode('utf-8')
```
""",

    "3.3.md": """# Step 3.3: Neural Diagnostics Frontend UI (Code Implementation)

## 1. Diagnostics Dashboard (`stich/app/diagnostics/page.tsx`)
```tsx
"use client";
import { useState } from 'react';
import axios from 'axios';

export default function DiagnosticsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [heatmap, setHeatmap] = useState("");
    const [score, setScore] = useState(null);

    const runDiagnostic = async () => {
        const formData = new FormData();
        formData.append("image", file!);
        formData.append("model_name", "paqnet");
        formData.append("weight_file", "best_paqnet.pth"); // From dropdown in reality

        const res = await axios.post("http://localhost:8000/api/v1/inference/diagnose", formData);
        setScore(res.data.score);
        setHeatmap(res.data.heatmap_base64);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Neural Diagnostics (Grad-CAM)</h1>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="my-4" />
            <button onClick={runDiagnostic} className="bg-blue-600 text-white px-4 py-2 rounded">Diagnose Image</button>

            {score !== null && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Predicted Quality Score</h2>
                        <p className="text-4xl text-green-600">{Number(score).toFixed(4)}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Grad-CAM Heatmap</h2>
                        <img src={`data:image/png;base64,${heatmap}`} alt="Heatmap" className="w-full h-auto rounded shadow-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}
```
""",

    "4.1.md": """# Step 4.1: Database & Experiment History (Code Implementation)

## 1. SQLAlchemy Setup (`app/core/database.py`)
```python
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("sqlite:///../experiments.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ExperimentRecord(Base):
    __tablename__ = "experiments"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    target_metric = Column(String)
    final_mae = Column(Float)
    final_pearson = Column(Float)

Base.metadata.create_all(bind=engine)
```
""",

    "4.2.md": """# Step 4.2: Export & Reporting Engine (Code Implementation)

## 1. CSV Generation (`app/api/routes/export.py`)
```python
from fastapi import APIRouter
from fastapi.responses import FileResponse
import pandas as pd
import os

router = APIRouter()

@router.post("/export/csv")
def export_csv(results: list):
    df = pd.DataFrame(results)
    path = "../reports/latest_export.csv"
    os.makedirs("../reports", exist_ok=True)
    df.to_csv(path, index=False)
    return FileResponse(path, filename="PAT_IQA_Export.csv")
```
""",

    "4.3.md": """# Step 4.3: Frontend Polish & Finalization

## 1. Unified Layout
In `stich/app/layout.tsx`, wrap the application in a Sidebar layout linking all modules:
```tsx
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        <aside className="w-64 bg-white shadow-md p-4">
            <h1 className="text-xl font-bold mb-8 text-blue-800">PAT-IQA Portal</h1>
            <nav className="flex flex-col space-y-4">
                <Link href="/comparator" className="hover:text-blue-600">Analytical Comparator</Link>
                <Link href="/training" className="hover:text-blue-600">AI Training Studio</Link>
                <Link href="/diagnostics" className="hover:text-blue-600">Neural Diagnostics</Link>
            </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
            {children}
        </main>
      </body>
    </html>
  )
}
```
"""
}

for filename, content in files_content.items():
    file_path = os.path.join(pp2_dir, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Regenerated extremely detailed files for Phase 3 and 4.")
