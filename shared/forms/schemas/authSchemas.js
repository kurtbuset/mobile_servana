import {
  validatePhoneNumber,
  validatePassword,
  validatePasswordMatch,
} from '../validators';

/**
 * Validate login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validate phone number
  const phoneValidation = validatePhoneNumber(
    formData.phoneNumber,
    formData.countryCode
  );
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.error;
  }

  // Validate password
  if (!formData.password || !formData.password.trim()) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate signup form
 */
export const validateSignUpForm = (formData) => {
  const errors = {};

  // Validate phone number
  const phoneValidation = validatePhoneNumber(
    formData.phoneNumber,
    formData.countryCode
  );
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.error;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  // Validate password confirmation
  const matchValidation = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
  );
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate OTP form
 */
export const validateOTPForm = (otp) => {
  const errors = {};

  if (!otp || !otp.trim()) {
    errors.otp = 'OTP code is required';
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = 'OTP must be 6 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateLoginForm,
  validateSignUpForm,
  validateOTPForm,
};
