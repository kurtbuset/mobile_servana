import apiClient from './client';
import { AUTH_ENDPOINTS } from './endpoints';

/**
 * Login with phone number and password
 */
export const login = async (countryCode, phoneNumber, password) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
    client_country_code: countryCode,
    client_number: phoneNumber,
    client_password: password,
  });
  return response.data;
};

/**
 * Sign up new user
 */
export const signUp = async (userData) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, userData);
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (phoneNumber, otp) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, {
    phone_number: phoneNumber,
    otp_code: otp,
  });
  return response.data;
};

/**
 * Send OTP code
 */
export const sendOtp = async ({ phone_country_code, phone_number }) => {
  const response = await apiClient.post('/clientAccount/auth/send-otp', {
    phone_country_code,
    phone_number,
  });
  return response.data;
};

/**
 * Verify OTP during registration
 */
export const verifyOtp = async ({ phone_country_code, phone_number, otp }) => {
  const response = await apiClient.post('/clientAccount/auth/verify-otp', {
    phone_country_code,
    phone_number,
    otp,
  });
  return response.data;
};

/**
 * Complete registration after OTP verification
 */
export const completeRegistration = async (userData) => {
  const response = await apiClient.post('/clientAccount/auth/complete-registration', userData);
  return response.data;
};

/**
 * Request password reset
 */
export const forgotPassword = async (countryCode, phoneNumber) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    client_country_code: countryCode,
    client_number: phoneNumber,
  });
  return response.data;
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (phoneNumber, otp, newPassword) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
    phone_number: phoneNumber,
    otp_code: otp,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Change password (authenticated)
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  return response.data;
};

export default {
  login,
  signUp,
  verifyOTP,
  sendOtp,
  verifyOtp,
  completeRegistration,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};
