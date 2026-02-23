import { useState, useEffect, useCallback } from 'react';
import { messageAPI } from '../../../shared/api';
import { addDateSeparators } from '../utils/messageHelpers';

/**
 * Custom hook for managing messages
 */
export const useMessages = (chatGroupId, token) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestTimestamp, setOldestTimestamp] = useState(null);
  const [error, setError] = useState(null);

  const loadMessages = useCallback(async (append = false) => {
    if (!chatGroupId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const options = {
        limit: 10,
        before: append ? oldestTimestamp : null,
      };

      const data = await messageAPI.getMessages(chatGroupId, options);

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
        setMessages((prev) => {
          const messagesOnly = prev.filter((m) => m.type !== 'date');
          const existingIds = new Set(messagesOnly.map((m) => m.id));
          const newUniqueMessages = mappedMessages.filter(
            (m) => !existingIds.has(m.id)
          );
          const combined = [...newUniqueMessages, ...messagesOnly];
          return addDateSeparators(combined);
        });
      } else {
        setMessages(addDateSeparators(mappedMessages));
      }

      if (mappedMessages.length > 0) {
        setOldestTimestamp(mappedMessages[0].timestamp);
      }

      setHasMore(data.messages.length === 10);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [chatGroupId, loading, oldestTimestamp]);

  const addMessage = useCallback((newMessage) => {
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
  }, []);

  return {
    messages,
    loading,
    hasMore,
    error,
    loadMessages,
    addMessage,
    setMessages,
  };
};

export default useMessages;
