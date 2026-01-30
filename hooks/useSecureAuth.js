import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setClient } from '../slices/clientSlice';
import SecureStorage from '../utils/secureStorage';
import MigrationHelper from '../utils/migrationHelper';

/**
 * Custom hook for secure authentication state management
 * Uses only SecureStorage - AsyncStorage completely removed
 */
export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageStatus, setStorageStatus] = useState(null);
  const dispatch = useDispatch();

  // Restore authentication state on app startup
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        // Initialize secure storage if needed
        const initResult = await MigrationHelper.initializeSecureStorage();
        setStorageStatus(initResult);
        
        if (!initResult.success) {
          console.error('❌ Failed to initialize secure storage:', initResult.error);
        }

        // Verify secure storage is working
        const verificationResult = await MigrationHelper.verifySecureStorage();
        if (!verificationResult.success) {
          console.error('❌ Secure storage verification failed:', verificationResult.error);
        }

        // Try to restore authentication from secure storage
        const token = await SecureStorage.getToken();
        const profile = await SecureStorage.getProfile();
        
        if (token && profile) {
          dispatch(setClient({ 
            client: profile
            // Token no longer stored in Redux for security
          }));
          setIsAuthenticated(true);
          console.log('✅ Authentication state restored from secure storage');
        } else {
          console.log('ℹ️ No stored authentication found');
        }
      } catch (error) {
        console.error('❌ Failed to restore auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuthState();
  }, [dispatch]);

  const clearAuthState = async () => {
    try {
      await SecureStorage.removeToken();
      await SecureStorage.removeProfile();
      setIsAuthenticated(false);
      console.log('✅ Authentication state cleared from secure storage');
    } catch (error) {
      console.error('❌ Failed to clear auth state:', error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    storageStatus,
    clearAuthState
  };
};

export default useSecureAuth;