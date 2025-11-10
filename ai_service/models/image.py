"""
Image-based complaint classification.
Currently using rule-based approach, will be replaced with ML models later.
"""

from typing import Dict, Any
import logging
from utils.predict import predict_category_from_image

logger = logging.getLogger(__name__)

def predict_from_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Predict complaint category from image.
    Currently uses basic image processing and defaults.
    Will be replaced with CNN model later.
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        Dict with predicted category and confidence
    """
    return predict_category_from_image(image_bytes)