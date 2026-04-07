import logger from '../../utils/logger';

/**
 * Logging middleware for development
 * Logs dispatched actions with their payloads
 */
export const loggingMiddleware = (store) => (next) => (action) => {
  logger.debug(`[Redux] ${action.type}`, action.payload);
  return next(action);
};

export default loggingMiddleware;
