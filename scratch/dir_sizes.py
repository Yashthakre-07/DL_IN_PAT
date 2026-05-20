import os

def get_dir_size(path):
    total = 0
    try:
        for entry in os.scandir(path):
            if entry.is_file(follow_symlinks=False):
                total += entry.stat().st_size
            elif entry.is_dir(follow_symlinks=False):
                total += get_dir_size(entry.path)
    except Exception:
        pass
    return total

root = "."
dirs = []
for entry in os.scandir(root):
    if entry.is_dir(follow_symlinks=False):
        size = get_dir_size(entry.path)
        dirs.append((entry.name, size))

dirs.sort(key=lambda x: x[1], reverse=True)
for name, size in dirs:
    print(f"{name}: {size / (1024**3):.2f} GB ({size:,} bytes)")
