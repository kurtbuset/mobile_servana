import { io } from "socket.io-client";
import { Platform } from "react-native";

const SOCKET_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000" // Android emulator → localhost
    : "http://localhost:5000"; // iOS simulator

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // IMPORTANT for React Native
  autoConnect: false,   
});

export default socket;
