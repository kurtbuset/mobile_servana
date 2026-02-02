import { io } from "socket.io-client";
import { Platform } from "react-native";
import SecureStorage from "./utils/secureStorage";

const SOCKET_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000" // Android emulator → localhost
    : "http://localhost:5000"; // iOS simulator

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
      });
      return socketInstance;
    }

    console.log("🔐 Creating socket with authentication token:", token.substring(0, 20) + "...");
    
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        token: token
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return socketInstance;
  } catch (error) {
    console.error("❌ Error creating authenticated socket:", error);
    // Fallback to socket without auth
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
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
