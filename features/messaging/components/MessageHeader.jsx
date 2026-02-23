import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Message Header Component
 */
export const MessageHeader = ({ onBack, onEndChat }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="#1F2937" />
        <Text style={styles.headerText}>Chats</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onEndChat}>
        <Text style={styles.endChatText}>End chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  endChatText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MessageHeader;
