import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Feather from 'react-native-vector-icons/Feather';
import { selectClient } from "../../store/slices/profile";
import { useSocket } from "../../contexts";
import {
  MessageHeader,
  MessageList,
  MessageInput,
  CannedMessagesModal,
  DepartmentSelector,
  EndChatModal,
} from "../../features/messaging/components";
import {
  useMessageHistory,
  useMessageSocket,
  useSendMessage,
  useChatGroup,
  useDepartments,
  useEndChat,
} from "../../features/messaging/hooks";
import { formatChatStats } from "../../features/messaging/utils/chatStats";

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

  // Persistent messages that NEVER get cleared
  const [persistentMessages, setPersistentMessages] = useState([]);

  // Chat Group Management
  const {
    chatGroupId,
    isLoadingChatGroup,
    initializeChatGroup,
    createChatGroupWithDepartment,
    resetChatGroup,
  } = useChatGroup(clientId);

  // Departments (for initial selection)
  const { departments, loadDepartments } = useDepartments();

  // Message History with Pagination - but we'll override its messages
  const {
    messages: historyMessages,
    setMessages: setHistoryMessages,
    isLoadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    shouldAutoScroll,
    setShouldAutoScroll,
  } = useMessageHistory(chatGroupId, flatListRef);

  // Sync history messages with persistent messages
  useEffect(() => {
    if (historyMessages.length > 0) {
      setPersistentMessages(prev => {
        // Merge new messages with existing ones, avoiding duplicates
        const existingIds = new Set(prev.map(m => m.id));
        // Filter out date separators and only keep actual messages
        const actualMessages = historyMessages.filter(m => m.type !== 'date' && !existingIds.has(m.id));
        return [...prev, ...actualMessages];
      });
    }
  }, [historyMessages]);

  // Use persistent messages instead of history messages
  const messages = persistentMessages;

  // Debug persistent messages
  useEffect(() => {
    console.log('📱 Persistent messages updated:', persistentMessages.length, persistentMessages);
  }, [persistentMessages]);

  // Socket Integration - use persistent messages
  const { isTyping, typingAgentName, typingAgentImage } = useMessageSocket(
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
    setPersistentMessages, // Use persistent messages setter
    shouldAutoScroll,
    flatListRef,
  );

  // Send Message - use persistent messages
  // Send Message - Simplified to only handle socket emission
  const { sendMessage: sendMessageViaSocket, sending } = useSendMessage(
    socket,
    chatGroupId,
    clientId,
    setPersistentMessages, // Use persistent messages setter
    shouldAutoScroll,
    flatListRef,
  );

  // End Chat functionality
  const {
    isLoading: isEndingChat,
    showEndChatModal,
    handleEndChat,
    showEndChatConfirmation,
    hideEndChatModal,
  } = useEndChat(chatGroupId, (response, feedbackData) => {
    // Handle successful chat end - keep everything continuous
    console.log('Chat ended successfully:', response);
    
    // Add a system message to indicate the chat session ended
    const endMessage = {
      id: `end_${Date.now()}`,
      sender: "system",
      content: "Chat session ended. You can continue with a new inquiry below.",
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    // Add the end message to persistent messages
    setPersistentMessages(prev => [...prev, endMessage]);
    
    // Reset only the chat group ID to allow new department selection
    // But DON'T clear messages - they should remain visible
    resetChatGroup();
    
    // Load departments for potential new inquiry
    loadDepartments();
  });

  // Initialize chat on mount
  useEffect(() => {
    if (!clientId) return;

    const init = async () => {
      const hasExistingChat = await initializeChatGroup();
      
      if (!hasExistingChat) {
        // No existing chat, load departments for selection
        console.log('Loading departments...');
        await loadDepartments();
      }
    };

    init();
  }, [clientId]);

  // Debug departments
  useEffect(() => {
    console.log('Departments updated:', departments);
  }, [departments]);

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
      // Add a system message to show new department inquiry
      const newInquiryMessage = {
        id: `new_inquiry_${Date.now()}`,
        sender: "system",
        content: `New inquiry started with ${department.dept_name} department.`,
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setPersistentMessages(prev => [...prev, newInquiryMessage]);
      
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

  // Handle end chat button press
  const handleEndChatPress = () => {
    showEndChatConfirmation();
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
              onEndChat={handleEndChatPress}
              isConnected={socket?.connected}
              chatStatus={chatGroupId ? 'active' : 'ready'}
              departmentName={null} // Remove department name to keep it simple
              showEndChatButton={!!chatGroupId}
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

            {/* Message List - Always show if there are messages */}
            {messages.length > 0 && (
              <MessageList
                messages={messages}
                flatListRef={flatListRef}
                onScroll={handleScroll}
                isLoadingMessages={isLoadingMessages}
                hasMoreMessages={hasMoreMessages}
                isTyping={isTyping}
                typingAgentName={typingAgentName}
                typingAgentImage={typingAgentImage}
              />
            )}

            {/* Department Selection - Show when no active chat (for new inquiry) */}
            {!isLoadingChatGroup && !chatGroupId && (
              <View style={styles.departmentSelectorContainer}>
                <Text style={styles.newInquiryText}>
                  Select department for your new inquiry:
                </Text>
                {departments.length > 0 ? (
                  <View style={styles.departmentButtonsContainer}>
                    {departments.map((department) => (
                      <TouchableOpacity
                        key={department.dept_id}
                        style={styles.departmentButton}
                        onPress={() => handleDepartmentSelect(department)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.departmentButtonText}>
                          {department.dept_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.loadingDepartments}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.loadingDepartmentsText}>
                      Loading departments...
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Floating Chat History Button (only when in active chat with messages) */}
            {/* Removed as requested by user */}

            {/* Loading Indicator */}
            {isLoadingChatGroup && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>
                  Loading your conversation...
                </Text>
              </View>
            )}

            {/* Input Bar - Only show when chat is active */}
            {chatGroupId && (
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
            )}

            {/* Canned Messages Modal */}
            <CannedMessagesModal
              visible={showCannedMessages}
              onClose={() => setShowCannedMessages(false)}
              onSelectMessage={(message) => {
                handleSendMessage(message);
                setShowCannedMessages(false);
              }}
            />

            {/* End Chat Modal */}
            <EndChatModal
              visible={showEndChatModal}
              onClose={hideEndChatModal}
              onConfirmEndChat={handleEndChat}
              chatDuration={messages.length > 0 ? formatChatStats(messages, clientId).duration : null}
              messageCount={messages.length}
              isLoading={isEndingChat}
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
  departmentSelectorContainer: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 20,
  },
  newInquiryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  departmentButtonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  departmentButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  departmentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingDepartments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingDepartmentsText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
});
