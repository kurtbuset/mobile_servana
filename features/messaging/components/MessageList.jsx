import React, { useEffect, useCallback, useRef } from "react";
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
import { getStatusDisplayText, getStatusColor } from "../utils/messageStatusHelpers";

/**
 * MessageStatus - Displays message delivery and read status as text
 */
function MessageStatus({ status, style = {} }) {
  const statusText = getStatusDisplayText(status);
  const statusColor = getStatusColor(status, true); // app uses dark theme
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
  shouldAutoScroll = true,
}) => {
  const prevContentHeightRef = useRef(0);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && flatListRef?.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [isTyping, flatListRef]);

  // Auto-scroll when content size grows
  const handleContentSizeChange = useCallback((width, height) => {
    if (height > prevContentHeightRef.current && shouldAutoScroll) {
      flatListRef?.current?.scrollToEnd({ animated: true });
    }
    prevContentHeightRef.current = height;
  }, [shouldAutoScroll, flatListRef]);

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

  const renderFooter = useCallback(() => {
    if (isTyping) {
      return (
        <TypingIndicator
          agentImage={typingAgentImage}
          agentName={typingAgentName}
        />
      );
    }
    return null;
  }, [isTyping, typingAgentImage, typingAgentName]);

  const renderHeader = useCallback(() => {
    if (isLoadingMessages && hasMoreMessages) {
      return (
        <View style={styles.loadingHeader}>
          <ActivityIndicator size="small" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading more messages...</Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMessages, hasMoreMessages]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.messageList}
      onScroll={onScroll}
      onContentSizeChange={handleContentSizeChange}
      scrollEventThrottle={16}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      style={styles.flatList}
      removeClippedSubviews={true}
      maxToRenderPerBatch={15}
      windowSize={10}
      initialNumToRender={20}
      updateCellsBatchingPeriod={50}
      keyboardDismissMode="on-drag"
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
