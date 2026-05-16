import torch
import torch.nn as nn
import torch.nn.functional as F

class DenseLayer(nn.Module):
    def __init__(self, in_channels, growth_rate):
        super().__init__()
        self.net = nn.Sequential(
            nn.BatchNorm2d(in_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels, growth_rate, kernel_size=3, padding=1, bias=False)
        )
    def forward(self, x): return torch.cat([x, self.net(x)], 1)

class DenseBlock(nn.Module):
    def __init__(self, in_channels, num_layers, growth_rate):
        super().__init__()
        layers = []
        for i in range(num_layers):
            layers.append(DenseLayer(in_channels + i * growth_rate, growth_rate))
        self.block = nn.Sequential(*layers)
    def forward(self, x): return self.block(x)

class PixelDL(nn.Module):
    """
    Exact implementation of the 4-stage Dense U-Net (Pixel-DL) from the provided diagram.
    Levels: 64 -> 128 -> 256 -> 512 -> 1024
    """
    def __init__(self, in_channels=64, out_channels=1):
        super(PixelDL, self).__init__()
        
        # Encoder
        self.entry = nn.Sequential(nn.Conv2d(in_channels, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True))
        
        self.db1 = DenseBlock(32, 4, 8) # Out: 64
        self.pool1 = nn.MaxPool2d(2)
        
        self.db2 = DenseBlock(64, 4, 16) # Out: 128
        self.pool2 = nn.MaxPool2d(2)
        
        self.db3 = DenseBlock(128, 4, 32) # Out: 256
        self.pool3 = nn.MaxPool2d(2)
        
        self.db4 = DenseBlock(256, 4, 64) # Out: 512
        self.pool4 = nn.MaxPool2d(2)
        
        # Bottleneck
        self.bottleneck = DenseBlock(512, 4, 128) # Out: 1024
        
        # Decoder (Using Deconv as per diagram legend)
        self.up4 = nn.Sequential(nn.ConvTranspose2d(1024, 512, 2, stride=2), nn.BatchNorm2d(512), nn.ReLU(inplace=True))
        self.db_up4 = DenseBlock(512 + 512, 2, 64) # Concatenation
        
        self.up3 = nn.Sequential(nn.ConvTranspose2d(640, 256, 2, stride=2), nn.BatchNorm2d(256), nn.ReLU(inplace=True))
        self.db_up3 = DenseBlock(256 + 256, 2, 32)
        
        self.up2 = nn.Sequential(nn.ConvTranspose2d(320, 128, 2, stride=2), nn.BatchNorm2d(128), nn.ReLU(inplace=True))
        self.db_up2 = DenseBlock(128 + 128, 2, 16)
        
        self.up1 = nn.Sequential(nn.ConvTranspose2d(160, 64, 2, stride=2), nn.BatchNorm2d(64), nn.ReLU(inplace=True))
        self.db_up1 = DenseBlock(64 + 64, 2, 8)
        
        self.final = nn.Sequential(
            nn.Conv2d(80, 32, 1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.Conv2d(32, out_channels, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        e0 = self.entry(x)
        e1 = self.db1(e0)
        e2 = self.db2(self.pool1(e1))
        e3 = self.db3(self.pool2(e2))
        e4 = self.db4(self.pool3(e3))
        
        bn = self.bottleneck(self.pool4(e4))
        
        d4 = self.db_up4(torch.cat([self.up4(bn), e4], 1))
        d3 = self.db_up3(torch.cat([self.up3(d4), e3], 1))
        d2 = self.db_up2(torch.cat([self.up2(d3), e2], 1))
        d1 = self.db_up1(torch.cat([self.up1(d2), e1], 1))
        
        return self.final(d1)

# [Keeping other models like UNet, YNet, etc. here...]
