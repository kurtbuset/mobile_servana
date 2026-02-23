import { useState, useCallback, useEffect } from 'react';
import { messageAPI } from '../../../shared/api';
import { addDateSeparators } from '../utils/messageHelpers';

/**
 * Hook for managing message history with pagination
 */
export const useMessageHistory = (chatGroupId, token, flatListRef) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Load messages with pagination
  const loadMessages = useCallback(async (before = null, append = false) => {
    if (!chatGroupId || !token || isLoadingMessages) return;

    try {
      setIsLoadingMessages(true);

      // Use centralized API
      const data = await messageAPI.getMessages(chatGroupId, {
        limit: 10,
        before,
      });

      // Map messages to UI format
      const mappedMessages = data.messages.map((m, index) => ({
        id: m.chat_id ? `msg-${m.chat_id}` : `temp-${Date.now()}-${index}`,
        sender: m.client_id ? 'user' : 'admin',
        content: m.chat_body,
        timestamp: m.chat_created_at,
        displayTime: new Date(m.chat_created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      if (append) {
        // Prepend older messages
        setMessages((prev) => {
          const messagesOnly = prev.filter((m) => m.type !== 'date');
          const existingIds = new Set(messagesOnly.map((m) => m.id));
          const newUniqueMessages = mappedMessages.filter((m) => !existingIds.has(m.id));
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
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [chatGroupId, token, isLoadingMessages, flatListRef]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages || !oldestMessageTimestamp) return;
    
    console.log('Loading more messages...');
    await loadMessages(oldestMessageTimestamp, true);
  }, [hasMoreMessages, isLoadingMessages, oldestMessageTimestamp, loadMessages]);

  // Load initial messages when chat group changes
  useEffect(() => {
    if (chatGroupId && token) {
      loadMessages();
    }
  }, [chatGroupId, token]);

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
