import os

def get_dir_info(path):
    num_files = 0
    total_size = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                total_size += os.path.getsize(fp)
                num_files += 1
            except Exception:
                pass
    return num_files, total_size

for entry in os.scandir("data"):
    if entry.is_dir():
        num, size = get_dir_info(entry.path)
        print(f"data/{entry.name}: {num} files, {size / (1024**3):.4f} GB ({size:,} bytes)")
    else:
        print(f"data/{entry.name}: {entry.stat().st_size / (1024**2):.4f} MB")
