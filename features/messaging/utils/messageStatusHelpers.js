/**
 * Utility functions for message status handling
 */

/**
 * Find the index of the latest user message in a message array
 * @param {Array} messages - Array of messages with date separators
 * @returns {number} - Index of the latest user message, or -1 if not found
 */
export const findLatestUserMessageIndex = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type !== "date" && message.sender === "user") {
      return i;
    }
  }
  return -1;
};

/**
 * Check if a message is the latest user message
 * @param {Array} messages - Array of messages with date separators
 * @param {number} currentIndex - Index of the current message
 * @returns {boolean} - True if this is the latest user message
 */
export const isLatestUserMessage = (messages, currentIndex) => {
  const latestUserMessageIndex = findLatestUserMessageIndex(messages);
  return currentIndex === latestUserMessageIndex;
};

/**
 * Get message status display text
 * @param {string} status - Message status (sent, delivered, read)
 * @returns {string} - Display text for the status
 */
export const getStatusDisplayText = (status) => {
  switch (status) {
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "sent":
      return "Sent";
    default:
      return "Sent";
  }
};

/**
 * Get message status color
 * @param {string} status - Message status (sent, delivered, read)
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {string} - Color for the status text
 */
export const getStatusColor = (status, isDark) => {
  switch (status) {
    case "read":
      return '#6237A0'; // Purple for read
    case "delivered":
      return isDark ? '#22c55e' : '#16a34a'; // Green for delivered
    case "sent":
    default:
      return isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'; // Gray for sent
  }
};