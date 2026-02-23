import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { formatDateLabel } from '../utils/messageHelpers';

/**
 * Message List Component with pagination support
 */
export const MessageList = ({
  messages,
  flatListRef,
  onScroll,
  isLoadingMessages,
  hasMoreMessages,
}) => {
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
    const isAgent = item.sender === 'admin';
    const nextMessage = messages[index + 1];
    const isLastInGroup = !nextMessage || nextMessage.type === 'date' || nextMessage.sender !== item.sender;
    const showAvatar = isAgent && isLastInGroup;

    return (
      <View style={[styles.messageContainer, { alignSelf: isAgent ? 'flex-start' : 'flex-end' }]}>
        {/* Agent Avatar */}
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
        <View style={[styles.messageBubble, isAgent ? styles.adminBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAgent ? styles.adminText : styles.userText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isAgent ? styles.adminTimeText : styles.userTimeText]}>
            {item.displayTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMessage}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={16}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      ListHeaderComponent={() =>
        hasMoreMessages && isLoadingMessages ? (
          <View style={styles.loadingHeader}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingHeaderText}>Loading older messages...</Text>
          </View>
        ) : hasMoreMessages ? (
          <View style={styles.loadingHeader}>
            <Text style={styles.scrollHintText}>Scroll up to load older messages</Text>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  adminText: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 3,
    fontWeight: '400',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  adminTimeText: {
    color: '#9CA3AF',
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateSeparatorText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingHeader: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  loadingHeaderText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  scrollHintText: {
    color: '#999',
    fontSize: 11,
    fontWeight: '400',
  },
});

export default MessageList;
