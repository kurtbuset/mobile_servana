import { configureStore } from "@reduxjs/toolkit";
// Legacy slices (to be migrated)
import userReducer from "./slices/userSlice";
import clientReducer from "./slices/clientSlice";

// Phase 3 slices (new modular structure)
import { profileReducer } from './store/slices/profile';
import { messageReducer } from './store/slices/messages';
import { uiReducer } from './store/slices/ui';
import { errorMiddleware, loggingMiddleware } from './store/middleware';

export const store = configureStore({
  reducer: {
    // Legacy reducers (for backward compatibility)
    user: userReducer,
    client: clientReducer,
    
    // Phase 3 reducers (new structure)
    // Note: auth slice removed - authentication state managed via profile.client
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
