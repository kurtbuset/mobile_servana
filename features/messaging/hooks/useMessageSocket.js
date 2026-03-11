import { useState, useEffect, useRef } from 'react';
import { addDateSeparators } from '../utils/messageHelpers';
import { 
  registerMessageEvents, 
  registerTypingEvents, 
  registerConnectionEvents 
} from '../../../contexts/SocketContext/events';
import { 
  joinChatGroup, 
  leaveChatGroup 
} from '../../../contexts/SocketContext/emitters';

/**
 * Hook for managing socket events for messaging
 * Note: Socket connection is managed by SocketProvider
 * This hook only sets up event listeners and manages typing state
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
  const [typingAgentName, setTypingAgentName] = useState('Agent');
  const [typingAgentImage, setTypingAgentImage] = useState(null);
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
    if (!chatGroupId || !socket) {
      console.log('⏸️ Skipping socket setup - missing chatGroupId or socket');
      return;
    }

    // Check if socket is connected
    if (!socket.connected) {
      console.log('⏸️ Socket not connected yet, waiting...');
    }

    console.log('📱 Setting up message socket listeners for chat group:', chatGroupId);

    // Join chat group using emitter
    joinChatGroup(socket, {
      groupId: chatGroupId,
      userType: 'client',
      userId: clientId,
    });

    // Register message events
    const cleanupMessages = registerMessageEvents(socket, {
      onMessageReceived: (message) => {
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
      },
      onMessageDelivered: (data) => {
        // Handle message delivery confirmation if needed
        console.log('✅ Message delivered:', data.chat_id);
      },
      onMessageError: (error) => {
        // Handle message error if needed
        console.error('❌ Message error:', error);
      }
    });

    // Register typing events
    const cleanupTyping = registerTypingEvents(socket, {
      onTyping: (data) => {
        if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
          setIsTyping(true);
          setTypingAgentName(data.userName || 'Agent');
          setTypingAgentImage(data.userImage || null);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingAgentName('Agent');
            setTypingAgentImage(null);
          }, 3000);
        }
      },
      onStopTyping: (data) => {
        if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          setIsTyping(false);
          setTypingAgentName('Agent');
          setTypingAgentImage(null);
        }
      }
    });

    // Register connection events (for reconnection handling)
    const cleanupConnection = registerConnectionEvents(socket, {
      onConnect: () => {
        console.log('✅ Socket reconnected, rejoining chat group');
        // Re-join chat group on reconnection
        joinChatGroup(socket, {
          groupId: chatGroupId,
          userType: 'client',
          userId: clientId,
        });
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up message socket listeners');
      
      // Cleanup all event listeners
      cleanupMessages();
      cleanupTyping();
      cleanupConnection();
      
      // Leave chat group on cleanup
      leaveChatGroup(socket, {
        groupId: chatGroupId,
        userType: 'client',
        userId: clientId,
      });
      
      console.log('✅ Message socket listeners cleaned up');
    };
  }, [chatGroupId, clientId, socket, setMessages]);
  // Note: shouldAutoScroll and flatListRef are intentionally NOT in dependencies
  // to prevent socket reconnection on scroll

  return {
    isTyping,
    typingAgentName,
    typingAgentImage,
  };
};

export default useMessageSocket;
