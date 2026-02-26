import { getExampleNumber } from 'libphonenumber-js';

/**
 * Format phone number input based on country
 */
export const formatPhoneNumber = (text, countryCode) => {
  const digitsOnly = text.replace(/\D/g, '');
  
  try {
    const example = getExampleNumber(countryCode, 'mobile');
    const maxLength = example?.nationalNumber?.length || 10;
    
    if (digitsOnly.length <= maxLength) {
      return digitsOnly;
    }
    return digitsOnly.substring(0, maxLength);
  } catch {
    // Fallback if country not found
    if (digitsOnly.length <= 15) {
      return digitsOnly;
    }
    return digitsOnly.substring(0, 15);
  }
};

/**
 * Format date to ISO string
 */
export const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

/**
 * Validate phone number length
 */
export const isValidPhoneLength = (phoneNumber, countryCode) => {
  if (!phoneNumber) return false;
  
  try {
    const example = getExampleNumber(countryCode, 'mobile');
    const expectedLength = example?.nationalNumber?.length || 10;
    return phoneNumber.length >= expectedLength - 2 && 
           phoneNumber.length <= expectedLength + 2;
  } catch {
    return phoneNumber.length >= 8 && phoneNumber.length <= 15;
  }
};

/**
 * Create signup data object
 */
export const createSignUpData = (formData) => {
  return {
    profile: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthdate: formatDate(formData.birthdate),
    },
    auth: {
      client_country_code: formData.countryCode,
      client_number: formData.phoneNumber,
      password: formData.password,
    },
  };
};

export default {
  formatPhoneNumber,
  formatDate,
  isValidPhoneLength,
  createSignUpData,
};
