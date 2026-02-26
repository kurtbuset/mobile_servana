import { useState } from 'react';
import { useSelector } from 'react-redux';
import { profileAPI } from '../../../shared/api';
import { authAPI } from '../../../shared/api';
import AuthStorageService from '../../../services/authStorage';

/**
 * Custom hook for updating profile
 * Handles both creating new profile and updating existing profile
 * Uses centralized AuthStorageService to keep Redux and SecureStorage in sync
 */
export const useProfileUpdate = () => {
  const client = useSelector((state) => state.profile.client);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      // Check if client has a profile
      const hasProfile = client?.prof_id?.prof_id;

      let data;

      if (!hasProfile) {
        // CREATE NEW PROFILE
        console.log('📝 Creating new profile...');
        
        // Use completeProfile API (creates profile and links to client)
        data = await authAPI.completeProfile(
          profileData.prof_firstname || '',
          profileData.prof_lastname || ''
        );
        
        console.log('✅ Profile created:', data);
      } else {
        // UPDATE EXISTING PROFILE
        console.log('📝 Updating existing profile:', client.prof_id.prof_id);
        
        data = await profileAPI.updateProfile(
          client.prof_id.prof_id,
          profileData
        );
        
        console.log('✅ Profile updated:', data);
      }

      // Use centralized AuthStorageService to update both Redux and SecureStorage
      await AuthStorageService.updateProfile(data.profile);
      
      console.log('✅ Profile synchronized across both storage layers');

      return { success: true, profile: data.profile };
    } catch (err) {
      console.error('❌ Profile update error:', err);
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
