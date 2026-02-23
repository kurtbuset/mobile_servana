import axios from 'axios';
import { Platform } from 'react-native';
import SecureStorage from '../../utils/secureStorage';

// Configuration for different environments
const getAPIURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }
  
  if (__DEV__) {
    return "http://172.26.240.1:5000";
  }
  
  return "https://your-production-backend.com";
};

export const API_URL = getAPIURL();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Token might be expired, clear it
      await SecureStorage.removeToken();
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        originalError: error,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
