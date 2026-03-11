/**
 * Typing Socket Events
 * Handles incoming typing indicator events
 */
import * as EVENTS from '../constants/events';

/**
 * Register typing event listeners
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} callbacks - Event callback functions
 * @param {Function} callbacks.onTyping - Called when user starts typing
 * @param {Function} callbacks.onStopTyping - Called when user stops typing
 * @returns {Function} Cleanup function to unregister events
 */
export const registerTypingEvents = (socket, callbacks = {}) => {
  const {
    onTyping,
    onStopTyping
  } = callbacks;

  // User typing
  const handleTyping = (data) => {
    console.log('👤 User typing:', data.userName);
    if (onTyping) {
      onTyping(data);
    }
  };

  // User stopped typing
  const handleStopTyping = (data) => {
    console.log('👤 User stopped typing');
    if (onStopTyping) {
      onStopTyping(data);
    }
  };

  // Register listeners
  socket.on(EVENTS.TYPING, handleTyping);
  socket.on(EVENTS.STOP_TYPING, handleStopTyping);

  // Return cleanup function
  return () => {
    socket.off(EVENTS.TYPING, handleTyping);
    socket.off(EVENTS.STOP_TYPING, handleStopTyping);
  };
};
