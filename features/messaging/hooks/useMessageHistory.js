import { useState, useCallback, useEffect } from "react";
import { messageAPI } from "../../../shared/api";
import { addDateSeparators } from "../utils/messageHelpers";

/**
 * Hook for managing message history with pagination
 * Token is automatically included in API requests via interceptor
 */
export const useMessageHistory = (chatGroupId, flatListRef) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Load messages with pagination
  const loadMessages = useCallback(
    async (before = null, append = false) => {
      if (!chatGroupId || isLoadingMessages) return;

      try {
        setIsLoadingMessages(true);

        // Use centralized API
        const data = await messageAPI.getMessages(chatGroupId, {
          limit: 10,
          before,
        });

        // Map messages to UI format
        const mappedMessages = data.messages.map((m, index) => {
          // Calculate status based on database fields
          let status = "sent"; // Default status
          if (m.chat_read_at) {
            status = "read";
          } else if (m.chat_delivered_at) {
            status = "delivered";
          }

          return {
            id: m.chat_id ? `msg-${m.chat_id}` : `temp-${Date.now()}-${index}`,
            sender: m.client_id ? "user" : "admin",
            content: m.chat_body,
            timestamp: m.chat_created_at,
            displayTime: new Date(m.chat_created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: status, // Include status from database
            chatId: m.chat_id, // Include chatId for socket updates
            isPending: false, // Messages from DB are not pending
          };
        });

        if (append) {
          // Prepend older messages
          setMessages((prev) => {
            const messagesOnly = prev.filter((m) => m.type !== "date");
            const existingIds = new Set(messagesOnly.map((m) => m.id));
            const newUniqueMessages = mappedMessages.filter(
              (m) => !existingIds.has(m.id),
            );
            const combined = [...newUniqueMessages, ...messagesOnly];
            return addDateSeparators(combined);
          });
        } else {
          // Initial load
          setMessages(addDateSeparators(mappedMessages));
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }

        // Update pagination state
        setHasMoreMessages(data.hasMore);
        if (mappedMessages.length > 0) {
          setOldestMessageTimestamp(mappedMessages[0].timestamp);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [chatGroupId, isLoadingMessages, flatListRef],
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages || !oldestMessageTimestamp)
      return;

    await loadMessages(oldestMessageTimestamp, true);
  }, [
    hasMoreMessages,
    isLoadingMessages,
    oldestMessageTimestamp,
    loadMessages,
  ]);

  // Load initial messages when chat group changes
  useEffect(() => {
    if (chatGroupId) {
      loadMessages();
    }
  }, [chatGroupId]);

  return {
    messages,
    setMessages,
    isLoadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    shouldAutoScroll,
    setShouldAutoScroll,
  };
};

export default useMessageHistory;
