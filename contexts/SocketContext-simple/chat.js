/**
 * Chat Socket Handlers
 * Emitters and event listeners for chat functionality
 */

// ============= EMITTERS =============

export const sendMessage = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Cannot send message - socket not connected");
    return false;
  }
  socket.emit("sendMessage", data);
  return true;
};

export const joinChatGroup = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Cannot join chat group - socket not connected");
    return false;
  }
  socket.emit("joinChatGroup", {
    chatGroupId: data.groupId,
    userType: data.userType,
    userId: data.userId,
  });
  console.log("📱 Joined chat group:", data.groupId);
  return true;
};

// ============= EVENT LISTENERS =============

export const registerMessageEvents = (socket, callbacks = {}) => {
  const { 
    onMessageReceived, 
    onMessageDelivered, 
    onMessageError,
    onMessageStatusUpdate
  } = callbacks;

  const handleReceiveMessage = (message) => {
    console.log("📨 Received message:", message.chat_id);
    if (onMessageReceived) onMessageReceived(message);
  };

  const handleMessageDelivered = (data) => {
    console.log("✅ Message delivered:", data.chat_id);
    if (onMessageDelivered) onMessageDelivered(data);
  };

  const handleMessageError = (error) => {
    console.error("❌ Message error:", error);
    if (onMessageError) onMessageError(error);
  };

  const handleMessageStatusUpdate = (data) => {
    if (onMessageStatusUpdate) onMessageStatusUpdate(data);
  };

  socket.on("receiveMessage", handleReceiveMessage);
  socket.on("messageDelivered", handleMessageDelivered);
  socket.on("messageError", handleMessageError);
  socket.on("messageStatusUpdate", handleMessageStatusUpdate);

  return () => {
    socket.off("receiveMessage", handleReceiveMessage);
    socket.off("messageDelivered", handleMessageDelivered);
    socket.off("messageError", handleMessageError);
    socket.off("messageStatusUpdate", handleMessageStatusUpdate);
  };
};
