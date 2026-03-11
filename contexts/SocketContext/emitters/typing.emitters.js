/**
 * Typing Socket Emitters
 * Functions for emitting typing indicator events
 */
import * as EVENTS from '../constants/events';

/**
 * Emit typing indicator
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} data - Typing data
 * @param {number} data.chatGroupId - Chat group ID
 * @param {number} data.userId - User ID
 * @param {string} data.userName - User name
 * @param {string} data.userType - User type (client/agent)
 * @param {string} data.userImage - User image URL (optional)
 * @returns {boolean} Success status
 */
export const emitTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot emit typing - socket not connected');
    return false;
  }

  socket.emit(EVENTS.TYPING, data);
  return true;
};

/**
 * Emit stop typing indicator
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} data - Stop typing data
 * @param {number} data.chatGroupId - Chat group ID
 * @param {number} data.userId - User ID
 * @param {string} data.userType - User type (client/agent)
 * @returns {boolean} Success status
 */
export const emitStopTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot emit stop typing - socket not connected');
    return false;
  }

  socket.emit(EVENTS.STOP_TYPING, data);
  return true;
};
