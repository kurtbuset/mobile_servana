import NetInfo from '@react-native-community/netinfo';

/**
 * Network connection monitoring utilities
 */

let connectionListeners = [];

/**
 * Subscribe to connection changes
 */
export const subscribeToConnection = (callback) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback({
      isConnected: state.isConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    });
  });

  connectionListeners.push(unsubscribe);
  return unsubscribe;
};

/**
 * Get current connection state
 */
export const getConnectionState = async () => {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected,
    type: state.type,
    isInternetReachable: state.isInternetReachable,
  };
};

/**
 * Check if connected to internet
 */
export const isConnected = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

/**
 * Wait for connection
 */
export const waitForConnection = (timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('Connection timeout'));
    }, timeout);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
};

/**
 * Cleanup all listeners
 */
export const cleanupListeners = () => {
  connectionListeners.forEach((unsubscribe) => unsubscribe());
  connectionListeners = [];
};

export default {
  subscribeToConnection,
  getConnectionState,
  isConnected,
  waitForConnection,
  cleanupListeners,
};
