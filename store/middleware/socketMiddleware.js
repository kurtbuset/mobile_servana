import { addMessage } from '../slices/messages/messageSlice';

/**
 * Socket middleware for real-time message handling
 * Note: Socket connection is managed by SocketProvider
 * This middleware only handles socket event emissions
 */
export const createSocketMiddleware = (socket) => {
  return (store) => (next) => (action) => {
    // Note: socket/connect and socket/disconnect actions are deprecated
    // Socket connection is now managed centrally by SocketProvider
    // These actions are kept for backward compatibility but do nothing
    
    if (action.type === 'socket/connect') {
      console.warn('⚠️ socket/connect action is deprecated - socket is managed by SocketProvider');
      // Don't call socket.connect() - it's already connected by SocketProvider
    }

    if (action.type === 'socket/disconnect') {
      console.warn('⚠️ socket/disconnect action is deprecated - socket is managed by SocketProvider');
      // Don't call socket.disconnect() - it's managed by SocketProvider
    }

    // Handle send message actions
    if (action.type === 'socket/sendMessage') {
      if (socket && socket.connected) {
        socket.emit('sendMessage', action.payload);
        console.log('📤 Message sent via socket middleware');
      } else {
        console.warn('⚠️ Cannot send message - socket not connected');
      }
    }

    // Handle join chat group
    if (action.type === 'socket/joinChatGroup') {
      if (socket && socket.connected) {
        socket.emit('joinChatGroup', action.payload);
        console.log('📱 Joined chat group via middleware');
      } else {
        console.warn('⚠️ Cannot join chat group - socket not connected');
      }
    }

    // Handle leave chat group
    if (action.type === 'socket/leaveChatGroup') {
      if (socket && socket.connected) {
        socket.emit('leaveChatGroup', action.payload);
        console.log('👋 Left chat group via middleware');
      } else {
        console.warn('⚠️ Cannot leave chat group - socket not connected');
      }
    }

    return next(action);
  };
};

/**
 * Setup socket event listeners
 */
export const setupSocketListeners = (socket, store) => {
  if (!socket) return;

  // Listen for incoming messages
  socket.on('receiveMessage', (message) => {
    console.log('📨 Message received via socket');
    
    const formattedMessage = {
      id: message.chat_id ? `msg-${message.chat_id}` : `temp-${Date.now()}`,
      sender: message.client_id ? 'user' : 'admin',
      content: message.chat_body,
      timestamp: message.chat_created_at,
      displayTime: new Date(message.chat_created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    store.dispatch(addMessage(formattedMessage));
  });

  // Listen for connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });
};

export default createSocketMiddleware;
