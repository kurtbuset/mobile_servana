import { Platform } from "react-native";

// Configuration for different environments
const getAPIURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // For Android emulator, use special IP that maps to host machine
  if (Platform.OS === "android" && __DEV__) {
    // 10.0.2.2 is the special IP for Android emulator to access host machine
    return "http://10.0.2.2:5000";
  }

  // For iOS simulator or real device in development
  if (__DEV__) {
    // Use your computer's local network IP
    return "http://192.168.67.240:5000";
  }

  // Production mode
  return "https://your-production-backend.com";
};

export const API_URL = getAPIURL();

console.log(`🌐 API connecting to: ${API_URL}`);
console.log(`📱 Platform: ${Platform.OS}, Dev mode: ${__DEV__}`);

export default API_URL;
