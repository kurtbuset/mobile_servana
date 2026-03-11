import { io } from "socket.io-client";
import { Platform } from "react-native";
import SecureStorage from "../utils/secureStorage";

// Configuration for different environments
const getSocketURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // For real device, use your computer's IP address
  // For emulator, use emulator-specific address
  if (__DEV__) {
    // Development mode - use your computer's IP
    return "http://192.168.137.65:5000"; // Your computer's Wi-Fi IP
  }

  // Production mode
  return "https://your-production-backend.com";
};

const SOCKET_URL = getSocketURL();

console.log(`🌐 Socket connecting to: ${SOCKET_URL}`);

let socketInstance = null;

// Create socket with authentication
const createSocket = async () => {
  try {
    // If socket already exists, disconnect it first
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    // Fetch token from secure storage
    const token = await SecureStorage.getToken();

    if (!token) {
      console.warn("⚠️ No token found in secure storage for socket connection");
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
      return socketInstance;
    }

    console.log(
      "🔐 Creating socket with authentication token:",
      token.substring(0, 20) + "...",
    );

    // Add jitter to reconnection delay to prevent thundering herd
    const baseDelay = 1000;
    const jitter = Math.random() * 4000; // 0-4 seconds
    const reconnectionDelay = baseDelay + jitter;

    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        token: token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Mobile-optimized reconnection settings with jitter
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: reconnectionDelay,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,  // Adds additional randomness
      timeout: 20000,
    });

    return socketInstance;
  } catch (error) {
    console.error("❌ Error creating authenticated socket:", error);
    // Fallback to socket without auth
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    return socketInstance;
  }
};

// Function to clear socket (called during logout)
export const clearSocket = () => {
  console.log("🔌 Clearing socket during logout");
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Export a promise that resolves to the socket
export default createSocket;
