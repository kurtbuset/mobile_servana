import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  try {
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumber, countryCode);
    
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'Invalid phone number' };
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate name (first, middle, last)
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true, error: null };
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (dateString) => {
  if (!dateString) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const date = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();

  if (age < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }

  if (age > 120) {
    return { isValid: false, error: 'Invalid date of birth' };
  }

  return { isValid: true, error: null };
};

export default {
  validatePhoneNumber,
  validatePassword,
  validatePasswordMatch,
  validateEmail,
  validateName,
  validateDateOfBirth,
};
