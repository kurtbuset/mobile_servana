import apiClient from './client';
import { MESSAGE_ENDPOINTS } from './endpoints';

/**
 * Get messages for a chat group with pagination
 */
export const getMessages = async (chatGroupId, options = {}) => {
  const { limit = 10, before = null } = options;
  
  let url = MESSAGE_ENDPOINTS.GET_MESSAGES(chatGroupId);
  const params = new URLSearchParams({ limit: limit.toString() });
  
  if (before) {
    params.append('before', before);
  }
  
  const response = await apiClient.get(`${url}?${params.toString()}`);
  return response.data;
};

/**
 * Send a message
 */
export const sendMessage = async (messageData) => {
  const response = await apiClient.post(MESSAGE_ENDPOINTS.SEND_MESSAGE, messageData);
  return response.data;
};

/**
 * Get or create chat group for client
 */
export const getChatGroup = async (clientId) => {
  const response = await apiClient.get(MESSAGE_ENDPOINTS.GET_CHAT_GROUP(clientId));
  return response.data;
};

/**
 * Get latest chat group for current client
 */
export const getLatestChatGroup = async () => {
  const response = await apiClient.get(MESSAGE_ENDPOINTS.GET_LATEST_CHAT_GROUP);
  return response.data;
};

/**
 * Create new chat group
 */
export const createChatGroup = async (chatGroupData) => {
  const response = await apiClient.post(
    MESSAGE_ENDPOINTS.CREATE_CHAT_GROUP,
    chatGroupData
  );
  return response.data;
};

/**
 * Mark message as read
 */
export const markAsRead = async (messageId) => {
  const response = await apiClient.put(MESSAGE_ENDPOINTS.MARK_AS_READ(messageId));
  return response.data;
};

export default {
  getMessages,
  sendMessage,
  getChatGroup,
  getLatestChatGroup,
  createChatGroup,
  markAsRead,
};
