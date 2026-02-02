import { Alert } from 'react-native';
import { clearClient } from '../slices/clientSlice';
import SecureStorage from './secureStorage';
import socket from '../socket';

/**
 * Complete session cleanup - clears all user data
 * Use this when switching users or during registration/login
 */
export const clearCompleteSession = async (dispatch = null) => {
  try {
    socket.disconnect()
    console.log('🔌 Socket disconnected during session clear');
    
    // Clear Redux state if dispatch is available
    if (dispatch) {
      dispatch(clearClient());
    }
    
    // Clear all secure storage
    await SecureStorage.clear();
      
    console.log('✅ Complete session cleared');
  } catch (error) {
    console.error('❌ Session clear error:', error);
    throw error;
  }
};

/**
 * Secure logout utility function
 * Clears both Redux state and secure storage, and disconnects socket
 */
export const performSecureLogout = async (dispatch, navigation) => {
  try {
    await clearCompleteSession(dispatch);
    
    // Navigate to login screen
    navigation.navigate('Login');
  } catch (error) {
    console.error('❌ Logout error:', error);
    Alert.alert('Logout Error', 'Failed to clear secure data');
  }
};

/**
 * Logout with confirmation dialog
 */
export const confirmSecureLogout = (dispatch, navigation) => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: () => performSecureLogout(dispatch, navigation)
      }
    ]
  );
};

export default { performSecureLogout, confirmSecureLogout, clearCompleteSession };