import { io } from "socket.io-client";
import { Platform } from "react-native";
import SecureStorage from "../utils/secureStorage";

// Configuration for different environments
const getSocketURL = () => {
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

const SOCKET_URL = getSocketURL();

console.log(`🌐 Socket connecting to: ${SOCKET_URL}`);
console.log(`📱 Platform: ${Platform.OS}, Dev mode: ${__DEV__}`);

let socketInstance = null;

// Create socket with authentication
const createSocket = async () => {
  try {
    // If socket already exists, disconnect it first
    if (socketInstance) {
      console.log("🔌 Disconnecting existing socket instance");
      socketInstance.disconnect();
      socketInstance = null;
    }

    // Fetch token from secure storage
    const token = await SecureStorage.getToken();

    if (!token) {
      console.warn("⚠️ No token found in secure storage for socket connection");
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket", "polling"], // Try websocket first, fallback to polling
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        upgrade: true,
        rememberUpgrade: true,
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
      transports: ["websocket", "polling"], // Try websocket first, fallback to polling
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
      randomizationFactor: 0.5, // Adds additional randomness
      timeout: 20000,
      // Force new connection
      forceNew: false,
      // Upgrade transport
      upgrade: true,
      // Remember upgrade
      rememberUpgrade: true,
    });

    // Add detailed error logging
    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.error("❌ Error type:", error.type);
      console.error("❌ Error description:", error.description);
    });

    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    socketInstance.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
    });

    socketInstance.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    return socketInstance;
  } catch (error) {
    console.error("❌ Error creating authenticated socket:", error);
    // Fallback to socket without auth
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: true,
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
