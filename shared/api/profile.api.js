import logger from '../../utils/logger';

import apiClient from './client';
import { PROFILE_ENDPOINTS } from './endpoints';

/**
 * Get user profile by ID
 */
export const getProfile = async (profileId) => {
  const response = await apiClient.get(PROFILE_ENDPOINTS.GET_PROFILE(profileId));
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (profileId, profileData) => {
  const response = await apiClient.put(
    PROFILE_ENDPOINTS.UPDATE_PROFILE(profileId),
    profileData
  );
  return response.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (profileId, imageData) => {
  try {
    const formData = new FormData();
    
    // React Native FormData requires this specific format
    formData.append('picture', {
      uri: imageData.uri,
      type: imageData.type || 'image/jpeg',
      name: imageData.name || 'profile.jpg',
    });

    logger.info('📤 Uploading to:', PROFILE_ENDPOINTS.UPLOAD_PICTURE(profileId));
    logger.info('📤 Image data:', { uri: imageData.uri, type: imageData.type, name: imageData.name });

    const response = await apiClient.post(
      PROFILE_ENDPOINTS.UPLOAD_PICTURE(profileId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 60000, // 60 seconds for file upload
        transformRequest: (data, headers) => {
          // Let React Native handle the FormData transformation
          return data;
        },
      }
    );
    
    logger.info('✅ Upload response:', response.data);
    return response.data;
  } catch (error) {
    logger.error('❌ Upload API error:', error);
    logger.error('❌ Error config:', error.config);
    logger.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (profileId) => {
  const response = await apiClient.delete(
    PROFILE_ENDPOINTS.DELETE_PICTURE(profileId)
  );
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
};
