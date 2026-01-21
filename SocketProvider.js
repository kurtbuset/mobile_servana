// SocketProvider.js
import React, { createContext, useEffect } from 'react';
import socket from './socket';

export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.connect();
    console.log("📱 Connecting socket...");

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("mobileConnected");
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      console.log("🔌 Socket cleanup on app close");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};