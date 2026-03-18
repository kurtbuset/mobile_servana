import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { endChatGroup } from '../../../shared/api/message.api';

/**
 * Hook for managing end chat functionality
 * Handles chat termination, rating, and feedback
 */
export const useEndChat = (chatGroupId, onChatEnded) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);

  const handleEndChat = useCallback(async (feedbackData = {}) => {
    if (!chatGroupId) {
      Alert.alert('Error', 'No active chat session found');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call API to end chat group
      const response = await endChatGroup(chatGroupId, {
        rating: feedbackData.rating || 0,
        feedback: feedbackData.feedback || '',
        chatDuration: feedbackData.chatDuration,
        messageCount: feedbackData.messageCount,
        endedAt: new Date().toISOString(),
      });

      console.log('✅ Chat ended successfully:', response);

      // Call the callback to handle navigation/cleanup
      if (onChatEnded) {
        onChatEnded(response, feedbackData);
      }

      return response;
    } catch (error) {
      console.error('❌ Error ending chat:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.error || 'Failed to end chat. Please try again.';
      Alert.alert('Error', errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [chatGroupId, onChatEnded]);

  const showEndChatConfirmation = useCallback(() => {
    setShowEndChatModal(true);
  }, []);

  const hideEndChatModal = useCallback(() => {
    setShowEndChatModal(false);
  }, []);

  return {
    isLoading,
    showEndChatModal,
    handleEndChat,
    showEndChatConfirmation,
    hideEndChatModal,
  };
};

export default useEndChat;