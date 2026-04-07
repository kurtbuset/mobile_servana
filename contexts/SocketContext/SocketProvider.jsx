import logger from '../../utils/logger';

/**
 * Socket Context Provider - Simplified
 * Manages socket connection and provides socket instance to children
 */
import React, { createContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectClient } from "../../store/slices/profile";
import { createSocket, clearSocket } from "./config";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const client = useSelector(selectClient);
  const isAuthenticated = !!client;

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!isAuthenticated) {
      logger.info("⏸️ User not authenticated, skipping socket initialization");

      // Disconnect existing socket if user logged out
      if (socket) {
        logger.info("🔌 Disconnecting socket due to logout");
        clearSocket();
        setSocket(null);
        setIsConnected(false);
      }

      return;
    }

    const initializeSocket = async () => {
      try {
        logger.info("📱 User authenticated, initializing socket...");
        const socketInstance = await createSocket();
        setSocket(socketInstance);

        // Connection state handlers
        const handleConnect = () => {
          logger.info("✅ Socket connected:", socketInstance.id);
          setIsConnected(true);
        };

        const handleDisconnect = () => {
          logger.info("❌ Socket disconnected");
          setIsConnected(false);
        };

        const handleConnectError = (error) => {
          logger.error("❌ Socket connection error:", error.message);
          logger.error("❌ Error details:", {
            type: error.type,
            description: error.description,
            context: error.context,
          });

          // Provide user-friendly error messages
          if (error.message.includes("websocket error")) {
            logger.error("💡 Tip: Check if backend is running and accessible");
            logger.error("💡 Tip: Verify your IP address in config/socket.js");
          }

          setIsConnected(false);
        };

        socketInstance.on("connect", handleConnect);
        socketInstance.on("disconnect", handleDisconnect);
        socketInstance.on("connect_error", handleConnectError);

        socketInstance.connect();
        logger.info("📱 Connecting socket...");

        return () => {
          socketInstance.off("connect", handleConnect);
          socketInstance.off("disconnect", handleDisconnect);
          socketInstance.off("connect_error", handleConnectError);
          socketInstance.disconnect();
          logger.info("🔌 Socket cleanup");
        };
      } catch (error) {
        logger.error("❌ Failed to initialize socket:", error);
      }
    };

    initializeSocket();
  }, [isAuthenticated]);

  const reconnect = useCallback(async () => {
    if (!isAuthenticated) {
      logger.info("⏸️ Cannot reconnect socket - user not authenticated");
      return;
    }

    if (socket) {
      socket.disconnect();
    }

    logger.info("🔄 Reconnecting socket...");
    const newSocket = await createSocket();
    setSocket(newSocket);
    newSocket.connect();
  }, [socket, isAuthenticated]);

  const value = {
    socket,
    isConnected,
    reconnect,
    isAuthenticated,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
