import { createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../../shared/api';
import {
  setMessages,
  prependMessages,
  setMessageError,
  setHasMore,
} from './messageSlice';

/**
 * Load messages thunk
 */
export const loadMessagesThunk = createAsyncThunk(
  'messages/load',
  async ({ chatGroupId, before = null }, { dispatch, rejectWithValue }) => {
    try {
      const options = { limit: 20, before };
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

      if (before) {
        dispatch(prependMessages(mappedMessages));
      } else {
        dispatch(setMessages(mappedMessages));
      }

      dispatch(setHasMore(data.messages.length === 20));

      return mappedMessages;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load messages';
      dispatch(setMessageError(message));
      return rejectWithValue(message);
    }
  }
);

/**
 * Get chat group thunk
 */
export const getChatGroupThunk = createAsyncThunk(
  'messages/getChatGroup',
  async (clientId, { rejectWithValue }) => {
    try {
      const data = await messageAPI.getChatGroup(clientId);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get chat group';
      return rejectWithValue(message);
    }
  }
);

export default {
  loadMessagesThunk,
  getChatGroupThunk,
};
