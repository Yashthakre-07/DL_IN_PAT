import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0

class EfficientNetIQA(nn.Module):
    def __init__(self, pretrained=True, in_channels=1, num_fc_units=128):
        super().__init__()
        self.model = efficientnet_b0(pretrained=pretrained)

        # Patch the first conv layer to accept grayscale input
        original_conv = self.model.features[0][0]
        self.model.features[0][0] = nn.Conv2d(
            in_channels,
            original_conv.out_channels,
            kernel_size=original_conv.kernel_size,
            stride=original_conv.stride,
            padding=original_conv.padding,
            bias=False
        )

        # Replace classifier for regression (and allow flexible hidden size)
        in_features = self.model.classifier[1].in_features
        self.model.classifier = nn.Sequential(
            nn.Linear(in_features, num_fc_units),
            nn.ReLU(),
            nn.Linear(num_fc_units, 1)
        )

    def forward(self, x):
        return self.model(x)
