import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

/**
 * Custom hook to access authentication context
 *
 * Returns:
 * - isAuthenticated: Boolean indicating if user has valid token
 * - isLoading: Boolean indicating if auth check is in progress
 * - storageStatus: Object with secure storage initialization status
 * - login: Function to set authenticated state after OTP verification
 * - logout: Function to clear authentication state
 * - updateProfile: Function to update profile data
 * - checkAuthStatus: Function to manually re-check authentication
 *
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
