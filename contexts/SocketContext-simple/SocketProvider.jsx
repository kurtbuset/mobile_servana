/**
 * Socket Context Provider - Simplified
 * Manages socket connection and provides socket instance to children
 */
import React, { createContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectClient } from "../../store/slices/profile";
import { createSocket, clearSocket } from "./config";
import { setupConnectionEvents } from "./connection";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const client = useSelector(selectClient);
  const isAuthenticated = !!client;

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!isAuthenticated) {
      console.log("⏸️ User not authenticated, skipping socket initialization");

      // Disconnect existing socket if user logged out
      if (socket) {
        console.log("🔌 Disconnecting socket due to logout");
        clearSocket();
        setSocket(null);
        setIsConnected(false);
      }

      return;
    }

    const initializeSocket = async () => {
      try {
        console.log("📱 User authenticated, initializing socket...");
        const socketInstance = await createSocket();
        setSocket(socketInstance);

        // Setup connection events
        setupConnectionEvents(socketInstance);

        // Custom handlers for connection state
        const handleConnect = () => {
          console.log("✅ Socket connected:", socketInstance.id);
          setIsConnected(true);
        };

        const handleDisconnect = () => {
          console.log("❌ Socket disconnected");
          setIsConnected(false);
        };

        const handleConnectError = (error) => {
          console.error("❌ Socket connection error:", error.message);
          setIsConnected(false);
        };

        socketInstance.on("connect", handleConnect);
        socketInstance.on("disconnect", handleDisconnect);
        socketInstance.on("connect_error", handleConnectError);

        socketInstance.connect();
        console.log("📱 Connecting socket...");

        return () => {
          socketInstance.off("connect", handleConnect);
          socketInstance.off("disconnect", handleDisconnect);
          socketInstance.off("connect_error", handleConnectError);
          socketInstance.disconnect();
          console.log("🔌 Socket cleanup");
        };
      } catch (error) {
        console.error("❌ Failed to initialize socket:", error);
      }
    };

    initializeSocket();
  }, [isAuthenticated]);

  const reconnect = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("⏸️ Cannot reconnect socket - user not authenticated");
      return;
    }

    if (socket) {
      socket.disconnect();
    }

    console.log("🔄 Reconnecting socket...");
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
