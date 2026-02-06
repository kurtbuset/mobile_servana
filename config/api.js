import { Platform } from 'react-native';

// Configuration for different environments
const getAPIURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }
  
  // For real device, use your computer's IP address
  // For emulator, use emulator-specific address
  if (__DEV__) {
    // Development mode - use your computer's IP
    return "http://192.168.137.3:5000"; // Your computer's Wi-Fi IP
  }
  
  // Production mode
  return "https://your-production-backend.com";
};

export const API_URL = getAPIURL();

console.log(`🌐 API connecting to: ${API_URL}`);

export default API_URL;