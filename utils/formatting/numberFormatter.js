/**
 * Number formatting utilities
 */

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num == null) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value == null) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Abbreviate large numbers (e.g., 1.2K, 3.4M)
 */
export const abbreviateNumber = (num) => {
  if (num == null) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};

/**
 * Parse formatted number back to number
 */
export const parseFormattedNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.-]+/g, ''));
};

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  abbreviateNumber,
  parseFormattedNumber,
};
