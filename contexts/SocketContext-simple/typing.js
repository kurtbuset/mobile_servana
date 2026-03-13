/**
 * Typing Indicators
 */

// ============= EMITTERS =============

export const emitTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Cannot emit typing - socket not connected");
    return false;
  }
  socket.emit("typing", data);
  return true;
};

export const emitStopTyping = (socket, data) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Cannot emit stop typing - socket not connected");
    return false;
  }
  socket.emit("stopTyping", data);
  return true;
};

// ============= EVENT LISTENERS =============

export const registerTypingEvents = (socket, callbacks = {}) => {
  const { onTyping, onStopTyping } = callbacks;

  const handleTyping = (data) => {
    console.log("👤 User typing:", data.userName);
    if (onTyping) onTyping(data);
  };

  const handleStopTyping = (data) => {
    console.log("👤 User stopped typing");
    if (onStopTyping) onStopTyping(data);
  };

  socket.on("typing", handleTyping);
  socket.on("stopTyping", handleStopTyping);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("stopTyping", handleStopTyping);
  };
};
