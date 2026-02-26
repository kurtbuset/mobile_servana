/**
 * Text formatting utilities
 */

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Remove extra whitespace
 */
export const normalizeWhitespace = (str) => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Convert to slug (URL-friendly)
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Extract initials from name
 */
export const getInitials = (name, maxLength = 2) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const initials = parts.map((part) => part[0]).join('');
  return initials.substring(0, maxLength).toUpperCase();
};

/**
 * Mask sensitive data (e.g., phone, email)
 */
export const maskString = (str, visibleChars = 4, maskChar = '*') => {
  if (!str) return '';
  if (str.length <= visibleChars) return str;
  const visible = str.slice(-visibleChars);
  const masked = maskChar.repeat(str.length - visibleChars);
  return masked + visible;
};

/**
 * Format phone number
 */
export const formatPhoneDisplay = (phone, countryCode = '+1') => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${countryCode} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export default {
  capitalize,
  capitalizeWords,
  truncate,
  normalizeWhitespace,
  slugify,
  getInitials,
  maskString,
  formatPhoneDisplay,
};
