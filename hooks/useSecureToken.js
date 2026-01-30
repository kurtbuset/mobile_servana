import { useState, useEffect } from 'react';
import SecureStorage from '../utils/secureStorage';

/**
 * Custom hook for secure token management
 * Retrieves token directly from SecureStorage, never from Redux
 */
export const useSecureToken = () => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from secure storage
  const loadToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedToken = await SecureStorage.getToken();
      setToken(storedToken);
      return storedToken;
    } catch (err) {
      console.error('❌ Failed to load token from secure storage:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update token in secure storage
  const updateToken = async (newToken) => {
    try {
      setError(null);
      if (newToken) {
        await SecureStorage.setToken(newToken);
        setToken(newToken);
        console.log('✅ Token updated in secure storage');
      } else {
        await SecureStorage.removeToken();
        setToken(null);
        console.log('✅ Token removed from secure storage');
      }
      return true;
    } catch (err) {
      console.error('❌ Failed to update token in secure storage:', err);
      setError(err.message);
      return false;
    }
  };

  // Clear token from secure storage
  const clearToken = async () => {
    return await updateToken(null);
  };

  // Refresh token from storage
  const refreshToken = async () => {
    return await loadToken();
  };

  // Load token on hook initialization
  useEffect(() => {
    loadToken();
  }, []);

  return {
    token,
    isLoading,
    error,
    updateToken,
    clearToken,
    refreshToken,
    hasToken: !!token
  };
};

/**
 * Hook for getting token synchronously (for components that need immediate access)
 * Use with caution - prefer useSecureToken for most cases
 */
export const useTokenSync = () => {
  const getToken = async () => {
    try {
      return await SecureStorage.getToken();
    } catch (error) {
      console.error('❌ Failed to get token synchronously:', error);
      return null;
    }
  };

  return { getToken };
};

export default useSecureToken;