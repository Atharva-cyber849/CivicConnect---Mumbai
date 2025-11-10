"""
Utilities for file validation and security.
"""
from typing import Optional, Tuple
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.conf import settings
import os
import cv2
import numpy as np
import re
import mimetypes

# Prefer python-magic when available, but provide a safe fallback for environments
# where the native extension is not installed (prevents "Import 'magic' could not be resolved").
try:
    import magic
except Exception:
    class _MagicFallback:
        @staticmethod
        def from_buffer(buffer: bytes, mime: bool = True) -> str:
            """
            Very small heuristic-based MIME detector for common image/audio types.
            This is not a full replacement for python-magic but covers the cases used
            in this module (jpeg, png, gif, wav, mp3).
            """
            header = buffer[:16] if buffer else b''
            # JPEG
            if header.startswith(b'\xff\xd8'):
                return 'image/jpeg'
            # PNG
            if header.startswith(b'\x89PNG'):
                return 'image/png'
            # GIF
            if header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
                return 'image/gif'
            # WAV (RIFF .... WAVE)
            if header.startswith(b'RIFF') and b'WAVE' in header[:12]:
                return 'audio/wav'
            # MP3 (ID3 tag) or frame sync 0xFF 0xFB
            if header.startswith(b'ID3') or header[:2] == b'\xff\xfb':
                return 'audio/mpeg'
            # Fallback to mimetypes guess (based on extension-less generic 'application/octet-stream')
            guessed = mimetypes.guess_type('file.bin')[0]
            return guessed or 'application/octet-stream'

    magic = _MagicFallback()

from django.conf import settings

# File size limits (in bytes)
FILE_SIZE_LIMITS = {
    'image': getattr(settings, 'MAX_IMAGE_SIZE', 2 * 1024 * 1024),  # Default 2MB if not in settings
    'audio': getattr(settings, 'MAX_AUDIO_SIZE', 10 * 1024 * 1024)  # Default 10MB if not in settings
}

# Allowed MIME types
ALLOWED_IMAGE_TYPES = {
    mime_type: [ext for ext in ['.jpg', '.jpeg', '.png', '.gif'] 
               if mime_type.endswith(ext.replace('.', ''))]
    for mime_type in getattr(settings, 'ALLOWED_IMAGE_TYPES', 
                           ['image/jpeg', 'image/png', 'image/gif'])
}

# Audio types are currently not used in the main application
ALLOWED_AUDIO_TYPES = {
    'audio/wav': ['.wav'],
    'audio/mpeg': ['.mp3'],
    'audio/mp3': ['.mp3']
}

def validate_file_size(file: UploadedFile, file_type: str) -> None:
    """
    Validate file size against defined limits.
    """
    if file.size > FILE_SIZE_LIMITS.get(file_type, 0):
        max_size_mb = FILE_SIZE_LIMITS[file_type] / (1024 * 1024)
        raise ValidationError(f'File size cannot exceed {max_size_mb}MB')

def validate_file_type(file: UploadedFile, allowed_types: dict) -> None:
    """
    Validate file type using magic numbers.
    """
    try:
        # Read file header
        file_header = file.read(2048)
        file.seek(0)  # Reset file pointer
        
        # Get MIME type
        mime_type = magic.from_buffer(file_header, mime=True)
        
        if mime_type not in allowed_types:
            allowed_extensions = [ext for exts in allowed_types.values() for ext in exts]
            raise ValidationError(
                f'Invalid file type. Allowed types are: {", ".join(allowed_extensions)}'
            )
        
        # Verify extension matches MIME type
        file_ext = os.path.splitext(file.name)[1].lower()
        if file_ext not in allowed_types[mime_type]:
            raise ValidationError('File extension does not match its content')
            
    except Exception as e:
        raise ValidationError(f'File validation failed: {str(e)}')

def validate_image_content(file: UploadedFile) -> None:
    """
    Validate image content and dimensions.
    """
    try:
        # Read image using OpenCV
        file_bytes = np.frombuffer(file.read(), np.uint8)
        file.seek(0)  # Reset file pointer
        img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
        
        if img is None:
            raise ValidationError('Invalid or corrupted image file')
        
        # Check dimensions
        height, width = img.shape[:2]
        if width > 4096 or height > 4096:
            raise ValidationError('Image dimensions cannot exceed 4096x4096 pixels')
        
        # Basic image integrity checks
        if len(img.shape) < 2:
            raise ValidationError('Invalid image format')
        
        # Check for suspicious content (completely uniform images, etc.)
        if len(np.unique(img)) < 10:
            raise ValidationError('Image appears to be invalid or uniform')
            
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(f'Image validation failed: {str(e)}')

def validate_coordinate_bounds(lat: float, lon: float) -> None:
    """
    Validate coordinates are within Mumbai bounds.
    """
    # Get bounds from settings with fallback defaults
    MUMBAI_BOUNDS = getattr(settings, 'MUMBAI_BOUNDS', {
        'min_lat': 18.8928,
        'max_lat': 19.2766,
        'min_lng': 72.7756,
        'max_lng': 72.9919
    })
    
    if not (MUMBAI_BOUNDS['min_lat'] <= lat <= MUMBAI_BOUNDS['max_lat']):
        raise ValidationError(
            f'Latitude {lat} is outside Mumbai bounds '
            f'({MUMBAI_BOUNDS["min_lat"]}, {MUMBAI_BOUNDS["max_lat"]})'
        )
        
    if not (MUMBAI_BOUNDS['min_lng'] <= lon <= MUMBAI_BOUNDS['max_lng']):
        raise ValidationError(
            f'Longitude {lon} is outside Mumbai bounds '
            f'({MUMBAI_BOUNDS["min_lng"]}, {MUMBAI_BOUNDS["max_lng"]})'
        )

def validate_file_name(filename: str) -> None:
    """
    Validate file name for security.
    - Check for suspicious characters
    - Validate length
    - Check for path traversal attempts
    """
    if len(filename) > 255:
        raise ValidationError('File name is too long')
        
    # Check for suspicious characters and patterns
    if re.search(r'[<>:"|?*\x00-\x1f]', filename):
        raise ValidationError('File name contains invalid characters')
        
    # Check for path traversal attempts
    if '..' in filename or '/' in filename or '\\' in filename:
        raise ValidationError('Invalid file path detected')
        
    # Check file name is not empty or just an extension
    name, ext = os.path.splitext(filename)
    if not name or name.startswith('.'):
        raise ValidationError('Invalid file name')

def validate_complaint_files(image: Optional[UploadedFile] = None) -> None:
    """
    Validate files attached to a complaint.
    Performs comprehensive validation including:
    - File size check
    - File type/MIME validation
    - Image content analysis
    - Security checks
    """
    if image:
        # Size and type validation
        validate_file_size(image, 'image')
        validate_file_type(image, ALLOWED_IMAGE_TYPES)
        
        # Image content validation
        validate_image_content(image)
        
        # Additional security check for file name
        validate_file_name(image.name)