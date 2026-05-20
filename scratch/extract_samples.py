import h5py
import numpy as np
import cv2
import os

h5_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\data\SCD_RawBP-mini.h5"
output_dir = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\data\samples"
os.makedirs(output_dir, exist_ok=True)

def normalize(data):
    data = data.astype(np.float32)
    dmin, dmax = np.min(data), np.max(data)
    if dmax - dmin > 1e-8:
        return ((data - dmin) / (dmax - dmin) * 255).astype(np.uint8)
    return np.zeros_like(data).astype(np.uint8)

try:
    with h5py.File(h5_path, 'r') as f:
        # Extract first 3 samples
        num_samples = min(3, len(f['linear_BP']))
        
        print(f"Extracting {num_samples} samples from {h5_path}...")
        
        for i in range(num_samples):
            # Extract Image (linear_BP)
            img_data = f['linear_BP'][i]
            img_norm = normalize(img_data)
            img_path = os.path.join(output_dir, f"sample_{i}_image.png")
            cv2.imwrite(img_path, img_norm)
            
            # Extract Signal (linear_raw)
            sig_data = f['linear_raw'][i]
            sig_norm = normalize(sig_data)
            sig_path = os.path.join(output_dir, f"sample_{i}_signal.png")
            cv2.imwrite(sig_path, sig_norm)
            
            # Extract Ground Truth
            gt_data = f['ground_truth'][i]
            gt_norm = normalize(gt_data)
            gt_path = os.path.join(output_dir, f"sample_{i}_gt.png")
            cv2.imwrite(gt_path, gt_norm)
            
            print(f"  - Sample {i} saved: image, signal, and gt.")
            
    print(f"\nExtraction complete! Files are in: {output_dir}")

except Exception as e:
    print(f"Error extracting samples: {e}")
