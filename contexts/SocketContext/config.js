import logger from '../../utils/logger';

import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "../../config/environment";
import SecureStorage from "../../utils/secureStorage";

let socketInstance = null;

export const createSocket = async () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  const token = await SecureStorage.getToken();

  const baseDelay = SOCKET_CONFIG.RECONNECTION_DELAY;
  const jitter = Math.random() * 4000;

  socketInstance = io(SOCKET_CONFIG.URL, {
    // Use polling first for better mobile/production compatibility
    transports: SOCKET_CONFIG.TRANSPORTS || ["polling", "websocket"],
    autoConnect: false,
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    reconnection: SOCKET_CONFIG.RECONNECTION,
    reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
    reconnectionDelay: baseDelay + jitter,
    reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX || 10000,
    randomizationFactor: 0.5,
    timeout: SOCKET_CONFIG.TIMEOUT,
    // Explicit path for Socket.IO endpoint
    path: SOCKET_CONFIG.PATH || '/socket.io/',
    // Mobile-friendly settings
    upgrade: true,
    rememberUpgrade: true,
    // Increase ping settings for mobile networks
    pingTimeout: SOCKET_CONFIG.PING_TIMEOUT || 60000,
    pingInterval: SOCKET_CONFIG.PING_INTERVAL || 25000,
  });

  socketInstance.io.on("reconnect_attempt", (attempt) => {
    logger.info(`Socket reconnect attempt ${attempt}`);
  });

  socketInstance.io.on("reconnect_failed", () => {
    logger.error("Socket reconnection failed after all attempts");
  });

  return socketInstance;
};

export const clearSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default createSocket;
