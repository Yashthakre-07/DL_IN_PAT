import torch
import torch.nn.functional as F
import cv2
import numpy as np
import base64

class GradCAMService:
    def __init__(self):
        self.gradients = None
        self.activations = None

    def _save_gradient(self, grad):
        self.gradients = grad

    def generate_cam(self, model, image_tensor, original_image_np):
        """
        Generates a Grad-CAM heatmap overlay for the given model and image.
        Target layer: The last convolutional layer in the architecture.
        """
        model.eval()
        
        # 1. Identify the target layer (last Conv2d layer)
        target_layer = None
        for name, module in model.named_modules():
            if isinstance(module, torch.nn.Conv2d):
                target_layer = module
        
        if target_layer is None:
            print("Error: No Conv2d layer found for Grad-CAM.")
            return None
            
        # 2. Register hooks to capture activations and gradients
        def forward_hook(module, input, output):
            self.activations = output
            # Capture gradient of the activations during backward pass
            output.register_hook(self._save_gradient)
            
        handle = target_layer.register_forward_hook(forward_hook)
        
        # 3. Forward pass to get output
        # Ensure the tensor requires gradient
        image_tensor.requires_grad = True
        output = model(image_tensor)
        
        # 4. Backward pass to get gradients
        model.zero_grad()
        # Since it's a regression task (quality score), we backpropagate from the score itself
        output.backward()
        
        # Remove hook after capturing
        handle.remove()
        
        if self.gradients is None or self.activations is None:
            print("Error: Failed to capture gradients/activations.")
            return None

        # 5. Global Average Pooling of gradients (Weights alpha)
        # self.gradients shape: (B, C, H, W)
        weights = torch.mean(self.gradients, dim=[2, 3]) # (B, C)
        
        # 6. Weighted combination of activations
        # self.activations shape: (B, C, H, W)
        # We multiply each channel of activations by its corresponding weight
        cam = torch.zeros(self.activations.shape[2:], dtype=torch.float32, device=self.activations.device)
        for i, w in enumerate(weights[0]):
            cam += w * self.activations[0, i, :, :]
            
        # 7. Apply ReLU to focus on features that have a positive influence on the quality score
        cam = F.relu(cam)
        
        # Normalize between 0 and 1
        cam -= cam.min()
        cam_max = cam.max()
        if cam_max > 0:
            cam /= cam_max
            
        # 8. Post-processing and Heatmap Generation
        cam_np = cam.cpu().detach().numpy()
        # Resize to match original image dimensions
        heatmap_resized = cv2.resize(cam_np, (original_image_np.shape[1], original_image_np.shape[0]))
        
        # Create Color Map (JET)
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        
        # 9. Superimpose on original grayscale image
        # Convert original to BGR first
        original_bgr = cv2.cvtColor(original_image_np, cv2.COLOR_GRAY2BGR)
        superimposed_img = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)
        
        # 10. Encode to Base64 for web display
        _, buffer = cv2.imencode('.png', superimposed_img)
        return base64.b64encode(buffer).decode('utf-8')
