/**
 * Input validation utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { isValid: false, strength: 'none', message: 'Password is required' };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  if (passedChecks >= 4) strength = 'strong';
  else if (passedChecks >= 3) strength = 'medium';

  const isValid = checks.length && checks.uppercase && checks.lowercase && checks.number;

  return {
    isValid,
    strength,
    checks,
    message: isValid ? 'Password is valid' : 'Password does not meet requirements',
  };
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber) return false;

  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

/**
 * Validate age (minimum age requirement)
 */
export const isValidAge = (birthdate, minAge = 13) => {
  if (!birthdate) return false;
  const birth = new Date(birthdate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
};

export default {
  isValidEmail,
  isValidURL,
  isValidPhone,
  validatePasswordStrength,
  isValidCreditCard,
  isValidDateRange,
  isValidAge,
};
