import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Enhanced Message Header Component
 * Shows connection status and chat information
 */
export const MessageHeader = ({ 
  onBack, 
  onEndChat, 
  isConnected = true, 
  chatStatus = 'active',
  departmentName = null,
  showEndChatButton = false
}) => {
  const getStatusInfo = () => {
    if (!isConnected) {
      return { text: 'Connecting...', color: '#F59E0B', icon: 'wifi-off' };
    }
    
    switch (chatStatus) {
      case 'active':
        return { text: 'Connected', color: '#10B981', icon: 'check-circle' };
      case 'queued':
        return { text: 'In Queue', color: '#F59E0B', icon: 'clock' };
      case 'ended':
        return { text: 'Chat Ended', color: '#6B7280', icon: 'x-circle' };
      default:
        return { text: 'Ready', color: '#7C3AED', icon: 'message-circle' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="#1F2937" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Support Chat</Text>
          <View style={styles.statusContainer}>
            <Feather name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
            {departmentName && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.departmentText}>{departmentName}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {showEndChatButton && chatStatus === 'active' && (
        <TouchableOpacity onPress={onEndChat} style={styles.endChatButton}>
          <Text style={styles.endChatText}>End chat</Text>
        </TouchableOpacity>
      )}
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
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  separator: {
    color: '#D1D5DB',
    fontSize: 12,
    marginHorizontal: 6,
  },
  departmentText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  endChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  endChatText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MessageHeader;
