import h5py
import numpy as np

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\data\SCD_RawBP-mini.h5"

try:
    with h5py.File(file_path, 'r') as f:
        print(f"Structure of {file_path}:")
        for key in f.keys():
            data = f[key]
            if isinstance(data, h5py.Dataset):
                print(f"  Dataset: {key}")
                print(f"    Shape: {data.shape}")
                print(f"    Dtype: {data.dtype}")
                # Check a sample
                sample = data[0]
                print(f"    Sample Range: [{np.min(sample)}, {np.max(sample)}]")
            else:
                print(f"  Group: {key}")
except Exception as e:
    print(f"Error analyzing file: {e}")
