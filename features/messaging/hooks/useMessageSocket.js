import { useState, useEffect, useRef, useCallback } from "react";
import { addDateSeparators } from "../utils/messageHelpers";
import {
  registerMessageEvents,
  registerTypingEvents,
  registerConnectionEvents,
  joinChatGroup,
} from "../../../contexts/SocketContext-simple";

/**
 * Hook for managing socket events for messaging
 * Centralized socket event handling including optimistic UI updates
 */
export const useMessageSocket = (
  socket,
  chatGroupId,
  clientId,
  setMessages,
  shouldAutoScroll,
  flatListRef,
) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingAgentName, setTypingAgentName] = useState("Agent");
  const [typingAgentImage, setTypingAgentImage] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Use refs to avoid re-running effect on scroll changes
  const shouldAutoScrollRef = useRef(shouldAutoScroll);
  const flatListRefRef = useRef(flatListRef);
  const setMessagesRef = useRef(setMessages);
  const clientIdRef = useRef(clientId);

  // Update refs when values change
  useEffect(() => {
    shouldAutoScrollRef.current = shouldAutoScroll;
  }, [shouldAutoScroll]);

  useEffect(() => {
    flatListRefRef.current = flatListRef;
  }, [flatListRef]);

  useEffect(() => {
    setMessagesRef.current = setMessages;
  }, [setMessages]);

  useEffect(() => {
    clientIdRef.current = clientId;
  }, [clientId]);

  // Function to add optimistic message when sending - stable callback
  const addOptimisticMessage = useCallback((text) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const optimisticMessage = {
      id: tempId,
      sender: "user",
      content: text,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      isPending: true,
      chatId: null,
    };

    setMessagesRef.current((prev) => {
      const messagesOnly = prev.filter((m) => m.type !== "date");
      const updatedMessages = [...messagesOnly, optimisticMessage];
      return addDateSeparators(updatedMessages);
    });

    // Scroll to bottom
    if (shouldAutoScrollRef.current) {
      setTimeout(() => {
        flatListRefRef.current?.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    return tempId;
  }, []);

  // Function to remove optimistic message on error - stable callback
  const removeOptimisticMessage = useCallback((tempId) => {
    setMessagesRef.current((prev) => {
      const messagesOnly = prev.filter(
        (m) => m.type !== "date" && m.id !== tempId,
      );
      return addDateSeparators(messagesOnly);
    });
  }, []);

  useEffect(() => {
    if (!chatGroupId || !socket) {
      return;
    }

    // Check if socket is connected
    if (!socket.connected) {
      console.log("⏸️ Socket not connected yet, waiting...");
    }

    // Join chat group using emitter
    joinChatGroup(socket, {
      groupId: chatGroupId,
      userType: "client",
      userId: clientIdRef.current,
    });

    // Register message events
    const cleanupMessages = registerMessageEvents(socket, {
      onMessageReceived: (message) => {
        // Skip messages sent by current client (avoid duplicates)
        if (message.client_id === clientIdRef.current) {
          return;
        }

        const newMessage = {
          id: message.chat_id ? `msg-${message.chat_id}` : `temp-${Date.now()}`,
          sender: message.sender_type === "client" ? "user" : "admin",
          content: message.chat_body,
          timestamp: message.chat_created_at,
          displayTime: new Date(message.chat_created_at).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          agentImage:
            message.sender_type === "agent"
              ? message.agent_profile_picture
              : null,
          agentName:
            message.sender_type === "agent" ? message.agent_name : null,
        };

        setMessagesRef.current((prev) => {
          const messagesOnly = prev.filter((m) => m.type !== "date");
          const exists = messagesOnly.some((m) => m.id === newMessage.id);
          if (exists) {
            return addDateSeparators(messagesOnly);
          }

          const updatedMessages = [...messagesOnly, newMessage];
          return updatedMessages; // Don't add date separators
        });

        // Scroll to bottom if user is at bottom
        if (shouldAutoScrollRef.current) {
          setTimeout(() => {
            flatListRefRef.current?.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      },
      onMessageDelivered: (data) => {
        // Update optimistic message with real chat ID
        setMessagesRef.current((prevMessages) => {
          return prevMessages.map((message) => {
            // Find temp message that matches this delivery
            if (message.type !== "date" && 
                message.isPending && 
                message.id.startsWith("temp-")) {
              return {
                ...message,
                id: `msg-${data.chat_id}`,
                chatId: data.chat_id,
                isPending: false,
                // Keep current status - let messageStatusUpdate handle status changes
              };
            }
            return message;
          });
        });
      },
      onMessageStatusUpdate: (data) => {
        // Update message status based on chat_id (backend sends chatId)
        const chatId = data.chat_id || data.chatId;
        
        setMessagesRef.current((prevMessages) => {
          return prevMessages.map((message) => {
            if (message.type === "date") return message;
            
            // Try multiple matching strategies
            const matchesById = message.id === `msg-${chatId}`;
            const matchesByChatId = message.chatId === chatId;
            const matchesByTempId = message.isPending && message.id.startsWith("temp-");
            
            if (matchesById || matchesByChatId || matchesByTempId) {
              return {
                ...message,
                status: data.status,
                chatId: chatId, // Ensure chatId is set
                isPending: false, // Mark as no longer pending
              };
            }
            return message;
          });
        });
      },
      onMessageError: (error) => {
        // Handle message error if needed
        console.error("❌ Message error:", error);
      },
    });

    // Register typing events
    const cleanupTyping = registerTypingEvents(socket, {
      onTyping: (data) => {
        if (data.chatGroupId === chatGroupId && data.userType !== "client") {
          setIsTyping(true);
          setTypingAgentName(data.userName || "Agent");
          setTypingAgentImage(data.userImage || null);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingAgentName("Agent");
            setTypingAgentImage(null);
          }, 3000);
        }
      },
      onStopTyping: (data) => {
        if (data.chatGroupId === chatGroupId && data.userType !== "client") {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          setIsTyping(false);
          setTypingAgentName("Agent");
          setTypingAgentImage(null);
        }
      },
    });

    // Register connection events (for reconnection handling)
    const cleanupConnection = registerConnectionEvents(socket, {
      onConnect: () => {
        // Re-join chat group on reconnection
        joinChatGroup(socket, {
          groupId: chatGroupId,
          userType: "client",
          userId: clientIdRef.current,
        });
      },
    });

    // Cleanup
    return () => {
      // Cleanup all event listeners
      cleanupMessages();
      cleanupTyping();
      cleanupConnection();
    };
  }, [chatGroupId, socket]); // Removed clientId dependency - using ref instead

  return {
    isTyping,
    typingAgentName,
    typingAgentImage,
    addOptimisticMessage,
    removeOptimisticMessage,
  };
};

export default useMessageSocket;
