import logger from '../../utils/logger';

/**
 * Socket Emitters & Event Listeners
 * Chat messaging and typing indicator handlers
 */

// ============= CHAT EMITTERS =============

export const sendMessage = (socket, data) => {
  if (!socket || !socket.connected) {
    logger.warn("⚠️ Cannot send message - socket not connected");
    return false;
  }
  socket.emit("sendMessage", data);
  return true;
};

export const joinChatGroup = (socket, data) => {
  if (!socket || !socket.connected) {
    logger.warn("⚠️ Cannot join chat group - socket not connected");
    return false;
  }
  socket.emit("chat:join", {
    chatGroupId: data.groupId,
    userType: data.userType,
    userId: data.userId,
  });
  return true;
};

export const leaveChatGroup = (socket, chatGroupId) => {
  if (!socket || !socket.connected) {
    logger.warn("⚠️ Cannot leave chat group - socket not connected");
    return false;
  }
  socket.emit("chat:leave", { chatGroupId });
  logger.info("🚪 Left chat group:", chatGroupId);
  return true;
};

// ============= TYPING EMITTERS =============

export const emitTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    logger.warn("⚠️ Cannot emit typing - socket not connected");
    return false;
  }
  socket.emit("typing", data);
  return true;
};

export const emitStopTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    logger.warn("⚠️ Cannot emit stop typing - socket not connected");
    return false;
  }
  socket.emit("stopTyping", data);
  return true;
};

// ============= EVENT LISTENERS =============

export const registerMessageEvents = (socket, callbacks = {}) => {
  const {
    onMessageReceived,
    onMessageDelivered,
    onMessageError,
    onMessageStatusUpdate,
    onChatTransferred,
    onChatResolved,
  } = callbacks;

  const handleReceiveMessage = (message) => {
    logger.info("📨 Received message:", message.chat_id);
    if (onMessageReceived) onMessageReceived(message);
  };

  const handleMessageDelivered = (data) => {
    logger.info("✅ Message delivered:", data.chat_id);
    if (onMessageDelivered) onMessageDelivered(data);
  };

  const handleMessageError = (error) => {
    logger.error("❌ Message error:", error);
    if (onMessageError) onMessageError(error);
  };

  const handleMessageStatusUpdate = (data) => {
    if (onMessageStatusUpdate) onMessageStatusUpdate(data);
  };

  const handleChatTransferred = (data) => {
    logger.info("🔄 Chat transferred:", data);
    if (onChatTransferred) onChatTransferred(data);
  };

  const handleChatResolved = (data) => {
    logger.info("✅ Chat resolved:", data);
    if (onChatResolved) onChatResolved(data);
  };

  socket.on("receiveMessage", handleReceiveMessage);
  socket.on("messageDelivered", handleMessageDelivered);
  socket.on("messageError", handleMessageError);
  socket.on("messageStatusUpdate", handleMessageStatusUpdate);
  socket.on("chatTransferred", handleChatTransferred);
  socket.on("chat:resolved", handleChatResolved);

  return () => {
    socket.off("receiveMessage", handleReceiveMessage);
    socket.off("messageDelivered", handleMessageDelivered);
    socket.off("messageError", handleMessageError);
    socket.off("messageStatusUpdate", handleMessageStatusUpdate);
    socket.off("chatTransferred", handleChatTransferred);
    socket.off("chat:resolved", handleChatResolved);
  };
};

export const registerTypingEvents = (socket, callbacks = {}) => {
  const { onTyping, onStopTyping } = callbacks;

  const handleTyping = (data) => {
    logger.info("👤 User typing:", data.userName);
    if (onTyping) onTyping(data);
  };

  const handleStopTyping = (data) => {
    logger.info("👤 User stopped typing");
    if (onStopTyping) onStopTyping(data);
  };

  socket.on("typing", handleTyping);
  socket.on("stopTyping", handleStopTyping);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("stopTyping", handleStopTyping);
  };
};

export const registerConnectionEvents = (socket, callbacks = {}) => {
  const { onConnect, onDisconnect, onConnectError } = callbacks;

  const handleConnect = () => {
    logger.info("✅ Socket connected:", socket.id);
    if (onConnect) onConnect(socket.id);
  };

  const handleDisconnect = (reason) => {
    logger.info("❌ Socket disconnected:", reason);
    if (onDisconnect) onDisconnect(reason);
  };

  const handleConnectError = (error) => {
    logger.error("❌ Socket connection error:", error.message);
    if (onConnectError) onConnectError(error);
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("connect_error", handleConnectError);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
  };
};
