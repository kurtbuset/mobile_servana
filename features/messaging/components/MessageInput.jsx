import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Message Input Component
 * Input bar with menu button for canned messages and send button
 */
export const MessageInput = ({ 
  value, 
  onChangeText, 
  onSend, 
  onOpenCannedMessages,
  disabled = false 
}) => {
  const inputRef = useRef(null);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <View style={styles.inputBar}>
      <TouchableOpacity 
        onPress={onOpenCannedMessages}
        disabled={disabled}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Feather
          name="menu"
          size={22}
          color={disabled ? "#D1D5DB" : "#7C3AED"}
        />
      </TouchableOpacity>
      
      <TextInput
        ref={inputRef}
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
        editable={!disabled}
        returnKeyType="default"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
      />
      
      <TouchableOpacity 
        onPress={handleSend}
        disabled={disabled || !value.trim()}
        style={[
          styles.sendButton,
          (disabled || !value.trim()) && styles.sendButtonDisabled
        ]}
        activeOpacity={0.7}
      >
        <Feather 
          name="send" 
          size={20} 
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#F9FAFB',
    maxHeight: 100,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default MessageInput;
