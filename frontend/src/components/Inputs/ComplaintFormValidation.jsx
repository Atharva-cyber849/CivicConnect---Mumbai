import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { validateComplaintForm, validateImageFile, standardizeAddress, standardizeWardData } from '../../utils/validation'
import { COMPLAINT_CATEGORIES, MUMBAI_WARDS, FILE_UPLOAD_CONSTRAINTS } from '../../utils/constants'

const ComplaintFormValidation = ({ onValidationComplete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ward: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '',
    latitude: '',
    longitude: '',
    image: null,
  })

  const [formErrors, setFormErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  // Reset error when field is changed
  const handleChange = (name, value) => {
    setFormErrors(prev => ({ ...prev, [name]: null }))
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Validate single field
  const validateRequired = (name, value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    return null;
};

const validateField = async (name, value) => {
    const errors = {}

    // First check if the field is required
    const requiredFields = ['title', 'description', 'category', 'ward', 'address'];
    if (requiredFields.includes(name)) {
      const requiredError = validateRequired(name, value);
      if (requiredError) {
        errors[name] = requiredError;
        return errors;
      }
    }

    switch (name) {
      case 'image':
        if (value) {
          try {
            await validateImageFile(value)
          } catch (error) {
            errors.image = error.message
          }
        }
        break

      case 'address':
        try {
          const standardized = standardizeAddress(value)
          setFormData(prev => ({ ...prev, address: standardized }))
        } catch (error) {
          errors.address = error.message
        }
        break

      case 'ward':
        try {
          const standardized = standardizeWardData(value)
          setFormData(prev => ({ ...prev, ward: standardized }))
        } catch (error) {
          errors.ward = error.message
        }
        break

      case 'coordinates':
        if (value.latitude && value.longitude) {
          const MUMBAI_BOUNDS = {
            min_lat: 18.8928,
            max_lat: 19.2765,
            min_lng: 72.7756,
            max_lng: 72.9919
          };
          if (value.latitude < MUMBAI_BOUNDS.min_lat || value.latitude > MUMBAI_BOUNDS.max_lat ||
              value.longitude < MUMBAI_BOUNDS.min_lng || value.longitude > MUMBAI_BOUNDS.max_lng) {
            errors.coordinates = 'Selected location must be within Mumbai municipal boundaries';
          }
        }
        break

      default:
        const { errors: fieldErrors } = validateComplaintForm({
          ...formData,
          [name]: value
        })
        if (fieldErrors[name]) {
          errors[name] = fieldErrors[name]
        }
    }

    return errors
  }

  // Validate entire form
  const validateForm = async () => {
    setIsValidating(true)
    try {
      const allErrors = {}

      // Validate each field
      for (const [name, value] of Object.entries(formData)) {
        const fieldErrors = await validateField(name, value)
        Object.assign(allErrors, fieldErrors)
      }

      // Validate coordinates together
      const coordErrors = await validateField('coordinates', {
        latitude: formData.latitude,
        longitude: formData.longitude
      })
      Object.assign(allErrors, coordErrors)

      // Update form errors
      setFormErrors(allErrors)

      // Return validation result
      const isValid = Object.keys(allErrors).length === 0
      if (!isValid) {
        const firstError = Object.values(allErrors)[0]
        toast.error(firstError)
      }
      onValidationComplete(isValid, allErrors)
      return isValid

    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Form validation failed')
      return false
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    // You can perform any additional setup here
    return () => {
      // Cleanup if needed
    }
  }, [])

  return {
    formData,
    formErrors,
    isValidating,
    handleChange,
    validateField,
    validateForm
  }
}

export default ComplaintFormValidation