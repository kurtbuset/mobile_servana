import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage utility for non-sensitive data
 * Wrapper around @react-native-async-storage/async-storage
 */

/**
 * Store a value
 */
export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return { success: true };
  } catch (error) {
    console.error(`AsyncStorage setItem error for key ${key}:`, error);
    return { success: false, error };
  }
};

/**
 * Retrieve a value
 */
export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`AsyncStorage getItem error for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove a value
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error(`AsyncStorage removeItem error for key ${key}:`, error);
    return { success: false, error };
  }
};

/**
 * Clear all storage
 */
export const clear = async () => {
  try {
    await AsyncStorage.clear();
    return { success: true };
  } catch (error) {
    console.error('AsyncStorage clear error:', error);
    return { success: false, error };
  }
};

/**
 * Get all keys
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('AsyncStorage getAllKeys error:', error);
    return [];
  }
};

/**
 * Get multiple items
 */
export const multiGet = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, value]) => ({
      key,
      value: value ? JSON.parse(value) : null,
    }));
  } catch (error) {
    console.error('AsyncStorage multiGet error:', error);
    return [];
  }
};

export default {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
};
