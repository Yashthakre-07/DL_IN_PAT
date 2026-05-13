import numpy as np
import cv2
import torch
import piq
from phasepack import phasecong as pc
from sewar.full_ref import vifp, uqi, msssim
from skimage.filters import threshold_local
from skimage.metrics import peak_signal_noise_ratio, structural_similarity
from PIL import Image

# ==========================================
# FULL REFERENCE METRICS (FR)
# ==========================================

def calculate_psnr(y_pred, y_true):
    # Using piq for consistency
    return piq.psnr(y_pred, y_true, data_range=1.0).item()

def calculate_ssim(y_pred, y_true):
    return piq.ssim(y_pred, y_true, data_range=1.0).item()

def calculate_msssim(y_pred, y_true):
    return piq.multi_scale_ssim(y_pred, y_true, data_range=1.0).item()

def calculate_iwssim(y_pred, y_true):
    return piq.information_weighted_ssim(y_pred, y_true, data_range=1.0).item()

def calculate_vifp(y_pred, y_true):
    return piq.vif_p(y_pred, y_true, data_range=1.0).item()

def calculate_gmsd(y_pred, y_true):
    return piq.gmsd(y_pred, y_true, data_range=1.0).item()

def calculate_msgmsd(y_pred, y_true):
    return piq.multi_scale_gmsd(y_pred, y_true, data_range=1.0).item()

def calculate_haarpsi(y_pred, y_true):
    return piq.haarpsi(y_pred, y_true, data_range=1.0).item()

def calculate_uqi(org_img, pred_img):
    # Sewar implementation (works on numpy)
    return uqi(org_img, pred_img)

def calculate_s3im(org_img, pred_img):
    # Custom Photoacoustic implementation
    neighborhood_size = (org_img.shape[0] // 16) * 2 + 1
    sensitivity = 0.5
    level1 = threshold_local(org_img, neighborhood_size, method='gaussian', offset=sensitivity)
    level2 = threshold_local(pred_img, neighborhood_size, method='gaussian', offset=sensitivity)
    mask1 = org_img > level1
    mask2 = pred_img > level2
    mask = np.logical_or(mask1, mask2)
    masked_img1 = org_img * mask
    masked_img2 = pred_img * mask
    ssim_map = structural_similarity(masked_img1, masked_img2, data_range=org_img.max() - org_img.min(), full=True)[1]
    s3im_map = ssim_map * mask.astype(np.float64)
    return np.sum(s3im_map) / np.sum(mask) if np.any(mask) else 0

def calculate_fsim(org_img, pred_img, T1=0.85, T2=160):
    # Custom Photoacoustic implementation
    def _similarity_measure(x, y, constant):
        return (2 * x * y + constant) / (x**2 + y**2 + constant)
    def _gradient_magnitude(img):
        scharrx = cv2.Scharr(img, cv2.CV_16U, 1, 0)
        scharry = cv2.Scharr(img, cv2.CV_16U, 0, 1)
        return np.sqrt(scharrx**2 + scharry**2)
    pc1 = pc(org_img, nscale=4, minWaveLength=6, mult=2, sigmaOnf=0.5978)
    pc2 = pc(pred_img, nscale=4, minWaveLength=6, mult=2, sigmaOnf=0.5978)
    pc1_sum = sum(pc1[4])
    pc2_sum = sum(pc2[4])
    gm1 = _gradient_magnitude(org_img)
    gm2 = _gradient_magnitude(pred_img)
    S_pc = _similarity_measure(pc1_sum, pc2_sum, T1)
    S_g = _similarity_measure(gm1, gm2, T2)
    return np.sum(S_pc * S_g * np.maximum(pc1_sum, pc2_sum)) / np.sum(np.maximum(pc1_sum, pc2_sum))


# ==========================================
# MASTER CALCULATION FUNCTION
# ==========================================

def compute_all_metrics(pred_np, true_np=None):
    """
    Computes all core metrics for the photoacoustic project.
    Input: numpy arrays (H, W) or (C, H, W) in range [0, 1].
    """
    # Prepare tensors for piq (B, C, H, W)
    p_torch = torch.from_numpy(pred_np).float()
    if p_torch.ndim == 2: p_torch = p_torch.unsqueeze(0).unsqueeze(0)
    elif p_torch.ndim == 3: p_torch = p_torch.unsqueeze(0)
    
    results = {}
    
    # Full-Reference Metrics
    if true_np is not None:
        t_torch = torch.from_numpy(true_np).float()
        if t_torch.ndim == 2: t_torch = t_torch.unsqueeze(0).unsqueeze(0)
        elif t_torch.ndim == 3: t_torch = t_torch.unsqueeze(0)
        
        results["PSNR"] = calculate_psnr(p_torch, t_torch)
        results["SSIM"] = calculate_ssim(p_torch, t_torch)
        results["MS-SSIM"] = calculate_msssim(p_torch, t_torch)
        results["IW-SSIM"] = calculate_iwssim(p_torch, t_torch)
        results["VIF"] = calculate_vifp(p_torch, t_torch)
        results["GMSD"] = calculate_gmsd(p_torch, t_torch)
        results["MS-GMSD"] = calculate_msgmsd(p_torch, t_torch)
        results["HAARPSI"] = calculate_haarpsi(p_torch, t_torch)
        
        # custom/sewar based (use numpy)
        results["UQI"] = calculate_uqi(true_np, pred_np)
        results["S3IM"] = calculate_s3im(true_np, pred_np)
        results["FSIM"] = calculate_fsim(true_np, pred_np)

    return results
