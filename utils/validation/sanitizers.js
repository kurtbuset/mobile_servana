/**
 * Input sanitization utilities
 */

/**
 * Remove HTML tags
 */
export const stripHTML = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Escape HTML special characters
 */
export const escapeHTML = (str) => {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize phone number (remove non-digits)
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Sanitize email (lowercase, trim)
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Remove special characters (keep alphanumeric and spaces)
 */
export const removeSpecialChars = (str) => {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Sanitize filename (remove unsafe characters)
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return '';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Trim and normalize whitespace
 */
export const normalizeInput = (str) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};

export default {
  stripHTML,
  escapeHTML,
  sanitizePhone,
  sanitizeEmail,
  removeSpecialChars,
  sanitizeFilename,
  normalizeInput,
};
