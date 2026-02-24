import { jwtDecode } from "jwt-decode";
import SecureStorage from "./secureStorage";

/**
 * Token validation utility for handling JWT token operations
 * Provides functions to check token existence, decode, validate expiration, and cleanup
 */
class TokenValidation {
  /**
   * Check if a token exists in secure storage
   * @returns {Promise<boolean>} - True if token exists, false otherwise
   */
  static async tokenExists() {
    try {
      const token = await SecureStorage.getToken();
      return token !== null && token !== undefined && token !== "";
    } catch (error) {
      console.error("TokenValidation tokenExists error:", error);
      return false;
    }
  }

  /**
   * Decode a JWT token without verifying signature
   * @param {string} token - JWT token to decode
   * @returns {Object|null} - Decoded token payload or null if invalid
   */
  static decodeToken(token) {
    try {
      if (!token || typeof token !== "string") {
        return null;
      }
      return jwtDecode(token);
    } catch (error) {
      console.error("TokenValidation decodeToken error:", error);
      return null;
    }
  }

  /**
   * Check if a token is expired
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is expired, false otherwise
   */
  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true; // Consider invalid tokens as expired
      }

      const currentTime = Date.now() / 1000; // Convert to seconds
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("TokenValidation isTokenExpired error:", error);
      return true; // Consider error case as expired
    }
  }

  /**
   * Validate token locally (checks existence and expiration)
   * @returns {Promise<boolean>} - True if token is valid, false otherwise
   */
  static async isTokenValid() {
    try {
      const token = await SecureStorage.getToken();

      if (!token) {
        return false;
      }

      return !this.isTokenExpired(token);
    } catch (error) {
      console.error("TokenValidation isTokenValid error:", error);
      return false;
    }
  }

  /**
   * Get token expiration time
   * @returns {Promise<Date|null>} - Expiration date or null if token invalid
   */
  static async getTokenExpiration() {
    try {
      const token = await SecureStorage.getToken();

      if (!token) {
        return null;
      }

      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000); // Convert from seconds to milliseconds
    } catch (error) {
      console.error("TokenValidation getTokenExpiration error:", error);
      return null;
    }
  }

  /**
   * Remove expired token from storage
   * @returns {Promise<boolean>} - True if token was removed, false if token was valid or didn't exist
   */
  static async removeExpiredToken() {
    try {
      const token = await SecureStorage.getToken();

      if (!token) {
        return false; // No token to remove
      }

      if (this.isTokenExpired(token)) {
        await SecureStorage.removeToken();
        console.log("TokenValidation: Expired token removed");
        return true;
      }

      return false; // Token is still valid
    } catch (error) {
      console.error("TokenValidation removeExpiredToken error:", error);
      return false;
    }
  }

  /**
   * Get decoded token data from storage
   * @returns {Promise<Object|null>} - Decoded token payload or null
   */
  static async getDecodedToken() {
    try {
      const token = await SecureStorage.getToken();

      if (!token) {
        return null;
      }

      return this.decodeToken(token);
    } catch (error) {
      console.error("TokenValidation getDecodedToken error:", error);
      return null;
    }
  }

  /**
   * Get client ID from token
   * @returns {Promise<number|null>} - Client ID or null
   */
  static async getClientId() {
    try {
      const decoded = await this.getDecodedToken();
      return decoded?.client_id || null;
    } catch (error) {
      console.error("TokenValidation getClientId error:", error);
      return null;
    }
  }

  /**
   * Check if token will expire soon (within specified minutes)
   * @param {number} minutes - Number of minutes to check ahead (default: 60)
   * @returns {Promise<boolean>} - True if token expires soon
   */
  static async willExpireSoon(minutes = 60) {
    try {
      const expirationDate = await this.getTokenExpiration();

      if (!expirationDate) {
        return true; // No valid expiration means it should be refreshed
      }

      const now = new Date();
      const minutesUntilExpiry = (expirationDate - now) / (1000 * 60);

      return minutesUntilExpiry <= minutes;
    } catch (error) {
      console.error("TokenValidation willExpireSoon error:", error);
      return true;
    }
  }
}

export default TokenValidation;
