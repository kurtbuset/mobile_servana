import logger from '../../../utils/logger';

import { useState } from "react";
import { sendMessage as sendMessageEmitter } from "../../../contexts/SocketContext";

/**
 * Hook for sending messages via socket using emitter functions
 * Socket event handling is centralized in useMessageSocket
 */
export const useSendMessage = (socket, chatGroupId, clientId) => {
  const [sending, setSending] = useState(false);

  const sendMessage = async (text, groupId = null) => {
    const targetGroupId = groupId || chatGroupId;
    if (!text || !socket || !targetGroupId) return { success: false };

    try {
      setSending(true);

      // Send via socket using emitter
      const success = sendMessageEmitter(socket, {
        chat_body: text,
        chat_group_id: targetGroupId,
        client_id: clientId,
      });

      if (!success) {
        logger.error("❌ Failed to send message - socket not connected");
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      logger.error("Error sending message:", error);
      return { success: false };
    } finally {
      setSending(false);
    }
  };

  return {
    sendMessage,
    sending,
  };
};

export default useSendMessage;
