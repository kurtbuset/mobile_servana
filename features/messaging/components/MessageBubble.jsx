import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Feather from "react-native-vector-icons/Feather";

/**
 * Message Bubble Component
 * Enhanced to show transfer messages and agent names (matches web implementation)
 */
const MessageBubbleComponent = ({ message, isUser, isLatestUserMessage = false, MessageStatus }) => {
  // Handle transfer/system messages
  if (message.message_type === 'transfer' || message.sender_type === 'system') {
    return (
      <View style={styles.transferContainer}>
        <View style={styles.transferLine} />
        <View style={styles.transferBubble}>
          <Feather name="arrow-right" size={12} color="#6C5CE7" style={styles.transferIcon} />
          <Text style={styles.transferText}>{message.content}</Text>
        </View>
        <View style={styles.transferLine} />
      </View>
    );
  }

  // Determine if this is an agent message
  const isAgent = message.sender_type === 'agent' || (!isUser && message.sender === 'admin');
  const showAgentName = isAgent && message.sender_name && message.sender_name !== 'Agent';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.adminContainer,
      ]}
    >
      {/* Agent Avatar - Only for admin/agent messages */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          {message.sender_image || message.agentImage ? (
            <Image
              source={{ uri: message.sender_image || message.agentImage }}
              style={styles.avatar}
              defaultSource={require("../../../assets/userblank.jpg")}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={16} color="#9CA3AF" />
            </View>
          )}
        </View>
      )}

      <View style={styles.messageColumn}>
        {/* Agent Name Label - Show above message bubble ONLY for agent messages */}
        {showAgentName && (
          <Text style={styles.agentNameLabel}>{message.sender_name}</Text>
        )}

        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.adminBubble]}
        >
          <Text
            style={[
              styles.content,
              isUser ? styles.userContent : styles.adminContent,
            ]}
          >
            {message.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text
              style={[styles.time, isUser ? styles.userTime : styles.adminTime]}
            >
              {message.displayTime}
            </Text>

            {/* Show status only on latest user message */}
            {isUser && isLatestUserMessage && message.status && (
              <MessageStatus
                status={message.status}
                style={styles.statusText}
              />
            )} 
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  adminContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  messageColumn: {
    maxWidth: "75%",
  },
  agentNameLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
    marginLeft: 4,
    fontWeight: "500",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#6C5CE7",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  userContent: {
    color: "#FFFFFF",
  },
  adminContent: {
    color: "#1F2937",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 6,
  },
  time: {
    fontSize: 10,
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  adminTime: {
    color: "#9CA3AF",
  },
  statusText: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Transfer message styles
  transferContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  transferLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(108, 92, 231, 0.2)",
  },
  transferBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 92, 231, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(108, 92, 231, 0.3)",
    marginHorizontal: 8,
  },
  transferIcon: {
    marginRight: 6,
  },
  transferText: {
    fontSize: 11,
    color: "#6C5CE7",
    fontWeight: "500",
  },
});

// Memoize the component to prevent unnecessary re-renders
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these specific props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.displayTime === nextProps.message.displayTime &&
    prevProps.isUser === nextProps.isUser &&
    prevProps.isLatestUserMessage === nextProps.isLatestUserMessage
  );
});

export default MessageBubble;
