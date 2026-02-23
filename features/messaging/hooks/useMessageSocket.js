import { useState, useEffect, useRef } from 'react';
import { addDateSeparators } from '../utils/messageHelpers';

/**
 * Hook for managing socket events for messaging
 */
export const useMessageSocket = (
  socket,
  chatGroupId,
  clientId,
  setMessages,
  shouldAutoScroll,
  flatListRef
) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Use refs to avoid re-running effect on scroll changes
  const shouldAutoScrollRef = useRef(shouldAutoScroll);
  const flatListRefRef = useRef(flatListRef);
  
  // Update refs when values change
  useEffect(() => {
    shouldAutoScrollRef.current = shouldAutoScroll;
  }, [shouldAutoScroll]);
  
  useEffect(() => {
    flatListRefRef.current = flatListRef;
  }, [flatListRef]);

  useEffect(() => {
    if (!chatGroupId || !socket) return;

    // Connect socket
    socket.connect();
    console.log('Socket connecting...');

    // Join chat group
    socket.emit('joinChatGroup', {
      groupId: chatGroupId,
      userType: 'client',
      userId: clientId,
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      console.log('📨 Received message:', message.chat_id);

      // Skip messages sent by current client (avoid duplicates)
      if (message.client_id === clientId) {
        console.log('⏭️ Skipping own message to avoid duplicate');
        return;
      }

      const newMessage = {
        id: message.chat_id ? `msg-${message.chat_id}` : `temp-${Date.now()}`,
        sender: message.sender_type === 'client' ? 'user' : 'admin',
        content: message.chat_body,
        timestamp: message.chat_created_at,
        displayTime: new Date(message.chat_created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => {
        const messagesOnly = prev.filter((m) => m.type !== 'date');
        const exists = messagesOnly.some((m) => m.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping duplicate');
          return addDateSeparators(messagesOnly);
        }

        const updatedMessages = [...messagesOnly, newMessage];
        return addDateSeparators(updatedMessages);
      });

      // Scroll to bottom if user is at bottom
      if (shouldAutoScrollRef.current) {
        setTimeout(() => {
          flatListRefRef.current?.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // Listen for typing events
    socket.on('userTyping', (data) => {
      if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
        console.log('Agent is typing...');
        setIsTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    socket.on('userStoppedTyping', (data) => {
      if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
        console.log('Agent stopped typing');

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        setIsTyping(false);
      }
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Cleanup
    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
      console.log('🔌 Socket disconnected and cleaned up');
    };
  }, [chatGroupId, clientId, socket, setMessages]);
  // Note: shouldAutoScroll and flatListRef are intentionally NOT in dependencies
  // to prevent socket reconnection on scroll

  return {
    isTyping,
  };
};

export default useMessageSocket;
