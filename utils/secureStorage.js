import logger from './logger';

import * as SecureStore from "expo-secure-store";

/**
 * Secure storage utility for handling sensitive data like tokens
 * Uses iOS Keychain and Android Keystore for hardware-backed encryption
 *
 * Token Storage:
 * - Supports long-lived JWT tokens (30-day expiry for Viber-style authentication)
 * - Token expiration is managed by the JWT exp claim, not by storage
 * - Tokens persist across app restarts and updates
 * - Use TokenValidation utility to check token validity before use
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
      logger.error(`SecureStorage setItem error for key ${key}:`, error);
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
      logger.error(`SecureStorage getItem error for key ${key}:`, error);
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
      logger.error(`SecureStorage removeItem error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all secure storage (use with caution)
   */
  static async clear() {
    try {
      // Remove known keys - SecureStore doesn't have a clear all method
      const knownKeys = ["token", "profile", "client_data"];
      await Promise.all(knownKeys.map((key) => this.removeItem(key)));
    } catch (error) {
      logger.error("SecureStorage clear error:", error);
      throw error;
    }
  }

  // Token-specific methods for convenience
  /**
   * Store JWT authentication token
   * Supports long-lived tokens (30-day expiry for Viber-style auth)
   * Token expiration is encoded in the JWT itself (exp claim)
   *
   * @param {string} token - JWT token from backend (30-day expiry)
   * @returns {Promise<void>}
   */
  static async setToken(token) {
    return this.setItem("token", token);
  }

  /**
   * Retrieve JWT authentication token. Returns null if missing or empty.
   */
  static async getToken() {
    try {
      const token = await this.getItem("token");

      // Return null for empty strings or undefined
      if (!token || token.trim() === "") {
        return null;
      }

      return token;
    } catch (error) {
      logger.error("SecureStorage getToken error:", error);
      return null;
    }
  }

  /**
   * Remove JWT authentication token
   * Called on logout or when token is expired/invalid
   *
   * @returns {Promise<void>}
   */
  static async removeToken() {
    return this.removeItem("token");
  }

  // Profile-specific methods
  static async setProfile(profile) {
    return this.setItem("profile", JSON.stringify(profile));
  }

  static async getProfile() {
    const profileStr = await this.getItem("profile");
    return profileStr ? JSON.parse(profileStr) : null;
  }

  static async removeProfile() {
    return this.removeItem("profile");
  }
}

export default SecureStorage;
