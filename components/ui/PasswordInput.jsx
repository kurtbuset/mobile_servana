import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Password Input with toggle visibility
 */
export const PasswordInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder = 'Enter password',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const toggleSecure = () => setIsSecure(!isSecure);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.input_focused,
            error && styles.input_error,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...props}
        />
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleSecure}
          activeOpacity={0.7}
        >
          <Feather
            name={isSecure ? 'eye-off' : 'eye'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input_focused: {
    borderColor: '#6C5CE7',
    backgroundColor: '#FFFFFF',
  },
  input_error: {
    borderColor: '#FF6B6B',
  },
  iconButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
});

export default PasswordInput;
