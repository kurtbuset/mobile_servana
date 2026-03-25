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
    transports: ["websocket", "polling"],
    autoConnect: false,
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    reconnection: SOCKET_CONFIG.RECONNECTION,
    reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
    reconnectionDelay: baseDelay + jitter,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
    timeout: SOCKET_CONFIG.TIMEOUT,
    upgrade: true,
    rememberUpgrade: true,
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
