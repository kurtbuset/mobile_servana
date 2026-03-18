import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectClient } from "../../store/slices/profile";
import { useSocket } from "../../contexts";
import {
  MessageHeader,
  MessageList,
  MessageInput,
  CannedMessagesModal,
  DepartmentSelector,
} from "../../features/messaging/components";
import {
  useMessageHistory,
  useMessageSocket,
  useSendMessage,
  useChatGroup,
  useDepartments,
} from "../../features/messaging/hooks";

/**
 * Messages Screen - Container Component
 * Complete refactored version with all legacy features
 * Token is automatically handled by API client interceptor
 */
export default function MessagesScreen() {
  const navigation = useNavigation();
  const { socket } = useSocket();
  const client = useSelector(selectClient);
  const clientId = client?.client_id;

  // UI State
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  // Chat Group Management
  const {
    chatGroupId,
    isLoadingChatGroup,
    initializeChatGroup,
    createChatGroupWithDepartment,
  } = useChatGroup(clientId);

  // Departments (for initial selection)
  const { departments, loadDepartments } = useDepartments();

  // Message History with Pagination
  const {
    messages,
    setMessages,
    isLoadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    shouldAutoScroll,
    setShouldAutoScroll,
  } = useMessageHistory(chatGroupId, flatListRef);

  // Socket Integration - Centralized socket event handling
  const { 
    isTyping, 
    typingAgentName, 
    typingAgentImage,
    addOptimisticMessage,
    removeOptimisticMessage 
  } = useMessageSocket(
    socket,
    chatGroupId,
    clientId,
    setMessages,
    shouldAutoScroll,
    flatListRef,
  );

  // Send Message - Simplified to only handle socket emission
  const { sendMessage: sendMessageViaSocket, sending } = useSendMessage(
    socket,
    chatGroupId,
    clientId,
  );

  // Initialize chat on mount
  useEffect(() => {
    if (!clientId) return;

    const init = async () => {
      const hasExistingChat = await initializeChatGroup();
      if (!hasExistingChat) {
        // No existing chat, load departments for selection
        await loadDepartments();
      }
    };

    init();
  }, [clientId]);

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Handle department selection
  const handleDepartmentSelect = async (department) => {
    const newChatGroupId = await createChatGroupWithDepartment(
      department.dept_id,
    );
    if (newChatGroupId) {
      // Send initial message with department name
      // Note: For department selection, we don't need optimistic UI since it's automatic
      await sendMessageViaSocket(department.dept_name, newChatGroupId);
    }
  };

  // Handle send message
  const handleSendMessage = async (text = null) => {
    const content = text ?? inputMessage.trim();
    if (!content || !chatGroupId) return;

    // Add optimistic message to UI
    const tempId = addOptimisticMessage(content);
    
    try {
      const result = await sendMessageViaSocket(content);
      if (!result.success) {
        // Remove optimistic message on failure
        removeOptimisticMessage(tempId);
      }
    } catch (error) {
      // Remove optimistic message on error
      removeOptimisticMessage(tempId);
    }
    
    setInputMessage("");
    Keyboard.dismiss();
  };

  // Handle scroll for pagination
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const isNearTop = contentOffset.y <= 50;
    const isNearBottom =
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;

    setShouldAutoScroll(isNearBottom);

    if (isNearTop && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages();
    }
  };

  // Handle end chat
  const handleEndChat = () => {
    navigation.navigate("Dashboard");
  };

  // Calculate latest user message index for status display
  // Only recalculate when messages array length changes or last message changes
  const latestUserMessageIndex = useMemo(() => {
    if (messages.length === 0) return -1;
    
    // Find the last message sent by user (excluding date separators)
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type !== "date" && messages[i].sender === "user") {
        return i;
      }
    }
    return -1;
  }, [messages.length, messages[messages.length - 1]?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <MessageHeader
              onBack={() => navigation.goBack()}
              onEndChat={handleEndChat}
            />

            {/* Message List */}
            <MessageList
              messages={messages}
              flatListRef={flatListRef}
              onScroll={handleScroll}
              isLoadingMessages={isLoadingMessages}
              hasMoreMessages={hasMoreMessages}
              isTyping={isTyping}
              typingAgentName={typingAgentName}
              typingAgentImage={typingAgentImage}
              latestUserMessageIndex={latestUserMessageIndex}
            />

            {/* Department Selection (if no chat group) */}
            {!isLoadingChatGroup && !chatGroupId && departments.length > 0 && (
              <DepartmentSelector
                departments={departments}
                onSelect={handleDepartmentSelect}
              />
            )}

            {/* Loading Indicator */}
            {isLoadingChatGroup && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>
                  Loading your conversation...
                </Text>
              </View>
            )}

            {/* Input Bar */}
            <MessageInput
              value={inputMessage}
              onChangeText={setInputMessage}
              onSend={handleSendMessage}
              onOpenCannedMessages={() => setShowCannedMessages(true)}
              disabled={!chatGroupId || sending}
              socket={socket}
              chatGroupId={chatGroupId}
              clientId={clientId}
              clientName={client?.prof_id?.prof_firstname || "Client"}
            />

            {/* Canned Messages Modal */}
            <CannedMessagesModal
              visible={showCannedMessages}
              onClose={() => setShowCannedMessages(false)}
              onSelectMessage={(message) => {
                handleSendMessage(message);
                setShowCannedMessages(false);
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "600",
  },
});
