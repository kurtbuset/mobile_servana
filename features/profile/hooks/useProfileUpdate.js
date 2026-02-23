import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { profileAPI } from '../../../shared/api';
import { setClient } from '../../../store/slices/profile';

/**
 * Custom hook for updating profile
 */
export const useProfileUpdate = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    if (!client?.prof_id?.prof_id) {
      return { success: false, error: 'Profile ID not found' };
    }

    setLoading(true);
    setError(null);

    try {
      const data = await profileAPI.updateProfile(
        client.prof_id.prof_id,
        profileData
      );

      // Update Redux state with new profile data
      dispatch(setClient({
        client: {
          ...client,
          prof_id: data.profile,
        },
      }));

      console.log('✅ Profile updated successfully');
      return { success: true, profile: data.profile };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateProfile,
    loading,
    error,
    clearError,
  };
};

export default useProfileUpdate;
