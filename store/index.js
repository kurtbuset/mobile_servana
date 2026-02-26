import { configureStore } from '@reduxjs/toolkit';
import { profileReducer } from './slices/profile';
import { messageReducer } from './slices/messages';
import { uiReducer } from './slices/ui';
import { errorMiddleware, loggingMiddleware } from './middleware';

/**
 * Configure Redux store with all slices and middleware
 * Note: Auth slice removed - authentication managed via profile.client
 */
export const store = configureStore({
  reducer: {
    profile: profileReducer,
    messages: messageReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket instances in actions
        ignoredActions: ['socket/connect', 'socket/disconnect'],
        ignoredPaths: ['socket'],
      },
    }).concat(errorMiddleware, __DEV__ ? loggingMiddleware : []),
});

export default store;
