import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../../shared/api';
import { setClient } from '../../../store/slices/profile';
import SecureStorage from '../../../utils/secureStorage';
import { clearCompleteSession } from '../../../utils/secureLogout';

export const useLogin = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (countryCode, phoneNumber, password) => {
    setLoading(true);
    setError(null);

    try {
      // Clear any existing session data before login
      await clearCompleteSession(dispatch);

      // Call login API
      const result = await authAPI.login(countryCode, phoneNumber, password);

      // Store token securely
      await SecureStorage.setToken(result.token);
      console.log('🔐 Token stored in SecureStorage');

      // Restore profile picture from SecureStorage if it exists
      const profile = await SecureStorage.getProfile();
      if (profile?.profile_picture && result.client?.prof_id) {
        result.client.prof_id.prof_picture = profile.profile_picture;
        console.log('📸 Profile picture restored from SecureStorage');
      }

      // Clear and recreate socket with new token
      const { clearSocket } = require('../../../socket');
      clearSocket();
      console.log('🔌 Socket cleared, will be recreated with new token');

      // Update Redux state - single dispatch to profile slice
      // This stores the complete client data including authentication info
      dispatch(setClient({ client: result.client }));

      return { success: true, client: result.client };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Unable to login. Please check your credentials and try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    loading,
    error,
    clearError,
  };
};

export default useLogin;
