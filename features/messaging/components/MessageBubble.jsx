import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Message Bubble Component
 */
export const MessageBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.adminContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.adminBubble]}>
        <Text style={[styles.content, isUser ? styles.userContent : styles.adminContent]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.userTime : styles.adminTime]}>
          {message.displayTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  adminContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6C5CE7',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  userContent: {
    color: '#FFFFFF',
  },
  adminContent: {
    color: '#1A1A1A',
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  adminTime: {
    color: '#999',
  },
});

export default MessageBubble;
