import { getItem, setItem, removeItem } from './asyncStorage';

/**
 * Cache manager with TTL support
 */

const CACHE_PREFIX = '@cache:';

/**
 * Set cache with TTL
 */
export const setCache = async (key, value, ttlMinutes = 60) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  const cacheData = {
    value,
    expiresAt,
  };

  return await setItem(cacheKey, cacheData);
};

/**
 * Get cache if not expired
 */
export const getCache = async (key) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cacheData = await getItem(cacheKey);

  if (!cacheData) {
    return null;
  }

  // Check if expired
  if (Date.now() > cacheData.expiresAt) {
    await removeItem(cacheKey);
    return null;
  }

  return cacheData.value;
};

/**
 * Remove cache
 */
export const removeCache = async (key) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  return await removeItem(cacheKey);
};

/**
 * Clear all expired cache
 */
export const clearExpiredCache = async () => {
  const { getAllKeys } = require('./asyncStorage');
  const keys = await getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

  for (const key of cacheKeys) {
    const cacheData = await getItem(key);
    if (cacheData && Date.now() > cacheData.expiresAt) {
      await removeItem(key);
    }
  }
};

export default {
  setCache,
  getCache,
  removeCache,
  clearExpiredCache,
};
