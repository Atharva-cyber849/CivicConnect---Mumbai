"""
Simplified model loader utilities for rule-based classification.
Will be expanded later for ML model management.
"""

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

def normalize_prediction(prediction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize prediction to standard format.
    Currently just passes through the rule-based prediction.
    Will be expanded for ML model mapping later.
    
    Args:
        prediction: Raw prediction dictionary
        
    Returns:
        Normalized prediction with standard fields
    """
    return {
        'category': prediction.get('category', 'OTHER'),
        'confidence': float(prediction.get('confidence', 0.5)),
        'source': prediction.get('source', 'rule-based'),
        'metadata': prediction.get('metadata', {})
    }