import React, { useRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessageHeader, MessageList } from '../../features/messaging/components';
import { useMessageHistory } from '../../features/messaging/hooks';

/**
 * Read-only view of a resolved chat session's message history
 */
export default function ChatHistoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatGroupId, department } = route.params;
  const flatListRef = useRef(null);

  const {
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
  } = useMessageHistory(chatGroupId, flatListRef);

  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearTop = contentOffset.y <= 50;
    if (isNearTop && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  return (
    <SafeAreaView style={styles.container}>
      <MessageHeader
        onBack={() => navigation.goBack()}
        chatStatus="ended"
        departmentName={department || null}
        showEndChatButton={false}
      />
      <MessageList
        messages={messages}
        flatListRef={flatListRef}
        onScroll={handleScroll}
        isLoadingMessages={isLoadingMessages}
        hasMoreMessages={hasMoreMessages}
        isTyping={false}
        shouldAutoScroll={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
