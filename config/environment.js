import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const ENV = {
  DEV: __DEV__,
  PROD: !__DEV__,
  PLATFORM: Platform.OS,
  IS_WEB: Platform.OS === 'web',
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
};

const getBaseURL = () => {
  const envURL = Constants.expoConfig?.extra?.apiUrl;
  if (envURL) return envURL;

  if (ENV.IS_WEB) return 'http://localhost:5000';
  if (ENV.DEV) return 'http://172.26.240.1:5000';
  return 'https://api.servana.com';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000,
};

export const SOCKET_CONFIG = {
  URL: API_CONFIG.BASE_URL,
  RECONNECTION: true,
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  TIMEOUT: 20000,
};

export default { ENV, API_CONFIG, SOCKET_CONFIG };
