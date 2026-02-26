import { showToast } from '../slices/ui/uiSlice';

/**
 * Error handling middleware
 * Catches rejected actions and shows error toasts
 */
export const errorMiddleware = (store) => (next) => (action) => {
  // Check if action is a rejected thunk
  if (action.type?.endsWith('/rejected')) {
    const errorMessage = action.payload || action.error?.message || 'An error occurred';

    // Show error toast
    store.dispatch(
      showToast({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      })
    );

    console.error('Error caught by middleware:', {
      action: action.type,
      error: errorMessage,
    });
  }

  return next(action);
};

export default errorMiddleware;
