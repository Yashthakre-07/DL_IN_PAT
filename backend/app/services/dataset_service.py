import os
import zipfile
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from torchvision import transforms

class PhotoacousticDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("L") # Grayscale
        if self.transform:
            image = self.transform(image)
        label = self.labels[idx]
        return image, torch.tensor(label, dtype=torch.float32)

class DatasetService:
    def __init__(self, upload_dir="../data/temp"):
        self.upload_dir = os.path.abspath(upload_dir)
        os.makedirs(self.upload_dir, exist_ok=True)
        self.transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor()
        ])

    def process_zip(self, zip_path: str):
        # Use a unique directory for extraction based on the zip filename (which has a UUID prefix now)
        folder_name = os.path.basename(zip_path).replace(".zip", "")
        extract_dir = os.path.join(self.upload_dir, "extracted", folder_name)
        os.makedirs(extract_dir, exist_ok=True)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        except zipfile.BadZipFile:
            raise ValueError("The uploaded file is not a valid ZIP archive.")
            
        # Example logic: Read a metadata.csv inside the zip
        csv_path = os.path.join(extract_dir, "metadata.csv")
        if not os.path.exists(csv_path):
            # Check if it's inside a subfolder (common in some zipping tools)
            items = os.listdir(extract_dir)
            if len(items) == 1 and os.path.isdir(os.path.join(extract_dir, items[0])):
                extract_dir = os.path.join(extract_dir, items[0])
                csv_path = os.path.join(extract_dir, "metadata.csv")
            
            if not os.path.exists(csv_path):
                raise ValueError("metadata.csv missing in dataset zip. Root or one-level deep check failed.")
            
        try:
            df = pd.read_csv(csv_path)
        except Exception as e:
            raise ValueError(f"Failed to parse metadata.csv: {str(e)}")
            
        required_cols = ['image_path', 'score']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"metadata.csv is missing required columns: {required_cols}")
            
        # 70/15/15 split logic (from paper)
        from sklearn.model_selection import train_test_split
        train_df, temp_df = train_test_split(df, test_size=0.3, random_state=42)
        val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=42)
        
        def resolve_path(p):
            full = os.path.join(extract_dir, p)
            if not os.path.exists(full):
                # Try relative to the directory containing metadata.csv
                return full 
            return full

        train_df['full_path'] = train_df['image_path'].apply(resolve_path)
        val_df['full_path'] = val_df['image_path'].apply(resolve_path)
        test_df['full_path'] = test_df['image_path'].apply(resolve_path)
        
        # Quick validation of first path
        if not os.path.exists(train_df['full_path'].iloc[0]):
             raise ValueError(f"Image path validation failed. Could not find: {train_df['full_path'].iloc[0]}")

        return train_df, val_df, test_df


    def create_dataloaders(self, train_df, val_df, test_df, batch_size=16):
        train_ds = PhotoacousticDataset(train_df['full_path'].values, train_df['score'].values, self.transform)
        val_ds = PhotoacousticDataset(val_df['full_path'].values, val_df['score'].values, self.transform)
        
        return {
            "train": DataLoader(train_ds, batch_size=batch_size, shuffle=True),
            "val": DataLoader(val_ds, batch_size=batch_size, shuffle=False)
        }
