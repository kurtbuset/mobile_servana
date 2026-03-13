/**
 * Socket Connection Lifecycle
 */

export const setupConnectionEvents = (socket) => {
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt #${attemptNumber}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Reconnection failed after all attempts");
  });
};

/**
 * Register connection event listeners with callbacks
 * For components that need to react to connection changes
 */
export const registerConnectionEvents = (socket, callbacks = {}) => {
  const { onConnect, onDisconnect, onConnectError } = callbacks;

  const handleConnect = () => {
    console.log("✅ Socket connected:", socket.id);
    if (onConnect) onConnect(socket.id);
  };

  const handleDisconnect = (reason) => {
    console.log("❌ Socket disconnected:", reason);
    if (onDisconnect) onDisconnect(reason);
  };

  const handleConnectError = (error) => {
    console.error("❌ Socket connection error:", error.message);
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
