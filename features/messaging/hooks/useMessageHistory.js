import logger from "../../../utils/logger";

import { useState, useCallback, useEffect, useRef } from "react";
import { messageAPI } from "../../../shared/api";
import { addDateSeparators } from "../utils/messageHelpers";

/**
 * Hook for managing message history with pagination
 * Token is automatically included in API requests via interceptor
 * Modified to preserve messages for continuous chat experience
 */
export const useMessageHistory = (chatGroupId, flatListRef) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastChatGroupId, setLastChatGroupId] = useState(null);

  // Use refs to prevent callback recreation
  const flatListRefRef = useRef(flatListRef);
  const lastChatGroupIdRef = useRef(lastChatGroupId);
  const isLoadingRef = useRef(isLoadingMessages);

  // Update refs
  useEffect(() => {
    flatListRefRef.current = flatListRef;
  }, [flatListRef]);

  useEffect(() => {
    lastChatGroupIdRef.current = lastChatGroupId;
  }, [lastChatGroupId]);

  useEffect(() => {
    isLoadingRef.current = isLoadingMessages;
  }, [isLoadingMessages]);

  // Load messages with pagination - stable callback
  const loadMessages = useCallback(
    async (before = null, append = false) => {
      if (!chatGroupId || isLoadingRef.current) return;

      try {
        setIsLoadingMessages(true);

        // Use centralized API
        const data = await messageAPI.getMessages(chatGroupId, {
          limit: 30,
          before,
        });

        // Handle both old and new response formats
        const messagesData = data.messages || data;
        const paginationMeta = data.pagination;

        // Map messages to UI format
        const mappedMessages = messagesData.map((m, index) => {
          // Handle transfer messages
          if (m.message_type === 'transfer') {
            return {
              id: m.chat_id,
              sender: 'system',
              sender_type: 'system',
              message_type: 'transfer',
              content: m.chat_body,
              timestamp: m.chat_created_at,
              displayTime: new Date(m.chat_created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              transfer_data: m.transfer_data,
              isPending: false,
            };
          }

          // Calculate status based on database fields
          let status = "sent"; // Default status
          if (m.chat_read_at) {
            status = "read";
          } else if (m.chat_delivered_at) {
            status = "delivered";
          }

          // Determine sender for UI (user = client, admin = agent)
          const sender = m.client_id ? "user" : "admin";

          return {
            id: m.chat_id ? `msg-${m.chat_id}` : `temp-${Date.now()}-${index}`,
            sender: sender,
            sender_type: m.sender_type || (m.client_id ? 'client' : 'agent'),
            sender_name: m.sender_name || null,
            sender_image: m.sender_image || null,
            content: m.chat_body,
            timestamp: m.chat_created_at,
            displayTime: new Date(m.chat_created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: status,
            chatId: m.chat_id,
            isPending: false,
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
          // For continuous chat: append to existing messages instead of replacing
          if (lastChatGroupIdRef.current && lastChatGroupIdRef.current !== chatGroupId) {
            // New chat group - append to existing messages
            setMessages((prev) => {
              const messagesOnly = prev.filter((m) => m.type !== "date");
              const existingIds = new Set(messagesOnly.map((m) => m.id));
              const newUniqueMessages = mappedMessages.filter(
                (m) => !existingIds.has(m.id),
              );
              const combined = [...messagesOnly, ...newUniqueMessages];
              return addDateSeparators(combined);
            });
          } else {
            // Initial load or same chat group
            setMessages(addDateSeparators(mappedMessages));
          }
        }

        // Update pagination state - use metadata if available
        if (paginationMeta) {
          setHasMoreMessages(paginationMeta.hasMore);
          if (paginationMeta.oldestTimestamp) {
            setOldestMessageTimestamp(paginationMeta.oldestTimestamp);
          }
        } else {
          // Fallback to length-based check
          setHasMoreMessages(messagesData.length === 30);
          if (mappedMessages.length > 0) {
            setOldestMessageTimestamp(mappedMessages[0].timestamp);
          }
        }
      } catch (error) {
        logger.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [chatGroupId],
  );

  // Load more messages (pagination) - stable callback
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingRef.current || !oldestMessageTimestamp)
      return;

    await loadMessages(oldestMessageTimestamp, true);
  }, [hasMoreMessages, oldestMessageTimestamp, loadMessages]);

  // Load initial messages when chat group changes
  useEffect(() => {
    if (chatGroupId) {
      setLastChatGroupId(chatGroupId);
      loadMessages();
    }
    // DON'T clear messages when chatGroupId becomes null - preserve for continuous chat
  }, [chatGroupId, loadMessages]);

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
