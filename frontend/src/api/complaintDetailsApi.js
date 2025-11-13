/**
 * Enhanced Complaint Details API
 * Handles all complaint sub-resources: images, attachments, timeline, resolution, notes
 */
import { axiosPrivate } from './axiosConfig';

export const complaintDetailsApi = {
  // ============================================================================
  // COMPLAINT IMAGES
  // ============================================================================
  
  images: {
    /**
     * Get all images for a complaint
     * @param {number} complaintId - The complaint ID
     * @returns {Promise} Array of complaint images
     */
    getAll: async (complaintId) => {
      const response = await axiosPrivate.get(`/complaints/${complaintId}/images/`);
      return response.data;
    },

    /**
     * Upload a new image for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {File} imageFile - The image file to upload
     * @returns {Promise} Created image object
     */
    upload: async (complaintId, imageFile) => {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosPrivate.post(
        `/complaints/${complaintId}/images/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    /**
     * Upload multiple images for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {File[]} imageFiles - Array of image files
     * @returns {Promise} Array of created image objects
     */
    uploadMultiple: async (complaintId, imageFiles) => {
      const uploadPromises = imageFiles.map(file =>
        complaintDetailsApi.images.upload(complaintId, file)
      );
      return Promise.all(uploadPromises);
    },

    /**
     * Delete an image
     * @param {number} complaintId - The complaint ID
     * @param {number} imageId - The image ID
     * @returns {Promise} Response
     */
    delete: async (complaintId, imageId) => {
      const response = await axiosPrivate.delete(
        `/complaints/${complaintId}/images/${imageId}/`
      );
      return response.data;
    },
  },

  // ============================================================================
  // COMPLAINT ATTACHMENTS
  // ============================================================================

  attachments: {
    /**
     * Get all attachments for a complaint
     * @param {number} complaintId - The complaint ID
     * @returns {Promise} Array of attachments
     */
    getAll: async (complaintId) => {
      const response = await axiosPrivate.get(`/complaints/${complaintId}/attachments/`);
      return response.data;
    },

    /**
     * Upload a new attachment for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {File} file - The file to upload
     * @param {string} fileName - Optional file name
     * @param {string} fileType - Optional file type
     * @returns {Promise} Created attachment object
     */
    upload: async (complaintId, file, fileName = null, fileType = null) => {
      const formData = new FormData();
      formData.append('file', file);
      if (fileName) formData.append('file_name', fileName);
      if (fileType) formData.append('file_type', fileType);

      const response = await axiosPrivate.post(
        `/complaints/${complaintId}/attachments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    /**
     * Delete an attachment
     * @param {number} complaintId - The complaint ID
     * @param {number} attachmentId - The attachment ID
     * @returns {Promise} Response
     */
    delete: async (complaintId, attachmentId) => {
      const response = await axiosPrivate.delete(
        `/complaints/${complaintId}/attachments/${attachmentId}/`
      );
      return response.data;
    },
  },

  // ============================================================================
  // COMPLAINT TIMELINE
  // ============================================================================

  timeline: {
    /**
     * Get timeline for a complaint
     * @param {number} complaintId - The complaint ID
     * @returns {Promise} Array of timeline entries
     */
    getAll: async (complaintId) => {
      const response = await axiosPrivate.get(`/complaints/${complaintId}/timeline/`);
      return response.data;
    },

    /**
     * Get a specific timeline entry
     * @param {number} complaintId - The complaint ID
     * @param {number} timelineId - The timeline entry ID
     * @returns {Promise} Timeline entry object
     */
    get: async (complaintId, timelineId) => {
      const response = await axiosPrivate.get(
        `/complaints/${complaintId}/timeline/${timelineId}/`
      );
      return response.data;
    },
  },

  // ============================================================================
  // COMPLAINT RESOLUTION
  // ============================================================================

  resolution: {
    /**
     * Get resolution for a complaint
     * @param {number} complaintId - The complaint ID
     * @returns {Promise} Resolution object or null if not exists
     */
    get: async (complaintId) => {
      try {
        const response = await axiosPrivate.get(`/complaints/${complaintId}/resolution/`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },

    /**
     * Create resolution for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {Object} resolutionData - Resolution data
     * @param {string} resolutionData.resolution_notes - Resolution notes
     * @param {string} resolutionData.resolution_date - Resolution date
     * @param {File} resolutionData.proof_image - Proof image
     * @param {File} resolutionData.proof_document - Proof document (optional)
     * @returns {Promise} Created resolution object
     */
    create: async (complaintId, resolutionData) => {
      const formData = new FormData();

      Object.keys(resolutionData).forEach(key => {
        const value = resolutionData[key];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await axiosPrivate.post(
        `/complaints/${complaintId}/resolution/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    /**
     * Update resolution for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {number} resolutionId - The resolution ID
     * @param {Object} resolutionData - Updated resolution data
     * @returns {Promise} Updated resolution object
     */
    update: async (complaintId, resolutionId, resolutionData) => {
      const formData = new FormData();

      Object.keys(resolutionData).forEach(key => {
        const value = resolutionData[key];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await axiosPrivate.patch(
        `/complaints/${complaintId}/resolution/${resolutionId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    /**
     * Delete resolution for a complaint
     * @param {number} complaintId - The complaint ID
     * @param {number} resolutionId - The resolution ID
     * @returns {Promise} Response
     */
    delete: async (complaintId, resolutionId) => {
      const response = await axiosPrivate.delete(
        `/complaints/${complaintId}/resolution/${resolutionId}/`
      );
      return response.data;
    },
  },

  // ============================================================================
  // OFFICER NOTES
  // ============================================================================

  notes: {
    /**
     * Get all notes for a complaint
     * @param {number} complaintId - The complaint ID
     * @returns {Promise} Array of notes
     */
    getAll: async (complaintId) => {
      const response = await axiosPrivate.get(`/complaints/${complaintId}/notes/`);
      return response.data;
    },

    /**
     * Add a note to a complaint
     * @param {number} complaintId - The complaint ID
     * @param {Object} noteData - Note data
     * @param {string} noteData.notes - The note content
     * @param {boolean} noteData.is_internal - Whether note is internal (default: true)
     * @returns {Promise} Created note object
     */
    add: async (complaintId, noteData) => {
      const response = await axiosPrivate.post(
        `/complaints/${complaintId}/notes/`,
        noteData
      );
      return response.data;
    },

    /**
     * Update a note
     * @param {number} complaintId - The complaint ID
     * @param {number} noteId - The note ID
     * @param {Object} noteData - Updated note data
     * @returns {Promise} Updated note object
     */
    update: async (complaintId, noteId, noteData) => {
      const response = await axiosPrivate.patch(
        `/complaints/${complaintId}/notes/${noteId}/`,
        noteData
      );
      return response.data;
    },

    /**
     * Delete a note
     * @param {number} complaintId - The complaint ID
     * @param {number} noteId - The note ID
     * @returns {Promise} Response
     */
    delete: async (complaintId, noteId) => {
      const response = await axiosPrivate.delete(
        `/complaints/${complaintId}/notes/${noteId}/`
      );
      return response.data;
    },
  },
};
