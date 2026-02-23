import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { profileAPI } from '../../../shared/api';

/**
 * Custom hook for fetching profile data
 */
export const useProfile = () => {
  const client = useSelector((state) => state.client.data);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (client?.prof_id) {
      setProfile(client.prof_id);
    }
  }, [client]);

  const refreshProfile = async () => {
    if (!client?.prof_id?.prof_id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await profileAPI.getProfile(client.prof_id.prof_id);
      setProfile(data.profile);
      return { success: true, profile: data.profile };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to load profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
};

export default useProfile;
