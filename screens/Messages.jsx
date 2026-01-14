import {
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

const Messages = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCannedMessages, setShowCannedMessages] = useState(false);

  const flatListRef = useRef();

  const options = ["Billing", "Customer Service", "Sales"];
  const cannedMessages = [
    "Can you describe the issue in detail?",
    "Please provide your account number.",
    "Let me check that for you.",
    "Thank you for your patience.",
    "I will escalate this issue to our support team.",
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    sendMessage(option);
  };

  const sendMessage = (text) => {
    const content = text ?? inputMessage.trim();
    if (!content) return;

    const now = new Date();
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputMessage("");
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.selectedBubble,
        { alignSelf: item.sender === "user" ? "flex-end" : "flex-start" },
      ]}
    >
      <Text style={styles.selectedBubbleText}>{item.content}</Text>
      <Text style={styles.timeText}>{item.displayTime}</Text>
    </View>
  );

  useEffect(() => {
    console.log("Messages:", messages);
  }, [messages]);

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
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          {/* Options for initial selection */}
          {messages.length === 0 && !selectedOption && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              <Text style={styles.promptText}>
                To connect you with the right support team...
              </Text>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Bar */}
          {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <View style={styles.inputBar}>
            <TouchableOpacity onPress={() => setShowCannedMessages(true)}>
              <Feather
                name="menu"
                size={24}
                color="#6B46C1"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Message"
              placeholderTextColor="#aaa"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
            />
            <TouchableOpacity onPress={() => sendMessage()}>
              <Feather name="send" size={24} color="#6B46C1" />
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
  timeText: {
    color: "#ddd",
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
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
});
