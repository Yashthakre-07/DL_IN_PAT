import os
import re

file_path = r"c:\Users\Admin\Documents\DL_IN_PAT\localhost\stich\app\models\architecture\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

unet_obj = """
    unet: {
        id: 'unet',
        title: "U-Net",
        subtitle: "Standard U-Net Architecture",
        summary: "Classic fully convolutional network for photoacoustic image reconstruction and semantic segmentation.",
        isUshaped: true,
        layers: [
            { type: 'input', label: 'Input Image', details: '1x128x128', description: 'Raw PA Image.' },
            { type: 'conv', label: 'Conv Block 1', details: '32 Filters', description: 'First convolutional feature extraction.' },
            { type: 'pool', label: 'Downsample 1', details: 'MaxPool 64x64', description: 'Spatial reduction.' },
            { type: 'conv', label: 'Conv Block 2', details: '64 Filters', description: 'Second feature extraction.' },
            { type: 'pool', label: 'Downsample 2', details: 'MaxPool 32x32', description: 'Spatial reduction.' },
            { type: 'conv', label: 'Conv Block 3', details: '128 Filters', description: 'Third feature extraction.' },
            { type: 'pool', label: 'Downsample 3', details: 'MaxPool 16x16', description: 'Spatial reduction.' },
            { type: 'conv', label: 'Conv Block 4', details: '256 Filters', description: 'Fourth feature extraction.' },
            { type: 'pool', label: 'Downsample 4', details: 'MaxPool 8x8', description: 'Spatial reduction.' },
            
            { type: 'conv', label: 'Bottleneck', details: '512 Filters', description: 'Deepest latent space.' },
            
            { type: 'conv', label: 'Up-Conv 4', details: 'ConvTranspose 16x16', description: 'Upsampling step 4.' },
            { type: 'conv', label: 'Conv Block 4', details: '256 Filters', description: 'Decoder convolution.' },
            { type: 'conv', label: 'Up-Conv 3', details: 'ConvTranspose 32x32', description: 'Upsampling step 3.' },
            { type: 'conv', label: 'Conv Block 3', details: '128 Filters', description: 'Decoder convolution.' },
            { type: 'conv', label: 'Up-Conv 2', details: 'ConvTranspose 64x64', description: 'Upsampling step 2.' },
            { type: 'conv', label: 'Conv Block 2', details: '64 Filters', description: 'Decoder convolution.' },
            { type: 'conv', label: 'Up-Conv 1', details: 'ConvTranspose 128x128', description: 'Upsampling step 1.' },
            { type: 'conv', label: 'Conv Block 1', details: '32 Filters', description: 'Decoder convolution.' },
            { type: 'output', label: 'Output Map', details: '1x128x128', description: 'Final reconstructed output.' }
        ] as any
    },
"""

content = content.replace("const architectures: Record<string, any> = {", "const architectures: Record<string, any> = {\n" + unet_obj)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated page.tsx with unet successfully")
