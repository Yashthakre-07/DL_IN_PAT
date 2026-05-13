import sys
import os
import numpy as np

# Dynamically add the localhost root to sys.path to access metrics.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from models import metrics

class MetricService:
    @staticmethod
    def run_all_metrics(pred_np: np.ndarray, true_np: np.ndarray = None):
        """
        Runs all core metrics (FR and NR).
        Categorizes into Primary, Secondary, No-Reference groups.
        """
        raw_results = metrics.compute_all_metrics(pred_np, true_np)
        
        # Format the output into Primary, Secondary
        formatted = {
            "Primary": {},
            "Secondary": {},
            "Region": {}  # Placeholder for SNR, CNR
        }
        
        primary_keys = ["PSNR", "SSIM", "MS-SSIM", "IW-SSIM", "S3IM", "HAARPSI", "FSIM", "GMSD", "MS-GMSD", "VIF", "UQI"]
        
        for k, v in raw_results.items():
            if k in primary_keys:
                formatted["Primary"][k] = v
            else:
                # Group others (FSIM, VIFP, UQI, VSI, SR-SIM, etc.) into Secondary
                formatted["Secondary"][k] = v
                
        return formatted
