import React, { useEffect } from "react";
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
}) => {
  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && flatListRef?.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isTyping, flatListRef]);

  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return <DateSeparator date={item.date} />;
    }

    return <MessageBubble message={item} isUser={item.sender === "user"} />;
  };

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
