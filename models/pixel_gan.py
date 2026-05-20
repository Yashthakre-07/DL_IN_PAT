import torch
import torch.nn as nn
import torch.nn.functional as F
from models.unet_fdunet import PixelDL # Importing the audited Pixel-DL backbone

class PatchGANDiscriminator(nn.Module):
    """
    Exact implementation of the Discriminator from the research diagram.
    Stages: 128x128x1 -> 64x64x64 -> 32x32x128 -> 16x16x256 -> 16x16x256 -> 16x16x1
    """
    def __init__(self, in_channels=1):
        super().__init__()
        
        # 1. 4x4 conv + Leaky ReLU
        self.conv1 = nn.Sequential(
            nn.Conv2d(in_channels, 64, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True)
        )
        
        # 2. 4x4 conv + BN + Leaky ReLU (32x32x128)
        self.conv2 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True)
        )
        
        # 3. 4x4 conv + BN + Leaky ReLU (16x16x256)
        self.conv3 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True)
        )
        
        # 4. 4x4 conv + BN + Leaky ReLU (Final feature map)
        self.conv4 = nn.Sequential(
            nn.Conv2d(256, 256, kernel_size=4, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True)
        )
        
        # 5. Final Patch Output + Sigmoid
        self.patch_out = nn.Sequential(
            nn.Conv2d(256, 1, kernel_size=4, stride=1, padding=1),
            nn.Sigmoid()
        )

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        return self.patch_out(x)

class PixelGAN(nn.Module):
    """
    PixelGAN with Pixel-DL Generator Backbone.
    """
    def __init__(self, n_sensors=64, out_channels=1):
        super().__init__()
        self.generator = PixelDL(in_channels=n_sensors, out_channels=out_channels)
        self.discriminator = PatchGANDiscriminator(in_channels=out_channels)

    def forward(self, x):
        return self.generator(x)

class PixelCGAN(nn.Module):
    """
    Conditional PixelGAN. 
    Discriminator concatenates input wave-field (32 channels) with image (1 channel).
    """
    def __init__(self, n_sensors=32, out_channels=1):
        super().__init__()
        self.generator = PixelDL(in_channels=n_sensors, out_channels=out_channels)
        # Discriminator takes [Image(1) + Input(32)] = 33 channels
        self.discriminator = PatchGANDiscriminator(in_channels=out_channels + n_sensors)

    def forward(self, x):
        return self.generator(x)

# Aliases for compatibility with training and inference services
PixelGANGenerator = PixelGAN
PixelCGANGenerator = PixelCGAN
