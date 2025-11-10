/**
 * Form validation utilities
 */

export const FILE_CONSTRAINTS = {
  image: {
    maxSize: 2 * 1024 * 1024, // 2MB (from settings.py MAX_IMAGE_SIZE)
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'], // Match backend ALLOWED_IMAGE_TYPES
    maxDimensions: { width: 4096, height: 4096 }
  }
};

/**
 * Validates form data for complaint submission
 */
export const validateComplaintForm = (formData) => {
  const errors = {};

  // Title validation
  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.length < 10) {
    errors.title = 'Title must be at least 10 characters';
  } else if (formData.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length < 30) {
    errors.description = 'Description must be at least 30 characters';
  }

  // Category validation (from Complaint.CATEGORY_CHOICES)
  if (!formData.category) {
    errors.category = 'Please select a category';
  } else if (!['POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER', 'SEWAGE', 
               'ROAD_DAMAGE', 'TRAFFIC_SIGNAL', 'PARK', 'NOISE', 'OTHER'].includes(formData.category)) {
    errors.category = 'Invalid category selected';
  }

  // Address validation
  if (!formData.address?.trim()) {
    errors.address = 'Address is required';
  }

  // Ward validation
  if (!formData.ward) {
    errors.ward = 'Ward information is required';
  }

  // City validation
  if (!formData.city?.trim() || formData.city.toLowerCase() !== 'mumbai') {
    errors.city = 'City must be Mumbai';
  }

  // State validation
  if (!formData.state?.trim() || formData.state.toLowerCase() !== 'maharashtra') {
    errors.state = 'State must be Maharashtra';
  }

  // ZIP Code validation
  if (!formData.zip_code?.trim()) {
    errors.zip_code = 'ZIP code is required';
  } else if (!/^\d{6}$/.test(formData.zip_code)) {
    errors.zip_code = 'Invalid PIN code format';
  }

  // Coordinate validation
  if (!formData.latitude || !formData.longitude) {
    errors.location = 'Please select a location on the map';
  } else {
    // Mumbai bounds validation
    const MUMBAI_BOUNDS = {
      min_lat: 18.8928,
      max_lat: 19.2766,
      min_lng: 72.7756,
      max_lng: 72.9919
    };

    if (formData.latitude < MUMBAI_BOUNDS.min_lat || formData.latitude > MUMBAI_BOUNDS.max_lat ||
        formData.longitude < MUMBAI_BOUNDS.min_lng || formData.longitude > MUMBAI_BOUNDS.max_lng) {
      errors.location = 'Selected location must be within Mumbai municipal boundaries';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates an image file
 */
export const validateImageFile = async (file) => {
  const { maxSize, allowedTypes, maxDimensions } = FILE_CONSTRAINTS.image;

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type must be JPEG, PNG or WebP');
  }

  // Check image dimensions
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
        reject(new Error(`Image dimensions must be less than ${maxDimensions.width}x${maxDimensions.height}`));
      }
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Invalid image file'));
    };
  });
};

/**
 * Validates an audio file
 */
export const validateAudioFile = async (file) => {
  const { maxSize, allowedTypes, maxDuration } = FILE_CONSTRAINTS.audio;

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type must be WAV or MP3');
  }

  // Check audio duration
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      if (audio.duration > maxDuration) {
        reject(new Error(`Audio duration must be less than ${maxDuration} seconds`));
      }
      resolve(true);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('Invalid audio file'));
    };
  });
};

/**
 * Standardizes an address string
 */
export const standardizeAddress = (address) => {
  if (!address) return '';

  // Remove extra whitespace
  let standardized = address.trim().replace(/\s+/g, ' ');

  // Capitalize first letter of each word
  standardized = standardized.replace(/\b\w/g, l => l.toUpperCase());

  // Standardize common abbreviations
  const abbreviations = {
    'St\\.': 'Street',
    'Rd\\.': 'Road',
    'Ave\\.': 'Avenue',
    'Bldg\\.': 'Building',
    'Apt\\.': 'Apartment',
    'Flr\\.': 'Floor',
  };

  Object.entries(abbreviations).forEach(([abbr, full]) => {
    standardized = standardized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  });

  return standardized;
};

/**
 * Standardizes ward data
 */
export const standardizeWardData = (wardCode) => {
  if (!wardCode) return null;

  // Ensure ward code is uppercase and properly formatted
  wardCode = wardCode.toUpperCase().trim();

  // Handle ward codes with slashes (e.g., "F/N", "H/E")
  const parts = wardCode.split('/');
  if (parts.length === 2) {
    return `${parts[0]}/${parts[1]}`;
  }

  return wardCode;
};