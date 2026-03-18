import React, { useEffect, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { useTheme } from "../../../contexts/ThemeContext";
import { getStatusDisplayText, getStatusColor } from "../utils/messageStatusHelpers";

/**
 * MessageStatus - Displays message delivery and read status as text
 * Similar to WhatsApp/Messenger status indicators
 * Mobile version of the web MessageStatus component
 */
function MessageStatus({ status, style = {} }) {
  const { isDark } = useTheme();

  const statusText = getStatusDisplayText(status);
  const statusColor = getStatusColor(status, isDark);
  return (
    <Text 
      style={[
        {
          fontSize: 10,
          fontWeight: '500',
          color: statusColor,
        },
        style
      ]}
    >
      {statusText}
    </Text>
  );
}

/**
 * MessageList Component
 * Renders messages in a FlatList with typing indicator as footer
 * This ensures typing indicator pushes messages up like Messenger
 */
export const MessageList = ({
  messages,
  flatListRef,
  onScroll,
  isLoadingMessages,
  hasMoreMessages,
  isTyping = false,
  typingAgentName,
  typingAgentImage,
  latestUserMessageIndex = -1,
}) => {
  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && flatListRef?.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isTyping, flatListRef]);

  const renderItem = useCallback(({ item, index }) => {
    if (item.type === "date") {
      return <DateSeparator date={item.date} />;
    }

    const isLatestUserMessage = index === latestUserMessageIndex;
    return (
      <MessageBubble 
        message={item} 
        isUser={item.sender === "user"} 
        isLatestUserMessage={isLatestUserMessage}
        MessageStatus={MessageStatus}
      />
    );
  }, [latestUserMessageIndex]);

  const renderFooter = () => {
    if (isTyping) {
      return (
        <TypingIndicator
          agentImage={typingAgentImage}
          agentName={typingAgentName}
        />
      );
    }
    return null;
  };

  const renderHeader = () => {
    if (isLoadingMessages && hasMoreMessages) {
      return (
        <View style={styles.loadingHeader}>
          <ActivityIndicator size="small" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading more messages...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.messageList}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      style={styles.flatList}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  loadingHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: "#6A1B9A",
    fontSize: 14,
  },
});

export default MessageList;
