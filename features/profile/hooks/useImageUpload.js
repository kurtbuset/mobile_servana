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
  const client = useSelector((state) => state.client.data);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return { success: true, image: result.assets[0] };
      }

      return { success: false, cancelled: true };
    } catch (err) {
      return { success: false, error: 'Failed to pick image' };
    }
  };

  const uploadImage = async (imageUri) => {
    if (!client?.prof_id?.prof_id) {
      return { success: false, error: 'Profile ID not found' };
    }

    setLoading(true);
    setError(null);

    try {
      const imageData = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      };

      const data = await profileAPI.uploadProfilePicture(
        client.prof_id.prof_id,
        imageData
      );

      // Update Redux state
      dispatch(setClient({
        client: {
          ...client,
          prof_id: {
            ...client.prof_id,
            prof_picture: data.picture_url,
          },
        },
      }));

      // Store in SecureStorage
      await SecureStorage.setProfile({
        ...client.prof_id,
        profile_picture: data.picture_url,
      });

      console.log('✅ Profile picture uploaded successfully');
      return { success: true, pictureUrl: data.picture_url };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
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

      // Update Redux state
      dispatch(setClient({
        client: {
          ...client,
          prof_id: {
            ...client.prof_id,
            prof_picture: null,
          },
        },
      }));

      console.log('✅ Profile picture deleted');
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
