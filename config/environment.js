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
  if (ENV.DEV) return 'http://192.168.137.2:5000';
  return 'https://backend-servana.onrender.com';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000,
};

export const SOCKET_CONFIG = {
  URL: API_CONFIG.BASE_URL,
  RECONNECTION: true,
  RECONNECTION_ATTEMPTS: 10,
  RECONNECTION_DELAY: 2000,
  RECONNECTION_DELAY_MAX: 10000,
  TIMEOUT: 30000,
  // Force polling first for better mobile compatibility
  TRANSPORTS: ['polling', 'websocket'],
  // Add path explicitly
  PATH: '/socket.io/',
  // Increase ping settings for mobile networks
  PING_TIMEOUT: 60000,
  PING_INTERVAL: 25000,
};

export default { ENV, API_CONFIG, SOCKET_CONFIG };
