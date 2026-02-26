import apiClient from "./client";
import { OTP_ENDPOINTS, AUTH_ENDPOINTS } from "./endpoints";

/**
 * Verify OTP code (Legacy)
 */
export const verifyOTP = async (phoneNumber, otp) => {
  const response = await apiClient.post(OTP_ENDPOINTS.VERIFY_OTP, {
    phone_number: phoneNumber,
    otp_code: otp,
  });
  return response.data;
};

/**
 * Send OTP code (Legacy)
 */
export const sendOtp = async ({ phone_country_code, phone_number }) => {
  const response = await apiClient.post(OTP_ENDPOINTS.SEND_OTP, {
    phone_country_code,
    phone_number,
  });
  return response.data;
};

/**
 * Request OTP for authentication (unified for login/registration)
 * @param {string} phoneCountryCode - Country code (e.g., "+63")
 * @param {string} phoneNumber - Phone number without country code
 * @returns {Promise<{message: string, is_new_user: boolean, otp_expires_in: number}>}
 */
export const requestOtp = async (phoneCountryCode, phoneNumber) => {
  const response = await apiClient.post(OTP_ENDPOINTS.REQUEST_OTP, {
    phone_country_code: phoneCountryCode,
    phone_number: phoneNumber,
  });
  return response.data;
};

/**
 * Verify OTP for authentication (unified for login/registration)
 * @param {string} phoneCountryCode - Country code (e.g., "+63")
 * @param {string} phoneNumber - Phone number without country code
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{message: string, is_new_user: boolean, requires_profile: boolean, token: string, client: object}>}
 */
export const verifyOtp = async (phoneCountryCode, phoneNumber, otp) => {
  const response = await apiClient.post(OTP_ENDPOINTS.VERIFY_OTP, {
    phone_country_code: phoneCountryCode,
    phone_number: phoneNumber,
    otp: otp,
  });
  return response.data;
};

/**
 * Validate token with backend
 * Checks if token is still valid and client exists in database
 * @returns {Promise<{message: string, client: object}>}
 */
export const validateToken = async () => {
  const response = await apiClient.get(AUTH_ENDPOINTS.VALIDATE_TOKEN);
  return response.data;
};

/**
 * Complete user profile (optional after registration)
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @returns {Promise<{message: string, profile: object}>}
 */
export const completeProfile = async (firstname, lastname) => {
  console.log('firstname: ', firstname)
  console.log('lastname: ', lastname)
  const response = await apiClient.post(AUTH_ENDPOINTS.COMPLETE_PROFILE, {
    firstname,
    lastname
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
  verifyOTP,
  sendOtp,
  requestOtp,
  verifyOtp,
  validateToken,
  completeProfile,
  logout,
};
