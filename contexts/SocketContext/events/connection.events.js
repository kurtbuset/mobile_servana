/**
 * Connection Socket Events
 * Handles socket connection lifecycle events
 */
import * as EVENTS from '../constants/events';

/**
 * Register connection event listeners
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} callbacks - Event callback functions
 * @param {Function} callbacks.onConnect - Called when socket connects
 * @param {Function} callbacks.onDisconnect - Called when socket disconnects
 * @param {Function} callbacks.onConnectError - Called when connection error occurs
 * @returns {Function} Cleanup function to unregister events
 */
export const registerConnectionEvents = (socket, callbacks = {}) => {
  const {
    onConnect,
    onDisconnect,
    onConnectError
  } = callbacks;

  // Socket connected
  const handleConnect = () => {
    console.log('✅ Socket connected:', socket.id);
    if (onConnect) {
      onConnect(socket.id);
    }
  };

  // Socket disconnected
  const handleDisconnect = (reason) => {
    console.log('❌ Socket disconnected:', reason);
    if (onDisconnect) {
      onDisconnect(reason);
    }
  };

  // Connection error
  const handleConnectError = (error) => {
    console.error('❌ Socket connection error:', error.message);
    if (onConnectError) {
      onConnectError(error);
    }
  };

  // Register listeners
  socket.on(EVENTS.CONNECT, handleConnect);
  socket.on(EVENTS.DISCONNECT, handleDisconnect);
  socket.on(EVENTS.CONNECT_ERROR, handleConnectError);

  // Return cleanup function
  return () => {
    socket.off(EVENTS.CONNECT, handleConnect);
    socket.off(EVENTS.DISCONNECT, handleDisconnect);
    socket.off(EVENTS.CONNECT_ERROR, handleConnectError);
  };
};
