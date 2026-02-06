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
  Keyboard,
} from "react-native";
import { useState, useRef, useEffect, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useSelector } from "react-redux";
import axios from "axios";
import { SocketProvider, SocketContext } from "../SocketProvider";
import useSecureToken from "../hooks/useSecureToken";

import API_URL from '../config/api';

const Messages = () => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const clientId = useSelector((state) => state.client.data?.client_id);
  const { token, isLoading: tokenLoading } = useSecureToken(); // Get token from SecureStorage, not Redux
  const [departments, setDepartments] = useState([]);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [isLoadingChatGroup, setIsLoadingChatGroup] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const flatListRef = useRef();

  // Handle keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
    if (!chatGroupId || !socket) return;

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

    // Listen for typing events
    socket.on('userTyping', (data) => {
      if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
        console.log('Agent is typing...');
        setIsTyping(true);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to hide typing indicator after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    socket.on('userStoppedTyping', (data) => {
      if (data.chatGroupId === chatGroupId && data.userType !== 'client') {
        console.log('Agent stopped typing');
        
        // Clear timeout and hide immediately
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        setIsTyping(false);
      }
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
  }, [chatGroupId, clientId, socket]);

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
      // Wait for token to load
      if (tokenLoading) {
        console.log('⏳ Token still loading...');
        return;
      }

      if (!token) {
        console.log('No token available, user needs to login');
        return;
      }

      // Display token in console
      console.log("🔐 Token from SecureStorage in Messages:", token);

      // Validate that we have the correct client context
      if (!clientId) {
        console.log('No client ID available, redirecting to login');
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
  }, [token, clientId, tokenLoading]); // Added tokenLoading to dependencies

  const sendMessageWithGroupId = async (text, groupId) => {
    if (!text || !token || !groupId || !socket) return;

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

    if (!content || !token || !chatGroupId || !socket) return;

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
      
      // Dismiss keyboard after sending
      Keyboard.dismiss();

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

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

  const renderMessage = ({ item, index }) => {
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
    const isAgent = item.sender === "admin";
    
    // Check if next message is also from agent (to determine if we should show avatar)
    const nextMessage = messages[index + 1];
    const isLastInGroup = !nextMessage || nextMessage.type === 'date' || nextMessage.sender !== item.sender;
    const showAvatar = isAgent && isLastInGroup;
    
    return (
      <View
        style={[
          styles.messageContainer,
          { alignSelf: isAgent ? "flex-start" : "flex-end" },
        ]}
      >
        {/* Agent Avatar - only show for last message in consecutive agent messages */}
        {isAgent && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <View style={styles.avatar}>
                <Feather name="user" size={18} color="#7C3AED" />
              </View>
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}
        
        {/* Message Bubble */}
        <View
          style={[
            styles.messageBubble,
            isAgent ? styles.adminBubble : styles.userBubble,
          ]}
        >
          <Text style={[
            styles.messageText,
            isAgent ? styles.adminText : styles.userText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timeText,
            isAgent ? styles.adminTimeText : styles.userTimeText
          ]}>
            {item.displayTime}
          </Text>
        </View>
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Feather name="arrow-left" size={24} color="#1F2937" />
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
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      {/* Modal Header */}
                      <View style={styles.modalHeader}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Quick Messages</Text>
                        <Text style={styles.modalSubtitle}>Select a message to send</Text>
                      </View>

                      {/* Messages List */}
                      <FlatList
                        data={cannedMessages}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity
                            onPress={() => {
                              sendMessage(item);
                              setShowCannedMessages(false);
                            }}
                            style={[
                              styles.cannedMessageItem,
                              index === cannedMessages.length - 1 && styles.cannedMessageItemLast
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={styles.cannedMessageIcon}>
                              <Feather name="message-square" size={20} color="#7C3AED" />
                            </View>
                            <Text style={styles.cannedMessageText}>{item}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />

                      {/* Close Button */}
                      <TouchableOpacity
                        onPress={() => setShowCannedMessages(false)}
                        style={styles.modalCloseButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalCloseButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
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
            <View style={styles.inputBar}>
              <TouchableOpacity 
                onPress={() => setShowCannedMessages(true)}
                disabled={!chatGroupId}
                style={styles.menuButton}
                activeOpacity={0.7}
              >
                <Feather
                  name="menu"
                  size={22}
                  color={chatGroupId ? "#7C3AED" : "#D1D5DB"}
                />
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                style={[styles.input, !chatGroupId && styles.inputDisabled]}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={1000}
                editable={!!chatGroupId}
                returnKeyType="default"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  if (inputMessage.trim() && chatGroupId) {
                    sendMessage();
                  }
                }}
              />
              <TouchableOpacity 
                onPress={() => sendMessage()}
                disabled={!chatGroupId || !inputMessage.trim()}
                style={[
                  styles.sendButton,
                  (!chatGroupId || !inputMessage.trim()) && styles.sendButtonDisabled
                ]}
                activeOpacity={0.7}
              >
                <Feather 
                  name="send" 
                  size={20} 
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default function MessagesWithSocket() {
  return (
    <SocketProvider>
      <Messages />
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  endChatText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  promptText: {
    color: "#374151",
    fontSize: 16,
    marginBottom: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  optionButton: {
    borderColor: "#7C3AED",
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 6,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    color: "#7C3AED",
    fontSize: 15,
    fontWeight: "600",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
  },
  adminText: {
    color: "#1F2937",
  },
  timeText: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 3,
    fontWeight: "400",
  },
  userTimeText: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  adminTimeText: {
    color: "#9CA3AF",
  },
  dateSeparatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dateSeparatorText: {
    marginHorizontal: 16,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  selectedBubble: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: "75%",
    marginVertical: 4,
    borderBottomRightRadius: 4,
  },
  selectedBubbleText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    backgroundColor: "#F9FAFB",
    maxHeight: 100,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
    borderColor: "#E5E7EB",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  cannedMessageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cannedMessageItemLast: {
    borderBottomWidth: 0,
  },
  cannedMessageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cannedMessageText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 22,
  },
  modalCloseButton: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
