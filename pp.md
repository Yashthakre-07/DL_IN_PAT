# Localhost PAT-IQA Web Platform: Ultra-Detailed 4-Phase Master Plan

## 📁 System Architecture & Directory Structure
To maintain a clean, modular, and professional codebase, we have separated concerns into specific folders:
*   **`stich/`**: The Frontend UI layer (React/Next.js/HTML interface). Handles all user interactions, file drops, and data visualization.
*   **`backend/`**: The Backend layer (FastAPI). Handles API routing, request validation, and acts as the bridge between the UI and the ML models.
*   **`models/`**: The Neural Network definitions (`paqnet.py`, `iqdcnn.py`, `efficientnet_iqa.py`, `metrics.py`).
*   **`saved_models/`**: The Model Vault. Stores the actual `.pth` trained weight files and the `registry.json` tracking them.
*   **`pp2/`**: The Execution Manual. Contains line-by-line, step-by-step documentation for building the platform (Files 1.1 to 4.5).

---

## 🚀 Phase 1: Foundation & API Boilerplate (Backend Setup)
*Goal: Establish the robust FastAPI server and connect the existing model definitions to API endpoints.*
*   **Step 1.1:** Initialize FastAPI in the `backend/` folder and configure CORS to allow the `stich/` UI to communicate with it.
*   **Step 1.2:** Create the Model Loading API. Create an endpoint that reads `saved_models/registry.json` and loads the requested model using `model_manager.py`.
*   **Step 1.3:** Create the Metrics Calculation API. Expose an endpoint that takes predicted and true arrays and runs them through `metrics.py` to return all 13 metrics.
*   **Step 1.4:** Establish Image Upload logic. Create an endpoint to receive photoacoustic image data, preprocess it to tensors, and prepare it for inference.

## 🧠 Phase 2: The Inference Engine (Phase 3 of Paper)
*Goal: Build the core functionality where users can upload an image and get instant quality scores.*
*   **Step 2.1:** Develop the Inference Endpoint. This endpoint receives an image, passes it through the loaded PAQNet/EfficientNet model, and returns the predicted PSNR/SSIM.
*   **Step 2.2:** Multi-Metric Support. Extend the inference logic to handle the `Multi` models (e.g., `paqnet_multi.py`) which output 3+ metrics simultaneously.
*   **Step 2.3:** Error Handling & Validation. Ensure the API gracefully handles invalid image shapes, missing channels, or out-of-memory errors (OOM).
*   **Step 2.4:** Connect Frontend Inference UI. Build the UI in `stich/` where a user uploads an image and the API response (score) is displayed dynamically.

## 🎓 Phase 3: The Training Studio (Phase 1 & 2 of Paper)
*Goal: Allow users to upload a custom dataset and train/fine-tune models directly from the UI.*
*   **Step 3.1:** Dataset Ingestion Pipeline. Create a backend service to accept a zip file of images, unzip, and split them (70/15/15) as we did locally.
*   **Step 3.2:** Training Loop API. Expose a WebSocket or background task API that starts the PyTorch training loop (using Huber Loss, MAE, etc.) and streams progress back to the UI.
*   **Step 3.3:** Real-time Loss Visualization. Build the UI graph in `stich/` that plots the training/validation loss dynamically via WebSocket data.
*   **Step 3.4:** Model Saving Automation. Once training hits the epoch limit, automatically save the `.pth` to `saved_models/` and update `registry.json` using our `model_manager.py`.

## 🔍 Phase 4: Neural Diagnostics & Grad-CAM (Phase 4 of Paper)
*Goal: Provide interpretability so researchers understand *why* the AI predicted a specific quality score.*
*   **Step 4.1:** Grad-CAM Integration. Implement the PyTorch hook logic in the backend to extract gradients from the final convolutional layer of the active model.
*   **Step 4.2:** Heatmap Generation. Overlay the extracted gradients onto the original photoacoustic image to create a visual heatmap.
*   **Step 4.3:** Diagnostic API Endpoint. Create an endpoint `/api/diagnostics/gradcam` that runs inference AND generates the heatmap simultaneously.
*   **Step 4.4:** Frontend Interpretability Dashboard. Build the UI in `stich/` to display the original image side-by-side with the Grad-CAM heatmap.
*   **Step 4.5:** Final System Integration & Polish. Ensure all modules (Inference, Training, Diagnostics) flow seamlessly together in the web portal.
