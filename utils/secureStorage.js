import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage utility for handling sensitive data like tokens
 * Uses iOS Keychain and Android Keystore for hardware-backed encryption
 */
class SecureStorage {
  /**
   * Store a value securely
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  static async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`SecureStorage setItem error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value securely
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} - Retrieved value or null if not found
   */
  static async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`SecureStorage getItem error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value securely
   * @param {string} key - Storage key
   */
  static async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`SecureStorage removeItem error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all secure storage (use with caution)
   */
  static async clear() {
    try {
      // Remove known keys - SecureStore doesn't have a clear all method
      const knownKeys = ['token', 'profile', 'client_data'];
      await Promise.all(knownKeys.map(key => this.removeItem(key)));
    } catch (error) {
      console.error('SecureStorage clear error:', error);
      throw error;
    }
  }

  // Token-specific methods for convenience
  static async setToken(token) {
    return this.setItem('token', token);
  }

  static async getToken() {
    return this.getItem('token');
  }

  static async removeToken() {
    return this.removeItem('token');
  }

  // Profile-specific methods
  static async setProfile(profile) {
    return this.setItem('profile', JSON.stringify(profile));
  }

  static async getProfile() {
    const profileStr = await this.getItem('profile');
    return profileStr ? JSON.parse(profileStr) : null;
  }

  static async removeProfile() {
    return this.removeItem('profile');
  }
}

export default SecureStorage;