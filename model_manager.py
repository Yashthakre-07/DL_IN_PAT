import os
import torch
import json
from datetime import datetime

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
REGISTRY_FILE = os.path.join(SAVED_MODELS_DIR, "registry.json")

def init_registry():
    if not os.path.exists(SAVED_MODELS_DIR):
        os.makedirs(SAVED_MODELS_DIR)
    if not os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "w") as f:
            json.dump([], f)

def save_model(model, model_name, architecture_type, dataset_name="unknown", metrics_achieved=None):
    """
    Saves the model weights and updates the registry.
    """
    init_registry()
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    date_str = now.strftime("%Y-%m-%d")
    
    # Format: {architecture}_{dataset}_{date}.pth as requested
    filename = f"{architecture_type}_{dataset_name}_{date_str}.pth"
    filepath = os.path.join(SAVED_MODELS_DIR, filename)
    
    # Human-readable name for the registry: {Architecture} - {Dataset} ({Date})
    display_name = f"{architecture_type.upper()} | {dataset_name} | {date_str}"
    
    # Save weights
    torch.save(model.state_dict(), filepath)
    
    # Update registry
    with open(REGISTRY_FILE, "r") as f:
        registry = json.load(f)
    
    entry = {
        "name": display_name,
        "filename": filename,
        "architecture": architecture_type,
        "dataset": dataset_name,
        "date_saved": date_str,
        "timestamp": timestamp,
        "metrics": metrics_achieved or {}
    }
    registry.append(entry)
    
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=4)
    
    print(f"Model saved to {filepath} as '{display_name}'")
    return entry

def list_saved_models():
    """
    Returns a list of all saved models from the registry.
    """
    init_registry()
    with open(REGISTRY_FILE, "r") as f:
        return json.load(f)

def update_model_name(filename, new_name):
    """
    Updates the human-readable display name for a specific weight file.
    """
    init_registry()
    with open(REGISTRY_FILE, "r") as f:
        registry = json.load(f)
    
    updated = False
    for entry in registry:
        if entry["filename"] == filename:
            entry["name"] = new_name
            updated = True
            break
            
    if updated:
        with open(REGISTRY_FILE, "w") as f:
            json.dump(registry, f, indent=4)
        return True
    return False

def delete_model(filename):
    """
    Deletes the model weight file and removes it from the registry.
    """
    init_registry()
    filepath = os.path.join(SAVED_MODELS_DIR, filename)
    
    # 1. Delete physical file
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # 2. Update registry
    with open(REGISTRY_FILE, "r") as f:
        registry = json.load(f)
        
    new_registry = [e for e in registry if e["filename"] != filename]
    
    if len(new_registry) < len(registry):
        with open(REGISTRY_FILE, "w") as f:
            json.dump(new_registry, f, indent=4)
        return True
    return False

def load_model_weights(model, filename):
    """
    Loads weights from the saved_models directory into the provided model instance.
    """
    filepath = os.path.join(SAVED_MODELS_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"No model found at {filepath}")
    
    model.load_state_dict(torch.load(filepath, map_location=torch.device('cpu')))
    model.eval()
    return model
