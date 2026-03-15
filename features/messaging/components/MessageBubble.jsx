import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Feather from "react-native-vector-icons/Feather";

/**
 * Message Bubble Component
 */
export const MessageBubble = ({ message, isUser }) => {
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.adminContainer,
      ]}
    >
      {/* Agent Avatar - Only for admin messages */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          {message.agentImage ? (
            <Image
              source={{ uri: message.agentImage }}
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
        <Text
          style={[styles.time, isUser ? styles.userTime : styles.adminTime]}
        >
          {message.displayTime}
        </Text>
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
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#6C5CE7",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
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
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  adminTime: {
    color: "#9CA3AF",
  },
});

export default MessageBubble;
