"""
Preprocessing utilities for images and text.
"""
from PIL import Image
import io
import numpy as np
from typing import Union


def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """
    Preprocess image for model input.
    
    Args:
        image_bytes: Raw image bytes
        target_size: Target size for resizing (width, height)
    
    Returns:
        Preprocessed image as numpy array
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        img_array = np.array(image, dtype=np.float32)
        img_array = img_array / 255.0  # Normalize to [0, 1]
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {str(e)}")


def preprocess_text(text: str, max_length=512):
    """
    Preprocess text for model input.
    
    Args:
        text: Input text string
        max_length: Maximum sequence length
    
    Returns:
        Preprocessed text
    """
    try:
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        return text
    
    except Exception as e:
        raise ValueError(f"Text preprocessing failed: {str(e)}")


def extract_keywords(text: str):
    """
    Extract relevant keywords from text for classification.
    
    Args:
        text: Input text
    
    Returns:
        List of keywords
    """
    # Keywords for each category
    category_keywords = {
        'POTHOLE': ['pothole', 'hole', 'road damage', 'crater', 'asphalt'],
        'STREETLIGHT': ['streetlight', 'light', 'lamp', 'lighting', 'dark', 'bulb'],
        'GARBAGE': ['garbage', 'trash', 'waste', 'litter', 'dump', 'rubbish'],
        'WATER': ['water', 'leak', 'pipe', 'supply', 'tap', 'faucet'],
        'SEWAGE': ['sewage', 'drain', 'sewer', 'overflow', 'smell', 'odor'],
        'ROAD_DAMAGE': ['road', 'street', 'pavement', 'crack', 'damage'],
        'TRAFFIC_SIGNAL': ['traffic', 'signal', 'light', 'intersection', 'crossing'],
        'PARK': ['park', 'playground', 'garden', 'recreation', 'bench'],
        'NOISE': ['noise', 'loud', 'sound', 'disturbance', 'pollution'],
    }
    
    text_lower = text.lower()
    found_keywords = {}
    
    for category, keywords in category_keywords.items():
        count = sum(1 for keyword in keywords if keyword in text_lower)
        if count > 0:
            found_keywords[category] = count
    
    return found_keywords
