/**
 * Retry helper for failed network requests
 */

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Retry with custom condition
 */
export const retryWithCondition = async (
  fn,
  shouldRetry,
  maxRetries = 3,
  delay = 1000
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      console.log(`Retry attempt ${attempt + 1}/${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors
  if (!error.response) return true;

  // Server errors (5xx)
  if (error.response.status >= 500) return true;

  // Rate limiting (429)
  if (error.response.status === 429) return true;

  // Timeout
  if (error.code === 'ECONNABORTED') return true;

  return false;
};

export default {
  retryWithBackoff,
  retryWithCondition,
  isRetryableError,
};
