/**
 * Chat Statistics Utilities
 * Helper functions for calculating chat duration, message counts, etc.
 */

/**
 * Calculate chat duration from start time to now
 * @param {string|Date} startTime - Chat start time
 * @returns {string} Formatted duration string
 */
export const calculateChatDuration = (startTime) => {
  if (!startTime) return null;
  
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  
  // Convert to minutes and seconds
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  } else if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Count messages by type (user vs agent)
 * @param {Array} messages - Array of message objects
 * @param {string} currentUserId - Current user ID to determine message ownership
 * @returns {Object} Message count statistics
 */
export const getMessageStats = (messages, currentUserId) => {
  if (!messages || !Array.isArray(messages)) {
    return {
      total: 0,
      userMessages: 0,
      agentMessages: 0,
    };
  }
  
  const stats = messages.reduce(
    (acc, message) => {
      acc.total++;
      
      // Determine if message is from current user
      const isUserMessage = 
        message.sender_id === currentUserId || 
        message.client_id === currentUserId ||
        message.senderType === 'client';
        
      if (isUserMessage) {
        acc.userMessages++;
      } else {
        acc.agentMessages++;
      }
      
      return acc;
    },
    { total: 0, userMessages: 0, agentMessages: 0 }
  );
  
  return stats;
};

/**
 * Get the first message timestamp from a messages array
 * @param {Array} messages - Array of message objects
 * @returns {string|null} First message timestamp
 */
export const getChatStartTime = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }
  
  // Messages are typically sorted by timestamp, get the first one
  const firstMessage = messages[0];
  return firstMessage.created_at || firstMessage.timestamp || null;
};

/**
 * Format chat statistics for display
 * @param {Array} messages - Array of message objects
 * @param {string} currentUserId - Current user ID
 * @returns {Object} Formatted chat statistics
 */
export const formatChatStats = (messages, currentUserId) => {
  const messageStats = getMessageStats(messages, currentUserId);
  const startTime = getChatStartTime(messages);
  const duration = calculateChatDuration(startTime);
  
  return {
    duration,
    messageCount: messageStats.total,
    userMessages: messageStats.userMessages,
    agentMessages: messageStats.agentMessages,
    startTime,
  };
};

export default {
  calculateChatDuration,
  getMessageStats,
  getChatStartTime,
  formatChatStats,
};