/**
 * Helper function to add date separators to messages
 */
export const addDateSeparators = (messageList) => {
  // Filter out any existing date separators first
  const cleanMessages = messageList.filter((m) => m.type !== 'date');

  const messagesWithDates = [];
  let lastDate = null;

  cleanMessages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();

    if (msgDate !== lastDate) {
      messagesWithDates.push({
        id: `date-${msgDate}-${Date.now()}`,
        type: 'date',
        date: msgDate,
      });
      lastDate = msgDate;
    }

    messagesWithDates.push(msg);
  });

  return messagesWithDates;
};

/**
 * Format date label for display
 */
export const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export default {
  addDateSeparators,
  formatDateLabel,
};
