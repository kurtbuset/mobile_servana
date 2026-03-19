import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { selectClient } from "../../store/slices/profile";
import { useSocket } from "../../contexts";
import {
  MessageHeader,
  MessageList,
  MessageInput,
  CannedMessagesModal,
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
 * Maximum Performance Optimized Messages Screen
 */
const MessagesScreen = React.memo(() => {
  const navigation = useNavigation();
  const { socket } = useSocket();
  const client = useSelector(selectClient);
  
  // Memoize clientId to prevent hook re-runs
  const clientId = useMemo(() => client?.client_id, [client?.client_id]);

  // UI State - minimal state to prevent re-renders
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef(null);

  // Memoize all hook calls to prevent recreation
  const chatGroup = useChatGroup(clientId);
  const departments = useDepartments();
  const messageHistory = useMessageHistory(chatGroup.chatGroupId, flatListRef);
  
  // Extract values with memoization
  const {
    chatGroupId,
    isLoadingChatGroup,
    initializeChatGroup,
    createChatGroupWithDepartment,
    resetChatGroup,
  } = chatGroup;

  const { departments: departmentList, loadDepartments } = departments;
  
  const {
    messages: historyMessages,
    setMessages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    shouldAutoScroll,
    setShouldAutoScroll,
  } = messageHistory;

  // Socket integration - pass setMessages directly from messageHistory
  const socketHandlers = useMessageSocket(
    socket,
    chatGroupId,
    clientId,
    setMessages, // Use setMessages from messageHistory directly
    shouldAutoScroll,
    flatListRef,
  );

  const sendMessage = useSendMessage(socket, chatGroupId, clientId);

  // End chat with memoized callback
  const handleChatEnd = useCallback((response, feedbackData) => {
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
    
    setMessages(prev => [...prev, endMessage]);
    resetChatGroup();
    loadDepartments();
  }, [setMessages, resetChatGroup, loadDepartments]);

  const endChat = useEndChat(chatGroupId, handleChatEnd);

  // Initialize once with ref tracking
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current && clientId) {
      initRef.current = true;
      
      const init = async () => {
        const hasExisting = await initializeChatGroup();
        if (!hasExisting) {
          await loadDepartments();
        }
      };
      
      init();
    }
  }, [clientId, initializeChatGroup, loadDepartments]);

  // Memoized event handlers
  const handleSendMessage = useCallback(async (text = null) => {
    const content = text ?? inputMessage.trim();
    if (!content || !chatGroupId) return;

    const tempId = socketHandlers.addOptimisticMessage(content);
    
    try {
      const result = await sendMessage.sendMessage(content);
      if (!result.success) {
        socketHandlers.removeOptimisticMessage(tempId);
      }
    } catch (error) {
      socketHandlers.removeOptimisticMessage(tempId);
    }
    
    setInputMessage("");
    Keyboard.dismiss();
  }, [inputMessage, chatGroupId, socketHandlers, sendMessage]);

  const handleDepartmentSelect = useCallback(async (department) => {
    const newChatGroupId = await createChatGroupWithDepartment(department.dept_id);
    
    if (newChatGroupId) {
      const message = {
        id: `new_inquiry_${Date.now()}`,
        sender: "system",
        content: `New inquiry started with ${department.dept_name} department.`,
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages(prev => [...prev, message]);
      await sendMessage.sendMessage(department.dept_name, newChatGroupId);
    }
  }, [createChatGroupWithDepartment, setMessages, sendMessage]);

  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearTop = contentOffset.y <= 50;
    const isNearBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;

    setShouldAutoScroll(isNearBottom);

    if (isNearTop && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages, setShouldAutoScroll]);

  // Memoized computed values - use historyMessages directly
  const latestUserMessageIndex = useMemo(() => {
    for (let i = historyMessages.length - 1; i >= 0; i--) {
      if (historyMessages[i].type !== "date" && historyMessages[i].sender === "user") {
        return i;
      }
    }
    return -1;
  }, [historyMessages]);

  const chatDuration = useMemo(() => {
    return historyMessages.length > 0 ? 
      formatChatStats(historyMessages, clientId).duration : null;
  }, [historyMessages.length, clientId]);

  // Memoized component props
  const headerProps = useMemo(() => ({
    onBack: () => navigation.goBack(),
    onEndChat: () => endChat.showEndChatConfirmation(),
    isConnected: socket?.connected,
    chatStatus: chatGroupId ? 'active' : 'ready',
    showEndChatButton: !!chatGroupId,
  }), [navigation, endChat, socket?.connected, chatGroupId]);

  const listProps = useMemo(() => ({
    messages: historyMessages, // Use historyMessages directly
    flatListRef,
    onScroll: handleScroll,
    isLoadingMessages,
    hasMoreMessages,
    isTyping: socketHandlers.isTyping,
    typingAgentName: socketHandlers.typingAgentName,
    typingAgentImage: socketHandlers.typingAgentImage,
    latestUserMessageIndex,
  }), [
    historyMessages, // Use historyMessages directly
    handleScroll,
    isLoadingMessages,
    hasMoreMessages,
    socketHandlers.isTyping,
    socketHandlers.typingAgentName,
    socketHandlers.typingAgentImage,
    latestUserMessageIndex,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <MessageHeader {...headerProps} />
            <MessageList {...listProps} />

            {!isLoadingChatGroup && !chatGroupId && (
              <DepartmentSelector 
                departments={departmentList}
                onSelect={handleDepartmentSelect}
              />
            )}

            {isLoadingChatGroup && <LoadingIndicator />}
            
            {chatGroupId && (
              <MessageInput
                value={inputMessage}
                onChangeText={setInputMessage}
                onSend={handleSendMessage}
                onOpenCannedMessages={() => setShowCannedMessages(true)}
                disabled={!chatGroupId || sendMessage.sending}
                socket={socket}
                chatGroupId={chatGroupId}
                clientId={clientId}
                clientName={client?.prof_id?.prof_firstname || "Client"}
              />
            )}

            <CannedMessagesModal
              visible={showCannedMessages}
              onClose={() => setShowCannedMessages(false)}
              onSelectMessage={(message) => {
                handleSendMessage(message);
                setShowCannedMessages(false);
              }}
            />

            <EndChatModal
              visible={endChat.showEndChatModal}
              onClose={endChat.hideEndChatModal}
              onConfirmEndChat={endChat.handleEndChat}
              chatDuration={chatDuration}
              messageCount={historyMessages.length} // Use historyMessages directly
              isLoading={endChat.isLoading}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

// Optimized sub-components
const DepartmentSelector = React.memo(({ departments, onSelect }) => (
  <View style={styles.departmentContainer}>
    <Text style={styles.departmentTitle}>
      Select department for your new inquiry:
    </Text>
    {departments.length > 0 ? (
      <View style={styles.departmentButtons}>
        {departments.map((dept) => (
          <DepartmentButton key={dept.dept_id} department={dept} onPress={onSelect} />
        ))}
      </View>
    ) : (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading departments...</Text>
      </View>
    )}
  </View>
));

const DepartmentButton = React.memo(({ department, onPress }) => (
  <TouchableOpacity
    style={styles.departmentButton}
    onPress={() => onPress(department)}
    activeOpacity={0.7}
  >
    <Text style={styles.departmentButtonText}>{department.dept_name}</Text>
  </TouchableOpacity>
));

const LoadingIndicator = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6A1B9A" />
    <Text style={styles.loadingText}>Loading your conversation...</Text>
  </View>
));

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
  departmentContainer: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 20,
  },
  departmentTitle: {
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
  departmentButtons: {
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
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});

export default MessagesScreen;