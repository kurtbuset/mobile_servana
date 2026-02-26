import { useState } from 'react';
import { addDateSeparators } from '../utils/messageHelpers';

/**
 * Hook for sending messages via socket
 */
export const useSendMessage = (
  socket,
  chatGroupId,
  clientId,
  setMessages,
  shouldAutoScroll,
  flatListRef
) => {
  const [sending, setSending] = useState(false);

  const sendMessage = async (text, groupId = null) => {
    const targetGroupId = groupId || chatGroupId;
    if (!text || !socket || !targetGroupId) return { success: false };

    try {
      setSending(true);

      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const now = new Date();
      const optimisticMessage = {
        id: tempId,
        sender: 'user',
        content: text,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPending: true,
      };

      setMessages((prev) => {
        const messagesOnly = prev.filter((m) => m.type !== 'date');
        const updatedMessages = [...messagesOnly, optimisticMessage];
        return addDateSeparators(updatedMessages);
      });

      // Scroll to bottom
      if (shouldAutoScroll) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Send via socket
      socket.emit('sendMessage', {
        chat_body: text,
        chat_group_id: targetGroupId,
        client_id: clientId,
      });

      console.log('clientId: ', clientId)
      console.log('targetGroupId: ', targetGroupId)

      // Listen for delivery confirmation
      const handleDelivery = (data) => {
        if (data.chat_group_id === targetGroupId) {
          setMessages((prev) => {
            const messagesOnly = prev.filter((m) => m.type !== 'date');
            const updatedMessages = messagesOnly.map((m) =>
              m.id === tempId ? { ...m, id: `msg-${data.chat_id}`, isPending: false } : m
            );
            return addDateSeparators(updatedMessages);
          });
          socket.off('messageDelivered', handleDelivery);
        }
      };

      socket.on('messageDelivered', handleDelivery);

      // Handle errors
      const handleError = (error) => {
        if (error.chat_group_id === targetGroupId) {
          console.error('❌ Failed to send message:', error);
          // Remove optimistic message on error
          setMessages((prev) => {
            const messagesOnly = prev.filter((m) => m.type !== 'date' && m.id !== tempId);
            return addDateSeparators(messagesOnly);
          });
          socket.off('messageError', handleError);
        }
      };

      socket.on('messageError', handleError);

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false };
    } finally {
      setSending(false);
    }
  };

  return {
    sendMessage,
    sending,
  };
};

export default useSendMessage;
