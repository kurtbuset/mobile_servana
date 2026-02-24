import { useState } from "react";
import { messageAPI } from "../../../shared/api";

/**
 * Hook for managing chat group initialization and creation
 * Token is automatically included in API requests via interceptor
 */
export const useChatGroup = (clientId) => {
  const [chatGroupId, setChatGroupId] = useState(null);
  const [isLoadingChatGroup, setIsLoadingChatGroup] = useState(true);

  const initializeChatGroup = async () => {
    if (!clientId) return false;

    try {
      setIsLoadingChatGroup(true);

      // Try to get latest chat group using centralized API
      const chatGroup = await messageAPI.getLatestChatGroup();

      setChatGroupId(chatGroup.chat_group_id);
      return true; // Has existing chat
    } catch (error) {
      console.log("No existing chat group found");
      return false; // No existing chat
    } finally {
      setIsLoadingChatGroup(false);
    }
  };

  const createChatGroupWithDepartment = async (departmentId) => {
    try {
      // Use centralized API
      const data = await messageAPI.createChatGroup({
        department: departmentId,
      });

      setChatGroupId(data.chat_group_id);
      return data.chat_group_id;
    } catch (error) {
      console.error("Error creating chat group:", error);
      return null;
    }
  };

  return {
    chatGroupId,
    isLoadingChatGroup,
    initializeChatGroup,
    createChatGroupWithDepartment,
  };
};

export default useChatGroup;
