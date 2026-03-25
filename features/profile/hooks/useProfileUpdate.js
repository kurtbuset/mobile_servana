import logger from '../../../utils/logger';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { profileAPI } from '../../../shared/api';
import { authAPI } from '../../../shared/api';
import SecureStorage from '../../../utils/secureStorage';
import { setClient } from '../../../store/slices/profile';

export const useProfileUpdate = () => {
  const client = useSelector((state) => state.profile.client);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const hasProfile = client?.prof_id?.prof_id;
      let data;

      if (!hasProfile) {
        data = await authAPI.completeProfile(
          profileData.prof_firstname || '',
          profileData.prof_lastname || ''
        );
      } else {
        data = await profileAPI.updateProfile(client.prof_id.prof_id, profileData);
      }

      // Sync updated profile to both storage layers
      const currentClient = await SecureStorage.getProfile();
      const updatedClient = {
        ...currentClient,
        prof_id: data.profile,
      };
      await SecureStorage.setProfile(updatedClient);
      const { store } = await import('../../../store');
      store.dispatch(setClient({ client: updatedClient }));

      return { success: true, profile: data.profile };
    } catch (err) {
      logger.error('Profile update error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { updateProfile, loading, error, clearError };
};

export default useProfileUpdate;
