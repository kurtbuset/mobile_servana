/**
 * Message Socket Emitters
 * Functions for emitting message-related socket events
 */
import * as EVENTS from '../constants/events';

/**
 * Send a message via socket
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} data - Message data
 * @param {string} data.chat_body - Message content
 * @param {number} data.chat_group_id - Chat group ID
 * @param {number} data.sender_id - Sender ID
 * @param {string} data.sender_type - Sender type (client/agent)
 * @returns {boolean} Success status
 */
export const sendMessage = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot send message - socket not connected');
    return false;
  }

  socket.emit(EVENTS.SEND_MESSAGE, data);
  console.log('📤 Message sent via socket');
  return true;
};

/**
 * Join a chat group room
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} data - Join data
 * @param {number} data.groupId - Chat group ID
 * @param {string} data.userType - User type (client/agent)
 * @param {number} data.userId - User ID
 * @returns {boolean} Success status
 */
export const joinChatGroup = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot join chat group - socket not connected');
    return false;
  }

  socket.emit(EVENTS.JOIN_CHAT_GROUP, data);
  console.log('📱 Joined chat group:', data.groupId);
  return true;
};

/**
 * Leave a chat group room
 * @param {Socket} socket - Socket.IO instance
 * @param {Object} data - Leave data
 * @param {number} data.groupId - Chat group ID
 * @param {string} data.userType - User type (client/agent)
 * @param {number} data.userId - User ID
 * @returns {boolean} Success status
 */
export const leaveChatGroup = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot leave chat group - socket not connected');
    return false;
  }

  socket.emit(EVENTS.LEAVE_CHAT_GROUP, data);
  console.log('👋 Left chat group:', data.groupId);
  return true;
};
