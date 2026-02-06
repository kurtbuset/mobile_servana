import { Alert } from 'react-native';
import { clearClient } from '../slices/clientSlice';
import SecureStorage from './secureStorage';
import { clearSocket } from '../socket';

/**
 * Complete session cleanup - clears all user data except profile picture
 * Use this when switching users or during registration/login
 */
export const clearCompleteSession = async (dispatch = null) => {
  try {
    // Clear socket and disconnect
    clearSocket();
    console.log('🔌 Socket cleared and disconnected during session clear');
    
    // Clear Redux state if dispatch is available
    if (dispatch) {
      dispatch(clearClient());
    }
    
    // Preserve profile picture before clearing
    const profilePicture = await SecureStorage.getItem('profile_picture');
    const profile = await SecureStorage.getProfile();
    const savedProfilePic = profile?.profile_picture || profilePicture;
    
    // Clear all secure storage including token
    await SecureStorage.clear();
    console.log('🔐 Token cleared from SecureStorage during logout');
    
    // Restore profile picture if it existed
    if (savedProfilePic) {
      const restoredProfile = await SecureStorage.getProfile() || {};
      restoredProfile.profile_picture = savedProfilePic;
      await SecureStorage.setProfile(restoredProfile);
      console.log('📸 Profile picture preserved after logout');
    }
      
    console.log('✅ Complete session cleared (profile picture preserved)');
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