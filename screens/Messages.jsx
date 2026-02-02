import {
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useSelector } from "react-redux";
import axios from "axios";
import socket from "../socket";
import useSecureToken from "../hooks/useSecureToken";

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://10.0.2.2:5000';

const Messages = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const clientId = useSelector((state) => state.client.data?.client_id);
  const { token } = useSecureToken(); // Get token from SecureStorage, not Redux
  const [departments, setDepartments] = useState([]);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [isLoadingChatGroup, setIsLoadingChatGroup] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const flatListRef = useRef();

  // Helper function to add date separators to messages
  const addDateSeparators = (messageList) => {
    // Filter out any existing date separators first
    const cleanMessages = messageList.filter(m => m.type !== 'date');
    
    const messagesWithDates = [];
    let lastDate = null;

    cleanMessages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp).toDateString();
      
      if (msgDate !== lastDate) {
        messagesWithDates.push({
          id: `date-${msgDate}-${Date.now()}`, // Add timestamp to ensure uniqueness
          type: 'date',
          date: msgDate,
        });
        lastDate = msgDate;
      }
      
      messagesWithDates.push(msg);
    });

    return messagesWithDates;
  };

  // Load messages with pagination
  const loadMessages = async (chatGroupId, before = null, append = false) => {
    if (isLoadingMessages) return;
    
    try {
      setIsLoadingMessages(true);
      
      let url = `${API_URL}/messages/group/${chatGroupId}?limit=10`;
      if (before) {
        url += `&before=${before}`;
      }

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Map messages to UI format with unique IDs
      const mappedMessages = data.messages.map((m, index) => ({
        id: m.chat_id ? `msg-${m.chat_id}` : `temp-${Date.now()}-${index}`, // Ensure unique ID
        sender: m.client_id ? "user" : "admin",
        content: m.chat_body,
        timestamp: m.chat_created_at,
        displayTime: new Date(m.chat_created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      if (append) {
        // Store current scroll position before adding messages
        const currentScrollOffset = flatListRef.current?._listRef?._scrollMetrics?.offset || 0;
        
        // Prepend older messages (for scroll-to-top loading)
        setMessages(prev => {
          const messagesOnly = prev.filter(m => m.type !== 'date');
          
          // Remove any duplicate messages by ID
          const existingIds = new Set(messagesOnly.map(m => m.id));
          const newUniqueMessages = mappedMessages.filter(m => !existingIds.has(m.id));
          
          const combined = [...newUniqueMessages, ...messagesOnly];
          return addDateSeparators(combined);
        });
        
        // Maintain scroll position after messages are added
        setTimeout(() => {
          if (flatListRef.current && mappedMessages.length > 0) {
            // Calculate new scroll position to maintain user's view
            const messageHeight = 60; // Approximate height per message
            const newOffset = currentScrollOffset + (mappedMessages.length * messageHeight);
            
            flatListRef.current.scrollToOffset({
              offset: newOffset,
              animated: false
            });
          }
        }, 100);
        
        console.log(`Loaded ${mappedMessages.length} older messages`);
      } else {
        // Initial load - scroll to bottom
        setMessages(addDateSeparators(mappedMessages));
        
        // Scroll to bottom for initial load
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }

      // Update pagination state
      setHasMoreMessages(data.hasMore);
      if (mappedMessages.length > 0) {
        setOldestMessageTimestamp(mappedMessages[0].timestamp);
      }

    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load more messages (pagination) - triggered when scrolling to top
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMessages || !oldestMessageTimestamp || !chatGroupId) {
      return;
    }
    
    console.log('Auto-loading more messages...');
    await loadMessages(chatGroupId, oldestMessageTimestamp, true);
  };

  // Handle scroll events to detect when user reaches the top
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Check if user scrolled to the top (within 50px threshold)
    const isNearTop = contentOffset.y <= 50;
    
    // Check if user is at the bottom (within 50px threshold)
    const isNearBottom = contentOffset.y >= (contentSize.height - layoutMeasurement.height - 50);
    
    // Update auto-scroll behavior based on user position
    setShouldAutoScroll(isNearBottom);
    
    if (isNearTop && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages();
    }
  };

  // Messages.js - Add these changes

  useEffect(() => {
    if (!chatGroupId) return;

    // Connect socket
    socket.connect();
    console.log("Socket connecting...");

    // Emit event to let server know mobile connected
    // socket.emit('mobileConnected', { chatGroupId });

    // Join a room specific to this chat group with client info
    console.log('chatGroupId in messages.jsx: ', chatGroupId)
    socket.emit('joinChatGroup', {
      groupId: chatGroupId,
      userType: 'client',
      userId: clientId
    });

    // Listen for incoming messages (unified handler)
    socket.on('receiveMessage', (message) => {
      console.log('📨 Received message:', {
        chat_id: message.chat_id,
        sender_type: message.sender_type,
        from_current_client: message.client_id === clientId
      });

      // Skip messages sent by current client (avoid duplicates)
      if (message.client_id === clientId) {
        console.log('⏭️ Skipping own message to avoid duplicate');
        return;
      }

      const newMessage = {
        id: message.chat_id ? `msg-${message.chat_id}` : `temp-${Date.now()}`,
        sender: message.sender_type === 'client' ? "user" : "admin",
        content: message.chat_body,
        timestamp: message.chat_created_at,
        displayTime: new Date(message.chat_created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      setMessages((prev) => {
        // Remove date separators and check for duplicates
        const messagesOnly = prev.filter(m => m.type !== 'date');
        
        // Check if message already exists
        const exists = messagesOnly.some(m => m.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping duplicate');
          return addDateSeparators(messagesOnly);
        }
        
        // Add new message at end (chronological order)
        const updatedMessages = [...messagesOnly, newMessage];
        return addDateSeparators(updatedMessages);
      });
      
      // Scroll to bottom only if user is at bottom
      if (shouldAutoScroll) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // Listen for message delivery confirmation
    socket.on('messageDelivered', (data) => {
      console.log('✅ Message delivered:', data.chat_id);
      // Could update UI to show delivery status if needed
    });

    // Listen for message errors
    socket.on('messageError', (error) => {
      console.error('❌ Message error:', error);
      // Could show error message to user
    });

    // Listen for user join/leave events
    socket.on('userJoined', (data) => {
      console.log(`${data.userType} joined chat_group ${data.chatGroupId}`);
    });

    socket.on('userLeft', (data) => {
      console.log(`${data.userType} left chat_group ${data.chatGroupId}`);
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Cleanup
    return () => {
      socket.off('receiveMessage');
      socket.off('messageDelivered');
      socket.off('messageError');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
      console.log("🔌 Socket disconnected and cleaned up");
    };
  }, [chatGroupId, clientId]);

  const cannedMessages = [
    "I have an issue for the you know...?",
    "Please provide your account number.",
  ];

  const handleOptionSelect = async (department) => {
    setSelectedOption(department.dept_name);

    try {
      // Create new chat group with selected department
      const { data } = await axios.post(
        `${API_URL}/messages/group/create`,
        { department: department.dept_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChatGroupId(data.chat_group_id);

      // Send initial message with department name
      await sendMessageWithGroupId(department.dept_name, data.chat_group_id);
    } catch (error) {
      console.error("Error creating chat group:", error);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (!token) {
        console.log('No token available, user needs to login');
        return;
      }

      // Validate that we have the correct client context
      if (!clientId) {
        console.error('No client ID available, session may be corrupted');
        return;
      }

      try {
        setIsLoadingChatGroup(true);

        // Try to get latest chat group
        const { data: chatGroup } = await axios.get(`${API_URL}/messages/latest`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Chat group found - load messages with pagination
        setChatGroupId(chatGroup.chat_group_id);
        await loadMessages(chatGroup.chat_group_id);
        setSelectedOption("existing");
      } catch (error) {
        // No chat group found - fetch departments for selection
        console.log("No existing chat group, fetching departments", error.response?.status);

        try {
          const { data } = await axios.get(`${API_URL}/department/active`);
          setDepartments(data.departments || []);
        } catch (deptError) {
          console.error("Error fetching departments:", deptError);
        }
      } finally {
        setIsLoadingChatGroup(false);
      }
    };

    initializeChat();
  }, [token, clientId]); // Added clientId to dependencies

  const sendMessageWithGroupId = async (text, groupId) => {
    if (!text || !token || !groupId) return;

    try {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const now = new Date();
      const optimisticMessage = {
        id: tempId,
        sender: "user",
        content: text,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPending: true
      };
      
      setMessages((prev) => {
        const messagesOnly = prev.filter(m => m.type !== 'date');
        const updatedMessages = [...messagesOnly, optimisticMessage];
        return addDateSeparators(updatedMessages);
      });

      // Scroll to bottom
      if (shouldAutoScroll) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Send via socket only (unified approach)
      socket.emit('sendMessage', {
        chat_body: text,
        chat_group_id: groupId,
        client_id: clientId,
      });

      // Listen for delivery confirmation to update optimistic message
      const handleDelivery = (data) => {
        if (data.chat_group_id === groupId) {
          setMessages((prev) => {
            const messagesOnly = prev.filter(m => m.type !== 'date');
            const updatedMessages = messagesOnly.map(m => 
              m.id === tempId 
                ? { ...m, id: `msg-${data.chat_id}`, isPending: false }
                : m
            );
            return addDateSeparators(updatedMessages);
          });
          socket.off('messageDelivered', handleDelivery);
        }
      };

      socket.on('messageDelivered', handleDelivery);

      // Handle errors
      const handleError = (error) => {
        if (error.chat_group_id === groupId) {
          console.error('❌ Failed to send message:', error);
          // Remove optimistic message on error
          setMessages((prev) => {
            const messagesOnly = prev.filter(m => m.type !== 'date' && m.id !== tempId);
            return addDateSeparators(messagesOnly);
          });
          socket.off('messageError', handleError);
        }
      };

      socket.on('messageError', handleError);

    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  const sendMessage = async (text = null) => {
    const content = text ?? inputMessage.trim();

    if (!content || !token || !chatGroupId) return;

    try {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const now = new Date();
      const optimisticMessage = {
        id: tempId,
        sender: "user",
        content: content,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPending: true
      };
      
      setMessages((prev) => {
        const messagesOnly = prev.filter(m => m.type !== 'date');
        const updatedMessages = [...messagesOnly, optimisticMessage];
        return addDateSeparators(updatedMessages);
      });
      
      setInputMessage("");

      // Scroll to bottom
      if (shouldAutoScroll) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Send via socket only (unified approach)
      socket.emit('sendMessage', {
        chat_body: content,
        chat_group_id: chatGroupId,
        client_id: clientId,
      });

      // Listen for delivery confirmation to update optimistic message
      const handleDelivery = (data) => {
        if (data.chat_group_id === chatGroupId) {
          setMessages((prev) => {
            const messagesOnly = prev.filter(m => m.type !== 'date');
            const updatedMessages = messagesOnly.map(m => 
              m.id === tempId 
                ? { ...m, id: `msg-${data.chat_id}`, isPending: false }
                : m
            );
            return addDateSeparators(updatedMessages);
          });
          socket.off('messageDelivered', handleDelivery);
        }
      };

      socket.on('messageDelivered', handleDelivery);

      // Handle errors
      const handleError = (error) => {
        if (error.chat_group_id === chatGroupId) {
          console.error('❌ Failed to send message:', error);
          // Remove optimistic message on error and restore input
          setMessages((prev) => {
            const messagesOnly = prev.filter(m => m.type !== 'date' && m.id !== tempId);
            return addDateSeparators(messagesOnly);
          });
          setInputMessage(content); // Restore message content
          socket.off('messageError', handleError);
        }
      };

      socket.on('messageError', handleError);

    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const renderMessage = ({ item }) => {
    // Render date separator
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparatorContainer}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{formatDateLabel(item.date)}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }

    // Render message bubble
    return (
      <View
        style={[
          styles.messageBubble,
          item.sender === "user" ? styles.userBubble : styles.adminBubble,
          { alignSelf: item.sender === "user" ? "flex-end" : "flex-start" },
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.adminText
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.timeText,
          item.sender === "user" ? styles.userTimeText : styles.adminTimeText
        ]}>
          {item.displayTime}
        </Text>
      </View>
    );
  };

  // useEffect(() => {  
  //   const fetchMessages = async () => {
  //     try {
  //       const { data } = await axios.get(`${API_URL}/chat/${clientId}`);
  //       const mappedMessages = data.messages.map(m => ({
  //         id: m.chat_id,
  //         sender: m.client_id ? "user" : "admin",
  //         content: m.chat_body,
  //         timestamp: m.chat_created_at,
  //         displayTime: new Date(m.chat_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  //       }));
  //       setMessages(mappedMessages.reverse()); // oldest -> newest
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   if (clientId) fetchMessages();
  // }, [clientId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(255,0,0,0.1)" }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Feather name="arrow-left" size={25} color="#6A1B9A" />
              <Text style={styles.headerText}>Chats</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
              <Text style={styles.endChatText}>End chat</Text>
            </TouchableOpacity>
          </View>

          {/* Message List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 20,
              paddingTop: 10,
              ...(messages.length === 0 && !selectedOption
                ? { flexGrow: 1, justifyContent: "flex-end" }
                : {}),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            ListHeaderComponent={() => (
              hasMoreMessages && isLoadingMessages ? (
                <View style={{ 
                  alignItems: 'center',
                  paddingVertical: 15,
                  marginBottom: 10
                }}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={{ 
                    color: '#666', 
                    fontSize: 12, 
                    marginTop: 8,
                    fontWeight: '500'
                  }}>
                    Loading older messages...
                  </Text>
                </View>
              ) : hasMoreMessages ? (
                <View style={{ 
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginBottom: 10
                }}>
                  <Text style={{ 
                    color: '#999', 
                    fontSize: 11, 
                    fontWeight: '400'
                  }}>
                    Scroll up to load older messages
                  </Text>
                </View>
              ) : null
            )}
          />
          {/* Canned Messages Modal */}
          <Modal
            visible={showCannedMessages}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCannedMessages(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowCannedMessages(false)}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    maxHeight: "50%",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
                    Select a message
                  </Text>

                  <FlatList
                    data={cannedMessages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          sendMessage(item); // send selected message
                          setShowCannedMessages(false); // close modal
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          borderBottomWidth: 1,
                          borderColor: "#eee",
                        }}
                      >
                        <Text style={{ fontSize: 15, color: "#000" }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>


          {/* Department selection for initial contact */}
          {!isLoadingChatGroup && !chatGroupId && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              {departments.length > 0 ? (
                <>
                  <Text style={styles.promptText}>
                    To connect you with the right support team...
                  </Text>
                  {departments.map((department) => (
                    <TouchableOpacity
                      key={department.dept_id}
                      style={styles.optionButton}
                      onPress={() => handleOptionSelect(department)}
                    >
                      <Text style={styles.optionText}>{department.dept_name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <Text style={styles.promptText}>Loading departments...</Text>
              )}
            </View>
          )}

          {/* Loading indicator */}
          {isLoadingChatGroup && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6A1B9A" />
              <Text style={styles.loadingText}>Loading your conversation...</Text>
            </View>
          )}

          {/* Input Bar */}
          {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <View style={styles.inputBar}>
            <TouchableOpacity 
              onPress={() => setShowCannedMessages(true)}
              disabled={!chatGroupId}
            >
              <Feather
                name="menu"
                size={24}
                color={chatGroupId ? "#6B46C1" : "#ccc"}
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, !chatGroupId && styles.inputDisabled]}
              placeholder="Message"
              placeholderTextColor="#aaa"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              editable={!!chatGroupId}
            />
            <TouchableOpacity 
              onPress={() => sendMessage()}
              disabled={!chatGroupId}
            >
              <Feather name="send" size={24} color={chatGroupId ? "#2d2d2fff" : "#ccc"} />
            </TouchableOpacity>
          </View>
          {/* </TouchableWithoutFeedback> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerText: {
    color: "#6A1B9A",
    fontSize: 20,
    marginLeft: 8,
  },
  endChatText: {
    color: "red",
    fontSize: 16,
  },
  promptText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 12,
  },
  optionButton: {
    borderColor: "#6A1B9A",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    alignSelf: "flex-start",
  },
  optionText: {
    color: "#000",
    fontSize: 16,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: "70%",
    marginVertical: 8,
  },
  userBubble: {
    backgroundColor: "#6A1B9A",
  },
  adminBubble: {
    backgroundColor: "#E8E8E8",
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#fff",
  },
  adminText: {
    color: "#000",
  },
  timeText: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },
  userTimeText: {
    color: "#ddd",
  },
  adminTimeText: {
    color: "#666",
  },
  dateSeparatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dateSeparatorText: {
    marginHorizontal: 16,
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedBubble: {
    backgroundColor: "#6A1B9A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: "70%",
    marginVertical: 8,
  },
  selectedBubbleText: {
    color: "#fff",
    fontSize: 16,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  inputDisabled: {
    backgroundColor: "#e0e0e0",
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    color: "#6A1B9A",
    fontSize: 16,
    fontWeight: "500",
  },
});
