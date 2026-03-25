import logger from '../../utils/logger';

import axios from "axios";
import SecureStorage from "../../utils/secureStorage";

import { API_CONFIG } from "../../config/environment";
const API_URL = API_CONFIG.BASE_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
      logger.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Unwrap { data: ... } envelope and handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
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
      logger.error("Network error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        originalError: error,
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
