# 🧬 Bio-Synapse AI: Deep Learning in Photoacoustic Tomography (PAT)

![Platform](https://img.shields.io/badge/Platform-Bio--Synapse%20AI-10b981?style=for-the-badge)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Status](https://img.shields.io/badge/Status-Research%20Beta-6366f1?style=for-the-badge)

**Bio-Synapse AI** is a high-fidelity, physics-informed neural reconstruction and diagnostic operating system designed for **Photoacoustic Tomography (PAT)**. By leveraging dense network topologies and adversarial optimization, the platform transforms raw, noisy transducer signals (wave-fields) into pristine, artifact-free representations of human vasculature.

---

## ✨ Core Capabilities

*   **🧪 High-Fidelity Reconstruction**: Generate clinical-grade photoacoustic images from raw acoustic sensor arrays using state-of-the-art Deep Learning models.
*   **⚙️ Neural Studio (UI)**: An ultra-modern, cinematic web interface for managing training pipelines, diagnosing model convergence, and visualizing neural architectures.
*   **🔬 Adversarial Optimization**: Utilize PatchGAN-driven generative adversarial networks to recover high-frequency spatial details and suppress acoustic artifacts.
*   **📊 Automated Quality Assessment**: Evaluate generated reconstructions instantly against ground-truth images using established scientific metrics.

---

## 🧠 Neural Architectures

The platform features a comprehensive suite of rigorously audited neural networks, categorized by their primary function within the photoacoustic pipeline.

### 1. Physics-Informed Reconstruction Models
These models map raw sensor data or low-quality back-projection (BP) images to high-quality reconstructions.

*   **Pixel-DL (Dense-UNet)**: A deep, 4-stage symmetric U-Net with Dense Blocks (scaling from 64 to 1024 channels). Designed specifically to integrate wave propagation physics with dense feature extraction.
*   **U-Net**: The foundational architecture for biomedical image segmentation and reconstruction, enhanced with smooth bilinear upsampling to eliminate checkerboard artifacts.
*   **FD-UNet (Fully Dense U-Net)**: Incorporates dense connectivity throughout all encoder and decoder stages to maximize gradient flow and multi-scale feature reuse.
*   **Y-Net**: A specialized dual-encoder architecture designed to process multiple distinct priors simultaneously.
*   **FD-YNet (Fully Dense Y-Net)**: Combines the dual-pathway approach of Y-Net with the extreme feature propagation of FD-UNet.

### 2. Adversarial Generative Models
These architectures focus on pushing the boundaries of image fidelity by penalizing unrealistic local features.

*   **PixelGAN**: Uses the **Pixel-DL Dense-UNet** as its generator backbone, coupled with a **16x16 PatchGAN Discriminator** to enforce fine-grained, patch-level realism on delicate vessel structures.
*   **PixelCGAN (Conditional GAN)**: An advanced conditional architecture where the discriminator fuses the 1-channel generated reconstruction with the original **32-channel raw sensor wave-field**. This ensures the final image is perfectly physically consistent with the original acoustic event.

### 3. Diagnostic & Quality Assessment Models
Networks designed to evaluate and score the output of the reconstruction models.

*   **PAQNet**: Evaluates the perceptual and structural quality of a photoacoustic image.
*   **IQDCNN**: A multi-task diagnostic network for deeper image quality characterization.

---

## 📈 Evaluation Metrics

To ensure clinical viability, trained models are evaluated on strict structural and perceptual metrics:
*   **PSNR (Peak Signal-to-Noise Ratio)**: Measures the ratio between the maximum possible power of the true signal and the power of corrupting noise.
*   **SSIM (Structural Similarity Index)**: A perception-based model that considers image degradation as a perceived change in structural information, crucial for assessing vessel integrity.
*   **MSE / L1 Loss**: Used during the optimization of the deep neural backbones.

---

## 🚀 Getting Started

### 1. Initialize the Environment
The repository comes with automated launch scripts for the complete environment (Python backend + Next.js frontend).

**Windows:**
```bash
./runit.ps1
```
*(Or simply double-click `runit.bat`)*

### 2. The Bio-Synapse Workflow
1.  **Ingest Data**: Upload your `.h5` datasets (e.g., OADAT subsets) via the Dataset interface.
2.  **Select Architecture**: Navigate to the **Architecture Lab** to visualize the flow of the network (e.g., viewing the deep U-shape of Pixel-DL).
3.  **Train the Model**: Launch a training job in the **Neural Studio**. Monitor the live convergence dashboard, GPU telemetry, and PSNR metrics.
4.  **Generate & Diagnose**: Deploy the trained `.pth` weights to generate high-fidelity images. Compare the generated artifacts against Ground Truth using the built-in diagnostic tools.

---

## 🧬 System Architecture Details
*   **Backend Engine**: FastAPI, PyTorch (CUDA Enabled)
*   **Frontend UI**: Next.js 14, React, TailwindCSS, Framer Motion
*   **Database**: SQLite (Training telemetry and Model registry)
*   **Data Handling**: HDF5 (`h5py`) and optimized ZIP extraction routines.

---

*Built for the future of computational photoacoustics.*
