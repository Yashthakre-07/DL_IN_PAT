import torch
import torch.nn as nn
import torch.nn.functional as F

class PhotoacousticQualityNetBN(nn.Module):
    def __init__(self, in_channels=1, conv_filters=[32, 64, 128, 256], num_fc_units=128):
        super().__init__()
        assert len(conv_filters) == 4, "Expected 4 convolutional layers"

        self.conv1 = nn.Sequential(
            nn.Conv2d(in_channels, conv_filters[0], kernel_size=5, padding=2),
            nn.BatchNorm2d(conv_filters[0]),
            nn.ReLU()
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(conv_filters[0], conv_filters[1], kernel_size=3, padding=1),
            nn.BatchNorm2d(conv_filters[1]),
            nn.ReLU()
        )
        self.conv3 = nn.Sequential(
            nn.Conv2d(conv_filters[1], conv_filters[2], kernel_size=3, padding=1),
            nn.BatchNorm2d(conv_filters[2]),
            nn.ReLU()
        )
        self.conv4 = nn.Sequential(
            nn.Conv2d(conv_filters[2], conv_filters[3], kernel_size=3, padding=1),
            nn.BatchNorm2d(conv_filters[3]),
            nn.ReLU()
        )
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.flatten_dim = conv_filters[3] * 8 * 8

        self.fc1 = nn.Linear(self.flatten_dim, num_fc_units)
        self.fc2 = nn.Linear(num_fc_units, num_fc_units)
        self.fc3 = nn.Linear(num_fc_units, 1)

    def forward(self, x):
        x = self.pool(self.conv1(x))
        x = self.pool(self.conv2(x))
        x = self.pool(self.conv3(x))
        x = self.pool(self.conv4(x))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)
