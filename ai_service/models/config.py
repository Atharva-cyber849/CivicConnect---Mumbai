"""
Model configuration and settings.
"""
from pathlib import Path
import os
from typing import Dict, Any

# Base paths
MODEL_ROOT = Path(__file__).parent
CHECKPOINT_DIR = MODEL_ROOT / "checkpoints"

# Ensure checkpoint directory exists
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

# Model configuration
MODEL_CONFIG: Dict[str, Dict[str, Any]] = {
    "text": {
        "enabled": os.getenv("ENABLE_TEXT_MODEL", "1") == "1",
        "model_name": os.getenv("TEXT_MODEL_NAME", "distilbert-base-uncased"),
        "local_path": CHECKPOINT_DIR / "text_model",
        "confidence_threshold": 0.7,
        "fallback_threshold": 0.5,
        # Civic category mapping from model outputs
        "label_map": {
            "INFRASTRUCTURE": "ROAD_DAMAGE",
            "LIGHTING": "STREETLIGHT",
            "WASTE": "GARBAGE",
            "WATER_ISSUE": "WATER",
            "SANITATION": "SEWAGE",
            "ROAD": "POTHOLE",
            "TRAFFIC": "TRAFFIC_SIGNAL",
            "RECREATION": "PARK",
            "DISTURBANCE": "NOISE",
            "MISC": "OTHER"
        }
    },
    "image": {
        "enabled": os.getenv("ENABLE_IMAGE_MODEL", "1") == "1",
        "model_name": os.getenv("IMAGE_MODEL_ARCH", "resnet18"),
        "local_path": CHECKPOINT_DIR / "image_model",
        "confidence_threshold": 0.8,
        "fallback_threshold": 0.6,
        # Example mapping of CNN class indices to civic categories
        "label_map": {
            0: "POTHOLE",
            1: "GARBAGE",
            2: "STREETLIGHT",
            3: "ROAD_DAMAGE",
            4: "WATER",
            5: "OTHER"
        }
    }
}

# Category metadata (shared across models)
CATEGORY_METADATA = {
    "POTHOLE": {
        "description": "Road surface damage forming a hole",
        "severity_levels": ["minor", "moderate", "severe"],
        "department": "roads"
    },
    "STREETLIGHT": {
        "description": "Issues with street lighting",
        "severity_levels": ["flickering", "dim", "off"],
        "department": "electrical"
    },
    "GARBAGE": {
        "description": "Waste management issues",
        "severity_levels": ["overflow", "scattered", "dumping"],
        "department": "sanitation"
    },
    "WATER": {
        "description": "Water supply or leakage issues",
        "severity_levels": ["leak", "pressure", "quality"],
        "department": "water"
    },
    "SEWAGE": {
        "description": "Sewage and drainage issues",
        "severity_levels": ["blockage", "overflow", "odor"],
        "department": "sanitation"
    },
    "ROAD_DAMAGE": {
        "description": "General road surface damage",
        "severity_levels": ["cracks", "uneven", "broken"],
        "department": "roads"
    },
    "TRAFFIC_SIGNAL": {
        "description": "Traffic signal malfunction",
        "severity_levels": ["malfunction", "timing", "damaged"],
        "department": "traffic"
    },
    "PARK": {
        "description": "Issues in parks and recreational areas",
        "severity_levels": ["maintenance", "damage", "hazard"],
        "department": "parks"
    },
    "NOISE": {
        "description": "Noise pollution complaints",
        "severity_levels": ["constant", "periodic", "late-night"],
        "department": "environment"
    },
    "OTHER": {
        "description": "Miscellaneous civic issues",
        "severity_levels": ["low", "medium", "high"],
        "department": "general"
    }
}

def get_model_config(model_type: str) -> Dict[str, Any]:
    """Get configuration for a specific model type."""
    return MODEL_CONFIG.get(model_type, {})

def get_label_metadata(category: str) -> Dict[str, Any]:
    """Get metadata for a specific category."""
    return CATEGORY_METADATA.get(category, CATEGORY_METADATA["OTHER"])