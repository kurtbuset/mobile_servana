import { useState } from 'react';
import { authAPI } from '../../../shared/api';

/**
 * Custom hook for password reset functionality
 */
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestReset = async (countryCode, phoneNumber) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authAPI.forgotPassword(countryCode, phoneNumber);
      console.log('✅ Password reset OTP sent');
      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to send reset code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (phoneNumber, otp, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authAPI.resetPassword(phoneNumber, otp, newPassword);
      console.log('✅ Password reset successful');
      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to reset password. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    requestReset,
    resetPassword,
    loading,
    error,
    clearError,
  };
};

export default usePasswordReset;
