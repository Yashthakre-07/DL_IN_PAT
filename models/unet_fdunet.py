import torch
import torch.nn as nn
import torch.nn.functional as F

class UNetBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(UNetBlock, self).__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)

class UNet(nn.Module):
    """
    Standard U-Net Architecture
    """
    def __init__(self, in_channels=1, out_channels=1, features=[32, 64, 128, 256]):
        super(UNet, self).__init__()
        self.encoder = nn.ModuleList()
        self.decoder = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # Encoder
        in_c = in_channels
        for feature in features:
            self.encoder.append(UNetBlock(in_c, feature))
            in_c = feature

        # Bottleneck
        self.bottleneck = UNetBlock(features[-1], features[-1] * 2)

        # Decoder
        for feature in reversed(features):
            self.decoder.append(nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2))
            self.decoder.append(UNetBlock(feature * 2, feature))

        self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)

    def forward(self, x):
        skip_connections = []
        out = x
        for down in self.encoder:
            out = down(out)
            skip_connections.append(out)
            out = self.pool(out)

        out = self.bottleneck(out)
        skip_connections = skip_connections[::-1]

        for i in range(0, len(self.decoder), 2):
            out = self.decoder[i](out)
            skip_connection = skip_connections[i // 2]

            if out.shape != skip_connection.shape:
                out = F.interpolate(out, size=skip_connection.shape[2:], mode="bilinear", align_corners=False)

            concat_skip = torch.cat((skip_connection, out), dim=1)
            out = self.decoder[i + 1](concat_skip)

        return self.final_conv(out)


class DenseLayer(nn.Module):
    def __init__(self, in_channels, growth_rate):
        super(DenseLayer, self).__init__()
        self.conv = nn.Sequential(
            nn.BatchNorm2d(in_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels, growth_rate, kernel_size=3, padding=1, bias=False)
        )

    def forward(self, x):
        out = self.conv(x)
        return torch.cat([x, out], 1)


class DenseBlock(nn.Module):
    def __init__(self, in_channels, num_layers, growth_rate):
        super(DenseBlock, self).__init__()
        layers = []
        for i in range(num_layers):
            layers.append(DenseLayer(in_channels + i * growth_rate, growth_rate))
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)


class TransitionDown(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(TransitionDown, self).__init__()
        self.down = nn.Sequential(
            nn.BatchNorm2d(in_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=False),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

    def forward(self, x):
        return self.down(x)


class FDUNet(nn.Module):
    """
    Fully Dense U-Net (FD-UNet) as described in:
    "Fully Dense UNet for 2D Sparse Photoacoustic Tomography Artifact Removal"
    """
    def __init__(self, in_channels=1, out_channels=1, init_features=32, growth_rate=8, block_layers=4):
        super(FDUNet, self).__init__()
        self.init_conv = nn.Conv2d(in_channels, init_features, kernel_size=3, padding=1, bias=False)

        self.encoder_blocks = nn.ModuleList()
        self.down_transitions = nn.ModuleList()

        channels = init_features
        skip_channels = []

        # 4 Encoder levels
        for i in range(4):
            dense_block = DenseBlock(channels, block_layers, growth_rate)
            self.encoder_blocks.append(dense_block)
            channels += block_layers * growth_rate
            skip_channels.append(channels)
            
            # Transition down compresses channels to manage growth
            trans_out = channels 
            self.down_transitions.append(TransitionDown(channels, trans_out))
            channels = trans_out

        # Bottleneck
        self.bottleneck = DenseBlock(channels, block_layers, growth_rate)
        channels += block_layers * growth_rate

        self.up_transitions = nn.ModuleList()
        self.decoder_blocks = nn.ModuleList()

        # 4 Decoder levels
        for i in reversed(range(4)):
            self.up_transitions.append(nn.ConvTranspose2d(channels, skip_channels[i], kernel_size=2, stride=2))
            channels = skip_channels[i] + skip_channels[i] # concatenation of skip
            
            dense_block = DenseBlock(channels, block_layers, growth_rate)
            self.decoder_blocks.append(dense_block)
            channels += block_layers * growth_rate

        self.final_conv = nn.Sequential(
            nn.BatchNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, out_channels, kernel_size=1)
        )

    def forward(self, x):
        out = self.init_conv(x)

        skips = []
        for i in range(4):
            out = self.encoder_blocks[i](out)
            skips.append(out)
            out = self.down_transitions[i](out)

        out = self.bottleneck(out)

        for i in range(4):
            out = self.up_transitions[i](out)
            skip = skips[-(i + 1)]

            if out.shape != skip.shape:
                out = F.interpolate(out, size=skip.shape[2:], mode="bilinear", align_corners=False)

            out = torch.cat([skip, out], dim=1)
            out = self.decoder_blocks[i](out)

        out = self.final_conv(out)
        
        # Identity mapping strategy (y = Λθ(x) + x) to learn the residual function
        if out.shape == x.shape:
            out = out + x
            
        return out

class PixelDL(FDUNet):
    """
    Pixel-DL: Pixel-wise Deep Learning for Photoacoustic Tomography.
    Typically uses a physics-informed interpolation (mapping sensor data to pixels) 
    followed by a dense U-Net (FD-UNet) reconstruction backbone.
    """
    def __init__(self, in_channels=64, out_channels=1, init_features=32, growth_rate=8, block_layers=4):
        # PixelDL typically has N input channels where N is the number of detectors (e.g., 64)
        super(PixelDL, self).__init__(in_channels, out_channels, init_features, growth_rate, block_layers)

class YNet(nn.Module):
    """
    Y-Net Architecture for Dual Input: Image and Signal.
    Fuses spatial features from reconstructed images and temporal features from raw signals.
    """
    def __init__(self, in_channels_img=1, in_channels_sig=1, out_channels=1):
        super(YNet, self).__init__()
        
        # Image Branch (Spatial Features)
        self.img_encoder = nn.Sequential(
            nn.Conv2d(in_channels_img, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2)
        )
        
        # Signal Branch (Temporal Features)
        self.sig_encoder = nn.Sequential(
            nn.Conv2d(in_channels_sig, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2)
        )
        
        # Fusion and Decoder
        self.fusion_conv = nn.Conv2d(128, 128, kernel_size=3, padding=1)
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, out_channels, kernel_size=1)
        )

    def forward(self, x_img, x_sig):
        feat_img = self.img_encoder(x_img)
        feat_sig = self.sig_encoder(x_sig)
        
        # Ensure spatial dimensions match before concatenation
        if feat_img.shape != feat_sig.shape:
            feat_sig = F.interpolate(feat_sig, size=feat_img.shape[2:], mode='bilinear', align_corners=False)
            
        combined = torch.cat([feat_img, feat_sig], dim=1)
        fused = self.fusion_conv(combined)
        return self.decoder(fused)

class FDYNet(nn.Module):
    """
    Fully Dense Y-Net (FD-YNet): Dual input architecture with Dense Blocks 
    for both Image and Signal branches.
    """
    def __init__(self, in_channels_img=1, in_channels_sig=1, out_channels=1, growth_rate=8):
        super(FDYNet, self).__init__()
        
        self.img_init = nn.Conv2d(in_channels_img, 16, kernel_size=3, padding=1)
        self.img_dense = DenseBlock(16, 4, growth_rate) # Output: 16 + 4*8 = 48
        
        self.sig_init = nn.Conv2d(in_channels_sig, 16, kernel_size=3, padding=1)
        self.sig_dense = DenseBlock(16, 4, growth_rate) # Output: 48
        
        self.fusion = nn.Sequential(
            nn.Conv2d(96, 64, kernel_size=1),
            DenseBlock(64, 4, growth_rate), # Output: 64 + 32 = 96
            nn.BatchNorm2d(96),
            nn.ReLU(inplace=True)
        )
        
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(96, 32, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, out_channels, kernel_size=1)
        )

    def forward(self, x_img, x_sig):
        # Image processing
        img_feat = self.img_dense(self.img_init(x_img))
        img_feat = F.max_pool2d(img_feat, 2)
        
        # Signal processing
        sig_feat = self.sig_dense(self.sig_init(x_sig))
        sig_feat = F.max_pool2d(sig_feat, 2)
        
        # Align and fuse
        if img_feat.shape != sig_feat.shape:
            sig_feat = F.interpolate(sig_feat, size=img_feat.shape[2:], mode='bilinear', align_corners=False)
            
        combined = torch.cat([img_feat, sig_feat], dim=1)
        fused = self.fusion(combined)
        
        # Final reconstruction
        out = self.decoder(fused)
        
        # Upsample to match original image if needed
        if out.shape[2:] != x_img.shape[2:]:
            out = F.interpolate(out, size=x_img.shape[2:], mode='bilinear', align_corners=False)
            
        return out

if __name__ == "__main__":
    # Test U-Net
    print("Testing Standard U-Net...")
    model_unet = UNet(in_channels=1, out_channels=1)
    x = torch.randn(1, 1, 128, 128)
    y_unet = model_unet(x)
    print(f"Input shape: {x.shape}")
    print(f"U-Net Output shape: {y_unet.shape}")
    
    # Test FD-UNet
    print("\nTesting Fully Dense U-Net (FD-UNet)...")
    model_fdunet = FDUNet(in_channels=1, out_channels=1)
    y_fdunet = model_fdunet(x)
    print(f"FD-UNet Output shape: {y_fdunet.shape}")

    # Test Pixel-DL
    print("\nTesting Pixel-DL (Physics-Informed Dense Network)...")
    x_pixel = torch.randn(1, 64, 128, 128)
    model_pixeldl = PixelDL(in_channels=64, out_channels=1)
    y_pixeldl = model_pixeldl(x_pixel)
    print(f"Pixel-DL Input shape: {x_pixel.shape}")
    print(f"Pixel-DL Output shape: {y_pixeldl.shape}")

    # Test Y-Net
    print("\nTesting Y-Net (Dual Input: Image + Signal)...")
    x_img = torch.randn(1, 1, 128, 128)
    x_sig = torch.randn(1, 1, 64, 512)
    model_ynet = YNet()
    y_ynet = model_ynet(x_img, x_sig)
    print(f"Y-Net Output shape: {y_ynet.shape}")

    # Test FD-YNet
    print("\nTesting FD-YNet (Dual Input Dense)...")
    model_fdynet = FDYNet()
    y_fdynet = model_fdynet(x_img, x_sig)
    print(f"FD-YNet Output shape: {y_fdynet.shape}")
    
    # Check parameter counts
    def count_parameters(model):
        return sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"\nU-Net Parameters: {count_parameters(model_unet):,}")
    print(f"FD-UNet Parameters: {count_parameters(model_fdunet):,}")
    print(f"Pixel-DL Parameters: {count_parameters(model_pixeldl):,}")
    print(f"Y-Net Parameters: {count_parameters(model_ynet):,}")
    print(f"FD-YNet Parameters: {count_parameters(model_fdynet):,}")
    
    print("\n✅ All Model Verifications Complete.")
