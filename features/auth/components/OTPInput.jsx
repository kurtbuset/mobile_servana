import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

/**
 * OTP Input Component
 * 6-digit OTP input with individual boxes
 */
export const OTPInput = ({ value, onChangeText, length = 6, editable = true }) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleChange = (text, index) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      // Handle backspace
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChangeText(newValue);
      
      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      // Handle single digit
      const newValue = value.slice(0, index) + numericText + value.slice(index + 1);
      onChangeText(newValue);
      
      // Focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length > 1) {
      // Handle paste
      const pastedValue = numericText.slice(0, length);
      onChangeText(pastedValue);
      
      // Focus last input
      const lastIndex = Math.min(pastedValue.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
          ]}
          editable={editable}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  input: {
    width: 48,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  inputFocused: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  inputFilled: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
});

export default OTPInput;
