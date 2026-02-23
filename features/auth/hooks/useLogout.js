import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearCompleteSession } from '../../../utils/secureLogout';

/**
 * Custom hook for logout functionality
 * Handles confirmation, session cleanup, and navigation
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Logout with confirmation dialog
   */
  const logout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  /**
   * Logout without confirmation (for programmatic logout)
   */
  const logoutSilent = async () => {
    await performLogout();
  };

  /**
   * Perform the actual logout
   */
  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear complete session (Redux, SecureStorage, Socket)
      await clearCompleteSession(dispatch);
      
      // Navigate to login screen
      navigation.replace('Login');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      Alert.alert(
        'Error',
        'Failed to logout. Please try again.',
        [{ text: 'OK' }]
      );
      
      return { success: false, error };
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,           // Logout with confirmation
    logoutSilent,     // Logout without confirmation
    isLoggingOut,     // Loading state
  };
};

export default useLogout;
