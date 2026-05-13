import torch
import torch.nn as nn
import torch.nn.functional as F

class IQDCNN(nn.Module):
    def __init__(self, in_channels=1, conv_filters=[32, 32, 32, 32], num_fc_units=1024, dropout_rate=0.3):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, conv_filters[0], kernel_size=5, padding=2)
        self.conv2 = nn.Conv2d(conv_filters[1], conv_filters[1], kernel_size=5, padding=2)
        self.conv3 = nn.Conv2d(conv_filters[2], conv_filters[2], kernel_size=5, padding=2)
        self.conv4 = nn.Conv2d(conv_filters[3], conv_filters[3], kernel_size=5, padding=2)
        self.pool = nn.MaxPool2d(kernel_size=3, stride=2)

        # Dynamically compute flattened dimension after conv+pool layers
        with torch.no_grad():
            dummy_input = torch.zeros(1, in_channels, 128, 128)
            x = self.pool(F.relu(self.conv1(dummy_input)))
            x = self.pool(F.relu(self.conv2(x)))
            x = self.pool(F.relu(self.conv3(x)))
            x = self.pool(F.relu(self.conv4(x)))
            self.flatten_dim = x.view(1, -1).shape[1]

        self.fc1 = nn.Linear(self.flatten_dim, num_fc_units)
        self.dropout1 = nn.Dropout(dropout_rate)
        self.fc2 = nn.Linear(num_fc_units, num_fc_units)
        self.dropout2 = nn.Dropout(dropout_rate)
        self.fc3 = nn.Linear(num_fc_units, num_fc_units)
        self.dropout3 = nn.Dropout(dropout_rate)
        self.fc4 = nn.Linear(num_fc_units, 1)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = self.pool(F.relu(self.conv4(x)))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x)); x = self.dropout1(x)
        x = F.relu(self.fc2(x)); x = self.dropout2(x)
        x = F.relu(self.fc3(x)); x = self.dropout3(x)
        return self.fc4(x)
