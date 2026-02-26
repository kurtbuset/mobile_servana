/**
 * Socket helper functions
 */

/**
 * Emit socket event with error handling
 */
export const emitSocketEvent = (socket, eventName, data) => {
  if (!socket || !socket.connected) {
    console.warn(`⚠️ Cannot emit ${eventName}: Socket not connected`);
    return false;
  }

  try {
    socket.emit(eventName, data);
    console.log(`📤 Emitted ${eventName}:`, data);
    return true;
  } catch (error) {
    console.error(`❌ Error emitting ${eventName}:`, error);
    return false;
  }
};

/**
 * Listen to socket event with cleanup
 */
export const listenToSocketEvent = (socket, eventName, handler) => {
  if (!socket) {
    console.warn(`⚠️ Cannot listen to ${eventName}: Socket not available`);
    return () => {};
  }

  socket.on(eventName, handler);
  console.log(`👂 Listening to ${eventName}`);

  // Return cleanup function
  return () => {
    socket.off(eventName, handler);
    console.log(`🔇 Stopped listening to ${eventName}`);
  };
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (socket) => {
  return socket && socket.connected;
};

export default {
  emitSocketEvent,
  listenToSocketEvent,
  isSocketConnected,
};
