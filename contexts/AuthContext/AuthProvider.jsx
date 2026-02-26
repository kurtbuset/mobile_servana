import React, { createContext, useState, useCallback, useEffect } from "react";
import SecureStorage from "../../utils/secureStorage";
import TokenValidation from "../../utils/tokenValidation";
import MigrationHelper from "../../utils/migrationHelper";
import AuthStorageService from "../../services/authStorage";

export const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 * Manages authentication state for Viber-style passwordless authentication
 *
 * Provides:
 * - isAuthenticated: Boolean indicating if user has valid token
 * - isLoading: Boolean indicating if auth check is in progress
 * - login: Function to set authenticated state after successful OTP verification
 * - logout: Function to clear authentication state
 * - checkAuthStatus: Function to manually re-check authentication
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState(null);

  /**
   * Check authentication status on app initialization
   * Implements the token validation flow from design document:
   * 1. Check if token exists
   * 2. Validate token expiration locally
   * 3. Set authenticated state if valid
   * 4. Clear state if invalid/expired
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Initialize secure storage if needed
      const initResult = await MigrationHelper.initializeSecureStorage();
      setStorageStatus(initResult);

      if (!initResult.success) {
        console.error(
          "❌ Failed to initialize secure storage:",
          initResult.error,
        );
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify secure storage is working
      const verificationResult = await MigrationHelper.verifySecureStorage();
      if (!verificationResult.success) {
        console.error(
          "❌ Secure storage verification failed:",
          verificationResult.error,
        );
      }

      // 1. Check if token exists
      const token = await SecureStorage.getToken();

      if (!token) {
        // No token → User needs to authenticate
        console.log("ℹ️ No token found - user needs to authenticate");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // 2. Check if token is expired (local validation)
      const isExpired = TokenValidation.isTokenExpired(token);

      if (isExpired) {
        // Token expired → Remove and require re-authentication
        console.log(
          "⏰ Token expired - removing and requiring re-authentication",
        );
        await AuthStorageService.clearAuthData();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // 3. Token is valid locally → Validate with backend
      try {
        // Import authAPI dynamically to avoid circular dependency
        const { authAPI } = await import("../../shared/api");

        // Validate token with backend (checks if client still exists)
        const validationResponse = await authAPI.validateToken();

        // Update profile with latest data from backend
        const profile = validationResponse.client;

        // Use unified service to update both storage layers
        await SecureStorage.setProfile(profile);
        AuthStorageService.getCurrentProfile(); // Sync to Redux if needed
        
        // If profile not in Redux, set it
        if (!AuthStorageService.isAuthenticated()) {
          await AuthStorageService.saveAuthData(token, profile);
        }
        
        setIsAuthenticated(true);
        console.log(
          "✅ Token validated with backend - user authenticated (NO OTP NEEDED)",
        );
      } catch (backendError) {
        // Backend validation failed (client deleted, inactive, or network error)
        console.error("❌ Backend token validation failed:", backendError);

        // Check if it's a 404 (client deleted) or 403 (inactive)
        if (
          backendError.response?.status === 404 ||
          backendError.response?.status === 403
        ) {
          console.log(
            "🚫 Client account no longer valid - clearing auth state",
          );
          await AuthStorageService.clearAuthData();
          setIsAuthenticated(false);
        } else {
          // Network error or other issue - allow offline access with cached profile
          console.warn("⚠️ Backend validation failed, using cached profile");
          const profile = await SecureStorage.getProfile();

          if (profile) {
            // Use unified service to sync to Redux
            const currentToken = await SecureStorage.getToken();
            await AuthStorageService.saveAuthData(currentToken, profile);
            
            setIsAuthenticated(true);
            console.log(
              "✅ Using cached profile - user authenticated (OFFLINE MODE)",
            );
          } else {
            // No cached profile - require re-authentication
            await AuthStorageService.clearAuthData();
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      // Handle token validation errors
      console.error("❌ Token validation error:", error);

      // On error, clear auth state and require re-authentication
      try {
        await AuthStorageService.clearAuthData();
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup after error:", cleanupError);
      }

      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set authenticated state after successful login/registration
   * Called after OTP verification succeeds
   *
   * @param {Object} clientData - Client profile data from backend
   * @param {string} token - JWT token from backend
   * @param {boolean} requiresProfileSetup - Whether user needs to complete profile
   */
  const login = useCallback(async (clientData, token, requiresProfileSetup = false) => {
    try {
      // Use unified service to save to both storage layers
      await AuthStorageService.saveAuthData(token, clientData, requiresProfileSetup);

      // Set authenticated state
      setIsAuthenticated(true);
      console.log("✅ User logged in successfully");
    } catch (error) {
      console.error("❌ Failed to set authenticated state:", error);
      throw error;
    }
  }, []);

  /**
   * Clear authentication state (logout)
   * Removes token and profile from both SecureStorage and Redux
   */
  const logout = useCallback(async () => {
    try {
      // Use unified service to clear both storage layers
      await AuthStorageService.clearAuthData();
      setIsAuthenticated(false);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      throw error;
    }
  }, []);

  /**
   * Update profile data in storage and state
   * Called after profile completion
   *
   * @param {Object} profileData - Updated profile data
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      // Use unified service to update both storage layers
      await AuthStorageService.updateProfile(profileData);
      console.log("✅ Profile updated successfully");
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      throw error;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    isAuthenticated,
    isLoading,
    storageStatus,
    login,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
