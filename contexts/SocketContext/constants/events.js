/**
 * Socket Event Constants
 * Centralized event names to prevent typos and enable refactoring
 * 
 * Convention:
 * - OUTGOING: Events emitted by client (client → server)
 * - INCOMING: Events received by client (server → client)
 */

// ============================================
// CHAT EVENTS
// ============================================

// Outgoing (Client → Server)
export const JOIN_CHAT_GROUP = 'joinChatGroup';
export const LEAVE_CHAT_GROUP = 'leaveChatGroup';
export const SEND_MESSAGE = 'sendMessage';

// Incoming (Server → Client)
export const RECEIVE_MESSAGE = 'receiveMessage';
export const MESSAGE_DELIVERED = 'messageDelivered';
export const MESSAGE_ERROR = 'messageError';

// ============================================
// TYPING EVENTS
// ============================================

// Outgoing (Client → Server)
export const TYPING = 'typing';
export const STOP_TYPING = 'stopTyping';

// Incoming (Server → Client)
// (Same as outgoing - received from other users)

// ============================================
// CONNECTION EVENTS (Socket.IO Built-in)
// ============================================

export const CONNECT = 'connect';
export const DISCONNECT = 'disconnect';
export const CONNECT_ERROR = 'connect_error';
export const RECONNECT = 'reconnect';
export const RECONNECT_ATTEMPT = 'reconnect_attempt';
export const RECONNECT_FAILED = 'reconnect_failed';

// ============================================
// ERROR EVENTS
// ============================================

export const ERROR = 'error';

// ============================================
// GROUPED EXPORTS FOR CONVENIENCE
// ============================================

export const CHAT_EVENTS = {
  JOIN_CHAT_GROUP,
  LEAVE_CHAT_GROUP,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  MESSAGE_DELIVERED,
  MESSAGE_ERROR
};

export const TYPING_EVENTS = {
  TYPING,
  STOP_TYPING
};

export const CONNECTION_EVENTS = {
  CONNECT,
  DISCONNECT,
  CONNECT_ERROR,
  RECONNECT,
  RECONNECT_ATTEMPT,
  RECONNECT_FAILED
};
