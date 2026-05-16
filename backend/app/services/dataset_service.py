import os
import zipfile
import pandas as pd
import torch
import numpy as np
try:
    import h5py
except ImportError:
    h5py = None
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from torchvision import transforms

class PhotoacousticDataset(Dataset):
    """Handles both Score labels and Image labels for single-input models"""
    def __init__(self, image_paths, labels, transform=None, is_reconstruction=False):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        self.is_reconstruction = is_reconstruction

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("L")
        if self.transform: image = self.transform(image)
        
        label_val = self.labels[idx]
        if self.is_reconstruction and isinstance(label_val, str) and os.path.exists(label_val):
            # Target is an image
            target = Image.open(label_val).convert("L")
            if self.transform: target = self.transform(target)
            return image, target
        else:
            # Target is a score
            try:
                score = float(label_val)
            except:
                score = 0.0
            return image, torch.tensor(score, dtype=torch.float32)

class PhotoacousticDualDataset(Dataset):
    """Handles Y-Net style dual inputs from ZIP archives"""
    def __init__(self, image_paths, signal_paths, labels, transform=None, is_reconstruction=False):
        self.image_paths = image_paths
        self.signal_paths = signal_paths
        self.labels = labels
        self.transform = transform
        self.is_reconstruction = is_reconstruction

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("L")
        if self.transform: image = self.transform(image)
            
        sig_path = self.signal_paths[idx]
        signal = Image.open(sig_path).convert("L")
        if self.transform: signal = self.transform(signal)
            
        label_val = self.labels[idx]
        if self.is_reconstruction and isinstance(label_val, str) and os.path.exists(label_val):
            target = Image.open(label_val).convert("L")
            if self.transform: target = self.transform(target)
            return (image, signal), target
        else:
            try:
                score = float(label_val)
            except:
                score = 0.0
            return (image, signal), torch.tensor(score, dtype=torch.float32)

class H5Dataset(Dataset):
    """HDF5 / OADAT Benchmark Loader"""
    def __init__(self, h5_path, model_name, transform=None):
        if h5py is None: raise ImportError("h5py missing.")
        self.h5_path = h5_path
        self.model_name = model_name.lower()
        self.transform = transform
        
        with h5py.File(self.h5_path, 'r') as f:
            self.keys = list(f.keys())
            self.length = len(f[self.keys[0]])
            self.img_key = self._find_key(f, ['linear_BP', 'ms_lv128_BP', 'reconstruction', 'image', 'reconstructed'])
            self.sig_key = self._find_key(f, ['linear_raw', 'ms_lv128_raw', 'sinogram', 'raw', 'signal'])
            self.label_key = self._find_key(f, ['ground_truth', 'labels', 'score', 'gt'])

    def _find_key(self, f, possibilities):
        for p in possibilities:
            if p in f: return p
        return None

    def _normalize(self, data):
        data = data.astype(np.float32)
        dmin, dmax = np.min(data), np.max(data)
        if dmax - dmin > 1e-8:
            data = (data - dmin) / (dmax - dmin)
        else:
            data = np.zeros_like(data)
        return (data * 255).astype(np.uint8)

    def __len__(self):
        return self.length

    def __getitem__(self, idx):
        with h5py.File(self.h5_path, 'r') as f:
            img_raw = np.array(f[self.img_key][idx])
            img_norm = self._normalize(img_raw)
            img_pil = Image.fromarray(img_norm).convert("L")
            if self.transform: img_tensor = self.transform(img_pil)
            
            label_data = np.array(f[self.label_key][idx])
            if label_data.ndim >= 2:
                label_norm = self._normalize(label_data)
                label_pil = Image.fromarray(label_norm).convert("L")
                if self.transform: label_tensor = self.transform(label_pil)
            else:
                if label_data.ndim > 0: label_data = np.mean(label_data)
                label_tensor = torch.tensor(label_data, dtype=torch.float32)

            if "ynet" in self.model_name:
                sig_raw = np.array(f[self.sig_key][idx])
                sig_norm = self._normalize(sig_raw)
                sig_pil = Image.fromarray(sig_norm).convert("L")
                if self.transform: sig_tensor = self.transform(sig_pil)
                return (img_tensor, sig_tensor), label_tensor
            
            return img_tensor, label_tensor

class DatasetService:
    def __init__(self, upload_dir="../data/temp"):
        self.upload_dir = os.path.abspath(upload_dir)
        os.makedirs(self.upload_dir, exist_ok=True)
        self.transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor()
        ])

    def process_file(self, file_path: str, model_name: str):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.h5': return file_path, "h5"
        elif ext == '.zip': return self._process_zip(file_path, model_name), "zip"
        else: raise ValueError(f"Unsupported format: {ext}")

    def _process_zip(self, zip_path: str, model_name: str):
        folder_name = os.path.basename(zip_path).replace(".zip", "")
        extract_dir = os.path.join(self.upload_dir, "extracted", folder_name)
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            
        csv_path = os.path.join(extract_dir, "metadata.csv")
        if not os.path.exists(csv_path):
            for root, dirs, files in os.walk(extract_dir):
                if "metadata.csv" in files:
                    csv_path = os.path.join(root, "metadata.csv")
                    extract_dir = root
                    break
        
        if not os.path.exists(csv_path): raise ValueError("No metadata.csv found.")
            
        df = pd.read_csv(csv_path)
        is_reconstruction = any(x in model_name.lower() for x in ["unet", "fdunet", "pixeldl", "ynet", "gan"])
        
        # Identify columns
        df['full_path'] = df['image_path'].apply(lambda p: os.path.join(extract_dir, str(p)))
        if 'signal_path' in df.columns:
            df['full_sig_path'] = df['signal_path'].apply(lambda p: os.path.join(extract_dir, str(p)))
        
        # If reconstruction, 'score' column might actually be 'target_image_path'
        if is_reconstruction and 'target_path' in df.columns:
            df['full_label'] = df['target_path'].apply(lambda p: os.path.join(extract_dir, str(p)))
        else:
            df['full_label'] = df['score'] # Could be float or path

        return df

    def create_dataloaders(self, data, format_type, model_name, batch_size=16):
        is_reconstruction = any(x in model_name.lower() for x in ["unet", "fdunet", "pixeldl", "ynet", "gan"])
        if format_type == "h5":
            full_ds = H5Dataset(data, model_name, self.transform)
            train_size = int(0.7 * len(full_ds))
            val_size = len(full_ds) - train_size
            train_ds, val_ds = torch.utils.data.random_split(full_ds, [train_size, val_size])
        else:
            df = data
            from sklearn.model_selection import train_test_split
            train_df, val_df = train_test_split(df, test_size=0.3, random_state=42)
            is_dual = "ynet" in model_name.lower()
            if is_dual:
                train_ds = PhotoacousticDualDataset(train_df['full_path'].values, train_df['full_sig_path'].values, train_df['full_label'].values, self.transform, is_reconstruction)
                val_ds = PhotoacousticDualDataset(val_df['full_path'].values, val_df['full_sig_path'].values, val_df['full_label'].values, self.transform, is_reconstruction)
            else:
                train_ds = PhotoacousticDataset(train_df['full_path'].values, train_df['full_label'].values, self.transform, is_reconstruction)
                val_ds = PhotoacousticDataset(val_df['full_path'].values, val_df['full_label'].values, self.transform, is_reconstruction)
        
        return {
            "train": DataLoader(train_ds, batch_size=batch_size, shuffle=True),
            "val": DataLoader(val_ds, batch_size=batch_size, shuffle=False)
        }
