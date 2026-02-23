import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Centralized environment variables and configuration
 */

// Environment detection
export const ENV = {
  DEV: __DEV__,
  PROD: !__DEV__,
  PLATFORM: Platform.OS,
  IS_WEB: Platform.OS === 'web',
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
};

// API Configuration
const getAPIURL = () => {
  // Check for environment variable first
  const envURL = Constants.expoConfig?.extra?.apiUrl;
  if (envURL) return envURL;

  // Platform-specific defaults
  if (ENV.IS_WEB) {
    return 'http://localhost:5000';
  }

  if (ENV.DEV) {
    // Development: Use computer's IP for real devices
    return 'http://172.26.240.1:5000';
  }

  // Production
  return 'https://api.servana.com';
};

export const API_CONFIG = {
  BASE_URL: getAPIURL(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: API_CONFIG.BASE_URL,
  RECONNECTION: true,
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  TIMEOUT: 20000,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@servana:auth_token',
  USER_DATA: '@servana:user_data',
  THEME: '@servana:theme',
  LANGUAGE: '@servana:language',
  CACHE_PREFIX: '@servana:cache:',
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: ENV.PROD,
  ENABLE_LOGGING: ENV.DEV,
  ENABLE_DEBUG_MENU: ENV.DEV,
  ENABLE_OFFLINE_MODE: true,
};

// App Metadata
export const APP_INFO = {
  NAME: 'Servana Mobile',
  VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.ios?.buildNumber || '1',
};

// Log configuration on startup
if (ENV.DEV) {
  console.log('🔧 Environment Configuration:');
  console.log(`   Platform: ${ENV.PLATFORM}`);
  console.log(`   API URL: ${API_CONFIG.BASE_URL}`);
  console.log(`   Version: ${APP_INFO.VERSION}`);
}

export default {
  ENV,
  API_CONFIG,
  SOCKET_CONFIG,
  STORAGE_KEYS,
  FEATURES,
  APP_INFO,
};
