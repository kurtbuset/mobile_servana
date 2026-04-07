import logger from '../../../utils/logger';

import { useState, useRef, useCallback } from "react";
import { messageAPI } from "../../../shared/api";

/**
 * Hook for managing chat group initialization and creation
 * Token is automatically included in API requests via interceptor
 */
export const useChatGroup = (clientId) => {
  const [chatGroupId, setChatGroupId] = useState(null);
  const [isLoadingChatGroup, setIsLoadingChatGroup] = useState(true);
  const [skipExistingChat, setSkipExistingChat] = useState(false);
  
  // Use ref to prevent callback recreation
  const clientIdRef = useRef(clientId);
  clientIdRef.current = clientId;

  const initializeChatGroup = useCallback(async () => {
    if (!clientIdRef.current) return false;

    try {
      setIsLoadingChatGroup(true);

      // If we're skipping existing chats (after end chat), don't load existing
      if (skipExistingChat) {
        setSkipExistingChat(false); // Reset flag
        return false;
      }

      // Try to get latest ACTIVE chat group using centralized API
      const chatGroup = await messageAPI.getLatestChatGroup();

      // Only load if the chat exists and is active
      if (chatGroup && chatGroup.chat_group_id) {
        setChatGroupId(chatGroup.chat_group_id);
        return true; // Has existing active chat
      }
      
      return false; // No active chat
    } catch (error) {
      logger.info("No existing active chat group found:", error.message);
      return false; // No existing chat
    } finally {
      setIsLoadingChatGroup(false);
    }
  }, [skipExistingChat]); // Only depend on skipExistingChat

  const createChatGroupWithDepartment = useCallback(async (departmentId) => {
    try {
      // Use centralized API
      const data = await messageAPI.createChatGroup({
        department: departmentId,
      });

      setChatGroupId(data.chat_group_id);
      return data.chat_group_id;
    } catch (error) {
      logger.error("Error creating chat group:", error);
      return null;
    }
  }, []);

  const resetChatGroup = useCallback(() => {
    setChatGroupId(null);
    setIsLoadingChatGroup(false);
    setSkipExistingChat(true); // Skip loading existing chats on next init
  }, []);

  return {
    chatGroupId,
    isLoadingChatGroup,
    initializeChatGroup,
    createChatGroupWithDepartment,
    resetChatGroup,
  };
};

export default useChatGroup;
