import requests
import numpy as np
import cv2
import os

# Create a dummy image
img = np.random.randint(0, 255, (256, 256), dtype=np.uint8)
cv2.imwrite('test_img.png', img)
cv2.imwrite('ref_img.png', img)

url = "http://localhost:8000/api/v1/comparator/evaluate"

files = {
    'test_image': open('test_img.png', 'rb'),
    'reference_image': open('ref_img.png', 'rb')
}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Metrics returned:")
        for category, metrics in data.get('metrics', {}).items():
            print(f"  {category}:")
            for m, v in metrics.items():
                print(f"    {m}: {v}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Cleanup
os.remove('test_img.png')
os.remove('ref_img.png')
