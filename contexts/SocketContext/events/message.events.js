/**
 * Message Socket Events
 * Handles incoming message-related socket events
 */
import * as EVENTS from '../constants/events';

/**
 * Register message event listeners
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} callbacks - Event callback functions
 * @param {Function} callbacks.onMessageReceived - Called when message is received
 * @param {Function} callbacks.onMessageDelivered - Called when message is delivered
 * @param {Function} callbacks.onMessageError - Called when message error occurs
 * @returns {Function} Cleanup function to unregister events
 */
export const registerMessageEvents = (socket, callbacks = {}) => {
  const {
    onMessageReceived,
    onMessageDelivered,
    onMessageError
  } = callbacks;

  // Message received
  const handleReceiveMessage = (message) => {
    console.log('📨 Received message:', message.chat_id);
    if (onMessageReceived) {
      onMessageReceived(message);
    }
  };

  // Message delivered confirmation
  const handleMessageDelivered = (data) => {
    console.log('✅ Message delivered:', data.chat_id);
    if (onMessageDelivered) {
      onMessageDelivered(data);
    }
  };

  // Message error
  const handleMessageError = (error) => {
    console.error('❌ Message error:', error);
    if (onMessageError) {
      onMessageError(error);
    }
  };

  // Register listeners
  socket.on(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
  socket.on(EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
  socket.on(EVENTS.MESSAGE_ERROR, handleMessageError);

  // Return cleanup function
  return () => {
    socket.off(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.off(EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
    socket.off(EVENTS.MESSAGE_ERROR, handleMessageError);
  };
};
