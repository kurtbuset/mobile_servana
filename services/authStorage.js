import SecureStorage from '../utils/secureStorage';
import { store } from '../store';
import { setClient, clearProfile } from '../store/slices/profile';

/**
 * Unified Authentication Storage Service
 * 
 * Manages authentication data across both storage layers:
 * - SecureStorage (persistent, encrypted)
 * - Redux (in-memory, fast access)
 * 
 * Ensures both layers stay in sync for all auth operations.
 */
class AuthStorageService {
  /**
   * Save authentication data to both storage layers
   * Called after successful login/registration
   * 
   * @param {string} token - JWT token from backend
   * @param {Object} clientData - Client profile data
   * @param {boolean} requiresProfileSetup - Whether user needs to complete profile
   */
  async saveAuthData(token, clientData, requiresProfileSetup = false) {
    try {
      // Save to persistent storage
      await SecureStorage.setToken(token);
      await SecureStorage.setProfile(clientData);
      
      // Update Redux state with profile setup flag
      store.dispatch(setClient({ 
        client: clientData,
        requiresProfileSetup: requiresProfileSetup
      }));
      
      console.log('✅ Auth data saved to both storage layers');
    } catch (error) {
      console.error('❌ Failed to save auth data:', error);
      throw error;
    }
  }
  
  /**
   * Update profile in both storage layers
   * Called after profile updates (e.g., completing profile)
   * 
   * @param {Object} profileData - Updated profile fields or full profile object
   * @returns {Object} Updated complete client object
   */
  async updateProfile(profileData) {
    try {
      // Get current client from SecureStorage
      const currentClient = await SecureStorage.getProfile();
      
      // Check if profileData is a full profile object (has prof_id field)
      // or just profile fields to update
      let updatedClient;
      
      if (profileData.prof_id !== undefined) {
        // Full profile object from backend - replace the entire prof_id
        updatedClient = {
          ...currentClient,
          prof_id: profileData,
        };
      } else {
        // Partial profile fields - merge into existing prof_id
        updatedClient = {
          ...currentClient,
          prof_id: {
            ...currentClient.prof_id,
            ...profileData,
          },
        };
      }
      
      // Save to persistent storage
      await SecureStorage.setProfile(updatedClient);
      
      // Update Redux state
      store.dispatch(setClient({ client: updatedClient }));
      
      console.log('✅ Profile updated in both storage layers');
      return updatedClient;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }
  
  /**
   * Clear all authentication data from both storage layers
   * Called during logout
   * 
   * This ensures complete cleanup:
   * - Removes token from SecureStorage
   * - Removes profile from SecureStorage
   * - Clears Redux state (client, error, updateSuccess)
   */
  async clearAuthData() {
    try {
      // Clear persistent storage
      await SecureStorage.removeToken();
      await SecureStorage.removeProfile();
      
      // Clear Redux state
      store.dispatch(clearProfile());
      
      console.log('✅ Auth data cleared from both storage layers');
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
      throw error;
    }
  }
  
  /**
   * Get current profile from Redux (fast, synchronous)
   * Use this for reading profile data in components
   * 
   * @returns {Object|null} Current client profile or null
   */
  getCurrentProfile() {
    return store.getState().profile.client;
  }
  
  /**
   * Check if user is authenticated (has profile in Redux)
   * 
   * @returns {boolean} True if profile exists in Redux
   */
  isAuthenticated() {
    return this.getCurrentProfile() !== null;
  }
}

// Export singleton instance
export default new AuthStorageService();
