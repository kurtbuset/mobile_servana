import logger from "../../../utils/logger";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  registerMessageEvents,
  registerTypingEvents,
  registerConnectionEvents,
  joinChatGroup,
} from "../../../contexts/SocketContext";

/**
 * Check if a date separator is needed before appending a new message.
 * Returns an array: either [dateSeparator, message] or just [message].
 */
const getItemsToAppend = (prevMessages, newMessage) => {
  const newMsgDate = new Date(newMessage.timestamp).toDateString();

  // Find the last real message's date
  let lastMsgDate = null;
  for (let i = prevMessages.length - 1; i >= 0; i--) {
    if (prevMessages[i].type !== "date") {
      lastMsgDate = new Date(prevMessages[i].timestamp).toDateString();
      break;
    }
  }

  if (lastMsgDate !== newMsgDate) {
    const dateSeparator = {
      id: `date-${newMsgDate}`,
      type: "date",
      date: newMsgDate,
    };
    return [dateSeparator, newMessage];
  }

  return [newMessage];
};

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
  onChatResolved, // Add callback for when chat is resolved
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
      const itemsToAppend = getItemsToAppend(prev, optimisticMessage);
      return [...prev, ...itemsToAppend];
    });

    return tempId;
  }, []);

  // Function to remove optimistic message on error - stable callback
  const removeOptimisticMessage = useCallback((tempId) => {
    setMessagesRef.current((prev) => {
      return prev.filter((m) => m.id !== tempId);
    });
  }, []);

  useEffect(() => {
    if (!chatGroupId || !socket) {
      return;
    }

    // Check if socket is connected
    if (!socket.connected) {
      logger.info("Socket not connected yet, waiting...");
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
          const exists = prev.some((m) => m.type !== "date" && m.id === newMessage.id);
          if (exists) {
            return prev;
          }

          const itemsToAppend = getItemsToAppend(prev, newMessage);
          return [...prev, ...itemsToAppend];
        });
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
                chatId: chatId,
                isPending: false,
              };
            }
            return message;
          });
        });
      },
      onChatTransferred: (data) => {
        logger.info('transferData: ', data)
        // Handle chat transfer notification
        logger.info("Chat transferred:", data);

        // Create transfer message
        let transferText = '';
        if (data.transfer_type === 'manual') {
          transferText =  `Chat transferred to ${data.to_dept}`;
        } else if (data.transfer_type === 'agent_offline') {
          transferText = 'Chat reassigned (previous agent went offline)';
        } else {
          transferText = 'Chat transferred';
        }

        const transferMessage = {
          id: `transfer-${Date.now()}`,
          sender: 'system',
          sender_type: 'system',
          message_type: 'transfer',
          content: transferText,
          timestamp: data.timestamp || new Date().toISOString(),
          displayTime: new Date(data.timestamp || new Date()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          transfer_data: {
            transfer_type: data.transfer_type,
            to_dept: data.to_dept,
            to_agent: data.to_agent,
            from_dept: data.from_dept,
          },
          isPending: false,
        };

        setMessagesRef.current((prev) => {
          const itemsToAppend = getItemsToAppend(prev, transferMessage);
          return [...prev, ...itemsToAppend];
        });
      },
      onChatResolved: (data) => {
        logger.info("Chat resolved:", data);

        // Create resolved message separator
        const resolvedMessage = {
          id: `resolved-${Date.now()}`,
          sender: 'system',
          sender_type: 'system',
          message_type: 'resolved',
          content: 'Chat has been resolved',
          timestamp: data.resolved_at || new Date().toISOString(),
          displayTime: new Date(data.resolved_at || new Date()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          resolved_by_type: data.resolved_by_type,
          resolved_by_id: data.resolved_by_id,
          isPending: false,
        };

        setMessagesRef.current((prev) => {
          const itemsToAppend = getItemsToAppend(prev, resolvedMessage);
          return [...prev, ...itemsToAppend];
        });

        // Trigger callback if provided (for navigation)
        if (onChatResolved) {
          onChatResolved(data);
        }
      },
      onMessageError: (error) => {
        // Handle message error if needed
        logger.error("Message error:", error);
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
  }, [chatGroupId, socket, onChatResolved]);

  return {
    isTyping,
    typingAgentName,
    typingAgentImage,
    addOptimisticMessage,
    removeOptimisticMessage,
  };
};

export default useMessageSocket;
