import { Alert } from 'react-native';
import { clearClient } from '../slices/clientSlice';
import SecureStorage from './secureStorage';
import { disconnectSocket } from '../socket';

/**
 * Secure logout utility function
 * Clears both Redux state and secure storage, and disconnects socket
 */
export const performSecureLogout = async (dispatch, navigation) => {
  try {
    // Disconnect socket first to prevent any further communication
    disconnectSocket();
    console.log('🔌 Socket disconnected during logout');
    
    // Clear Redux state
    dispatch(clearClient());
    
    // Clear secure storage
    await SecureStorage.removeToken();
    await SecureStorage.removeProfile();
      
    console.log('✅ Secure logout completed');
    
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

export default { performSecureLogout, confirmSecureLogout };