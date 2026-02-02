// SocketProvider.js
import React, { createContext, useEffect, useState } from 'react';
import createSocket from './socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log("📱 Initializing socket with authentication...");
        const socketInstance = await createSocket();
        setSocket(socketInstance);

        socketInstance.connect();
        console.log("📱 Connecting socket...");

        const handleConnect = () => {
          console.log("✅ Socket connected:", socketInstance.id);
          socketInstance.emit("mobileConnected");
        };

        const handleDisconnect = () => {
          console.log("❌ Socket disconnected");
        };

        const handleConnectError = (error) => {
          console.error("❌ Socket connection error:", error.message);
        };

        socketInstance.on("connect", handleConnect);
        socketInstance.on("disconnect", handleDisconnect);
        socketInstance.on("connect_error", handleConnectError);

        return () => {
          socketInstance.off("connect", handleConnect);
          socketInstance.off("disconnect", handleDisconnect);
          socketInstance.off("connect_error", handleConnectError);
          socketInstance.disconnect();
          console.log("🔌 Socket cleanup on app close");
        };
      } catch (error) {
        console.error("❌ Failed to initialize socket:", error);
      }
    };

    initializeSocket();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};