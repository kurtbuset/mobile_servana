/**
 * Logging middleware for development
 * Logs all dispatched actions and state changes
 */
export const loggingMiddleware = (store) => (next) => (action) => {
  if (__DEV__) {
    console.group(`🔄 Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Previous State:', store.getState());
  }

  const result = next(action);

  if (__DEV__) {
    // console.log('Next State:', store.getState());
    console.groupEnd();
  }

  return result;
};

export default loggingMiddleware;
