import logger from '../../../utils/logger';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { profileAPI } from '../../../shared/api';
import { setClient } from '../../../store/slices/profile';
import SecureStorage from '../../../utils/secureStorage';

/**
 * Custom hook for profile image upload
 */
export const useImageUpload = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.profile.client);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        return { 
          success: false, 
          error: 'Permission to access gallery is required' 
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return { success: true, image: result.assets[0] };
      }

      return { success: false, cancelled: true };
    } catch (err) {
      logger.error('Image picker error:', err);
      return { success: false, error: err.message || 'Failed to pick image' };
    }
  };

  const uploadImage = async (imageUri) => {
    if (!client?.prof_id?.prof_id) {
      return { success: false, error: 'Profile ID not found' };
    }

    setLoading(true);
    setError(null);

    try {
      // Extract filename from URI or use default
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1] || 'profile.jpg';
      
      // Determine file type from URI or filename
      let fileType = 'image/jpeg';
      if (fileName.toLowerCase().endsWith('.png')) {
        fileType = 'image/png';
      } else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
        fileType = 'image/jpeg';
      }

      const imageData = {
        uri: imageUri,
        type: fileType,
        name: fileName,
      };

      logger.info('Uploading image:', { profileId: client.prof_id.prof_id, imageData });

      const data = await profileAPI.uploadProfilePicture(
        client.prof_id.prof_id,
        imageData
      );

      // Update Redux state with new image data
      dispatch(setClient({
        client: {
          ...client,
          prof_id: {
            ...client.prof_id,
            current_image: data.image, // Update current_image from image table
            prof_picture: data.picture_url, // Keep for backward compatibility
          },
        },
      }));

      // Store in SecureStorage
      await SecureStorage.setProfile({
        ...client.prof_id,
        current_image: data.image,
        prof_picture: data.picture_url,
      });

      logger.info('✅ Profile picture uploaded successfully');
      return { success: true, pictureUrl: data.picture_url };
    } catch (err) {
      logger.error('Upload error:', err);
      logger.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || 
        err.message ||
        'Failed to upload image';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async () => {
    if (!client?.prof_id?.prof_id) {
      return { success: false, error: 'Profile ID not found' };
    }

    setLoading(true);
    setError(null);

    try {
      await profileAPI.deleteProfilePicture(client.prof_id.prof_id);

      // Update Redux state - remove current_image
      dispatch(setClient({
        client: {
          ...client,
          prof_id: {
            ...client.prof_id,
            current_image: null,
            prof_picture: null,
          },
        },
      }));

      logger.info('✅ Profile picture deleted');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to delete image';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    uploadImage,
    deleteImage,
    loading,
    error,
  };
};

export default useImageUpload;
