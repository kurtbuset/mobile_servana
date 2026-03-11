import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectClient } from '../../store/slices/profile';
import createSocket from '../../config/socket';

export const SocketContext = createContext(null);

/**
 * Socket Context Provider
 * Manages socket connection and provides socket instance to children
 * Only initializes socket when user is authenticated
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const client = useSelector(selectClient);
  const isAuthenticated = !!client;

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!isAuthenticated) {
      console.log('⏸️ User not authenticated, skipping socket initialization');
      
      // Disconnect existing socket if user logged out
      if (socket) {
        console.log('🔌 Disconnecting socket due to logout');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      
      return;
    }

    const initializeSocket = async () => {
      try {
        console.log('📱 User authenticated, initializing socket...');
        const socketInstance = await createSocket();
        setSocket(socketInstance);

        socketInstance.connect();
        console.log('📱 Connecting socket...');

        const handleConnect = () => {
          console.log('✅ Socket connected:', socketInstance.id);
          setIsConnected(true);
          // Note: 'mobileConnected' event is not handled by backend
          // Socket authentication is done via JWT token in handshake
        };

        const handleDisconnect = () => {
          console.log('❌ Socket disconnected');
          setIsConnected(false);
        };

        const handleConnectError = (error) => {
          console.error('❌ Socket connection error:', error.message);
          setIsConnected(false);
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);

        return () => {
          socketInstance.off('connect', handleConnect);
          socketInstance.off('disconnect', handleDisconnect);
          socketInstance.off('connect_error', handleConnectError);
          socketInstance.disconnect();
          console.log('🔌 Socket cleanup');
        };
      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
      }
    };

    initializeSocket();
  }, [isAuthenticated]); // Re-run when authentication state changes

  const reconnect = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('⏸️ Cannot reconnect socket - user not authenticated');
      return;
    }

    if (socket) {
      socket.disconnect();
    }
    
    console.log('🔄 Reconnecting socket...');
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
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
