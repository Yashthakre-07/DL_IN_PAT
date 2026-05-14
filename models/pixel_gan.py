import torch
import torch.nn as nn
import torch.nn.functional as F

class PixelGANGenerator(nn.Module):
    """
    PixelGAN Generator: Simple encoder-decoder for pixel-level transformation.
    """
    def __init__(self, in_channels=1, out_channels=1, features=64):
        super(PixelGANGenerator, self).__init__()
        self.initial_down = nn.Sequential(
            nn.Conv2d(in_channels, features, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2)
        )
        self.down1 = nn.Sequential(
            nn.Conv2d(features, features * 2, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(features * 2),
            nn.LeakyReLU(0.2)
        )
        self.bottleneck = nn.Sequential(
            nn.Conv2d(features * 2, features * 4, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(features * 4),
            nn.LeakyReLU(0.2),
            nn.ConvTranspose2d(features * 4, features * 2, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(features * 2),
            nn.ReLU()
        )
        self.up1 = nn.Sequential(
            nn.ConvTranspose2d(features * 2, features, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(features),
            nn.ReLU()
        )
        self.final_up = nn.Sequential(
            nn.ConvTranspose2d(features, out_channels, kernel_size=4, stride=2, padding=1),
            nn.Tanh()
        )

    def forward(self, x):
        d1 = self.initial_down(x)
        d2 = self.down1(d1)
        bn = self.bottleneck(d2)
        u1 = self.up1(bn)
        return self.final_up(u1)

class PixelGANDiscriminator(nn.Module):
    """
    PixelGAN Discriminator: PatchGAN-style discriminator.
    """
    def __init__(self, in_channels=1, features=[64, 128, 256, 512]):
        super(PixelGANDiscriminator, self).__init__()
        layers = []
        in_c = in_channels
        for feature in features:
            layers.append(
                nn.Sequential(
                    nn.Conv2d(in_c, feature, kernel_size=4, stride=2, padding=1),
                    nn.BatchNorm2d(feature),
                    nn.LeakyReLU(0.2)
                )
            )
            in_c = feature
        layers.append(nn.Conv2d(in_c, 1, kernel_size=4, stride=1, padding=1))
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        return torch.sigmoid(self.model(x))

class PixelCGANGenerator(nn.Module):
    """
    Conditional PixelGAN Generator: Takes condition image + noise/source.
    Expects input x to be a 2-channel tensor [Source, Condition].
    """
    def __init__(self, in_channels=2, out_channels=1, features=64):
        super(PixelCGANGenerator, self).__init__()
        self.gen = PixelGANGenerator(in_channels, out_channels, features)

    def forward(self, x):
        # Expecting x to already be concatenated [Input, Condition] 
        # or just a multi-channel input for the conditional task.
        return self.gen(x)

class PixelCGANDiscriminator(nn.Module):
    """
    Conditional PixelGAN Discriminator: Discriminates based on image + condition.
    Expects input x to be a 2-channel tensor [Image, Condition].
    """
    def __init__(self, in_channels=2, features=[64, 128, 256, 512]):
        super(PixelCGANDiscriminator, self).__init__()
        self.disc = PixelGANDiscriminator(in_channels, features)

    def forward(self, x):
        return self.disc(x)

if __name__ == "__main__":
    # Simple test
    gen = PixelGANGenerator()
    disc = PixelGANDiscriminator()
    x = torch.randn(1, 1, 128, 128)
    fake = gen(x)
    pred = disc(fake)
    print(f"Generator output shape: {fake.shape}")
    print(f"Discriminator output shape: {pred.shape}")
