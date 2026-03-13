/**
 * Socket Configuration for Mobile
 */
import { io } from "socket.io-client";
import { Platform } from "react-native";
import SecureStorage from "../../utils/secureStorage";

const getSocketURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  if (__DEV__) {
    return "http://192.168.1.9:5000"; // Your computer's Wi-Fi IP
  }

  return "https://your-production-backend.com";
};

const SOCKET_URL = getSocketURL();

console.log(`🌐 Socket connecting to: ${SOCKET_URL}`);

let socketInstance = null;

/**
 * Create socket with authentication
 */
export const createSocket = async () => {
  try {
    // If socket already exists, disconnect it first
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    // Fetch token from secure storage
    const token = await SecureStorage.getToken();

    if (!token) {
      console.warn("⚠️ No token found for socket connection");
    } else {
      console.log("🔐 Creating socket with authentication token");
    }

    // Add jitter to reconnection delay
    const baseDelay = 1000;
    const jitter = Math.random() * 4000;
    const reconnectionDelay = baseDelay + jitter;

    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      auth: token ? { token } : undefined,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: reconnectionDelay,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    return socketInstance;
  } catch (error) {
    console.error("❌ Error creating socket:", error);
    throw error;
  }
};

/**
 * Clear socket (called during logout)
 */
export const clearSocket = () => {
  console.log("🔌 Clearing socket during logout");
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default createSocket;
