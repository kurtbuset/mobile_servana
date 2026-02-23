/**
 * Message state selectors
 */

export const selectConversations = (state) => state.messages.conversations;

export const selectCurrentChatGroupId = (state) => state.messages.currentChatGroupId;

export const selectMessages = (state) => state.messages.messages;

export const selectMessageLoading = (state) => state.messages.loading;

export const selectMessageError = (state) => state.messages.error;

export const selectHasMoreMessages = (state) => state.messages.hasMore;

export const selectMessageCount = (state) => state.messages.messages.length;

export const selectLatestMessage = (state) => {
  const messages = state.messages.messages;
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

export default {
  selectConversations,
  selectCurrentChatGroupId,
  selectMessages,
  selectMessageLoading,
  selectMessageError,
  selectHasMoreMessages,
  selectMessageCount,
  selectLatestMessage,
};
