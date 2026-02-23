import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Phone Input Component - Matches PasswordInput styling
 */
export const PhoneInput = ({ 
  label,
  value, 
  onChangeText,
  onBlur,
  placeholder = 'Phone Number',
  editable = true,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (text) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    onChangeText(numericText);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <Feather 
          name="phone" 
          size={20} 
          color="#7C3AED" 
          style={styles.icon} 
        />
        <TextInput
          style={[
            styles.input,
            isFocused && styles.input_focused,
            error && styles.input_error,
            !editable && styles.input_disabled,
          ]}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          editable={editable}
          maxLength={15}
          {...props}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 48,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input_focused: {
    borderColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
  },
  input_error: {
    borderColor: '#FF6B6B',
  },
  input_disabled: {
    backgroundColor: '#E0E0E0',
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
});

export default PhoneInput;
