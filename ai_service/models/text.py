"""
Text-based complaint classification.
Currently using rule-based approach, will be replaced with ML models later.
"""

from typing import Dict, Any
import logging
from utils.predict import predict_category_from_text

logger = logging.getLogger(__name__)

def predict_from_text(text: str) -> Dict[str, Any]:
    """
    Predict complaint category from text description.
    Currently uses rule-based keyword matching.
    
    Args:
        text: Complaint description
        
    Returns:
        Dict with predicted category and confidence
    """
    return predict_category_from_text(text)