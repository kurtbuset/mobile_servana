import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  currentChatGroupId: null,
  messages: [],
  loading: false,
  error: null,
  hasMore: true,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setCurrentChatGroup: (state, action) => {
      state.currentChatGroupId = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    prependMessages: (state, action) => {
      state.messages = [...action.payload, ...state.messages];
    },
    setMessageLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMessageError: (state, action) => {
      state.error = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentChatGroupId = null;
      state.hasMore = true;
    },
  },
});

export const {
  setConversations,
  setCurrentChatGroup,
  setMessages,
  addMessage,
  prependMessages,
  setMessageLoading,
  setMessageError,
  setHasMore,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
