/**
 * Configuration Module
 * Central export for all configuration files
 */

export * from './environment';
export * from './navigation';
export { default as API_URL } from './api';
export { default as createSocket, clearSocket } from './socket';

// Re-export for convenience
import environment from './environment';
import navigation from './navigation';
import API_URL from './api';
import createSocket, { clearSocket } from './socket';

export default {
  ...environment,
  ...navigation,
  API_URL,
  createSocket,
  clearSocket,
};
