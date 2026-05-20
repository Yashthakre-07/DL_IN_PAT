import os
import pandas as pd
import shutil

# Paths
source_dir = r"c:\Users\Admin\Documents\DL_IN_PAT\photoacoustic-image-quality-assessment\results\Phase_1\SWFD"
images_source = os.path.join(source_dir, "images_used")
csv_source = os.path.join(source_dir, "SWFD_per_image_metrics_2026-05-06_15-32-24.csv")

target_base = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\data"

# Create folders
for size in ["large", "small"]:
    os.makedirs(os.path.join(target_base, size, "images"), exist_ok=True)

# Load CSV
df = pd.read_csv(csv_source)

# Cleanup: remove empty rows if any
df = df.dropna(subset=['image_path'])

# Prepare Large (400 images)
large_df = df.head(400).copy()
large_df['filename'] = large_df['image_path'].apply(lambda x: os.path.basename(x))
large_df['image_path'] = large_df['filename'].apply(lambda x: f"images/{x}")
large_df['score'] = large_df['PSNR'] # Default score

# Copy images for large
for filename in large_df['filename']:
    shutil.copy2(os.path.join(images_source, filename), os.path.join(target_base, "large", "images", filename))

# Save large CSV (dropping temporary filename column)
large_df[['image_path', 'score']].to_csv(os.path.join(target_base, "large", "metadata.csv"), index=False)

# Prepare Small (80 images)
small_df = df.head(80).copy()
small_df['filename'] = small_df['image_path'].apply(lambda x: os.path.basename(x))
small_df['image_path'] = small_df['filename'].apply(lambda x: f"images/{x}")
small_df['score'] = small_df['PSNR']

# Copy images for small
for filename in small_df['filename']:
    shutil.copy2(os.path.join(images_source, filename), os.path.join(target_base, "small", "images", filename))

# Save small CSV
small_df[['image_path', 'score']].to_csv(os.path.join(target_base, "small", "metadata.csv"), index=False)

print("Data preparation complete.")
