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
  const formData = new FormData();
  formData.append('picture', {
    uri: imageData.uri,
    type: imageData.type || 'image/jpeg',
    name: imageData.name || 'profile.jpg',
  });

  const response = await apiClient.post(
    PROFILE_ENDPOINTS.UPLOAD_PICTURE(profileId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
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
