import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
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
  TypingIndicator,
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

  // Socket Integration
  const { isTyping } = useMessageSocket(
    socket,
    chatGroupId,
    clientId,
    setMessages,
    shouldAutoScroll,
    flatListRef,
  );

  // Send Message
  const { sendMessage: sendMessageViaSocket, sending } = useSendMessage(
    socket,
    chatGroupId,
    clientId,
    setMessages,
    shouldAutoScroll,
    flatListRef,
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
      await sendMessageViaSocket(department.dept_name, newChatGroupId);
    }
  };

  // Handle send message
  const handleSendMessage = async (text = null) => {
    const content = text ?? inputMessage.trim();
    if (!content || !chatGroupId) return;

    await sendMessageViaSocket(content);
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

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}

            {/* Input Bar */}
            <MessageInput
              value={inputMessage}
              onChangeText={setInputMessage}
              onSend={handleSendMessage}
              onOpenCannedMessages={() => setShowCannedMessages(true)}
              disabled={!chatGroupId || sending}
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
