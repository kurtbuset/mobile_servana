import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";

/**
 * OTP Input Component
 * 6-digit OTP input with individual boxes
 *
 * Features:
 * - 6-digit OTP input with individual boxes
 * - Auto-focus next field on input
 * - Auto-focus previous field on backspace
 * - Paste support (handles full OTP paste)
 * - Keyboard type optimized for numbers
 * - Visual feedback for focused and filled states
 */
export const OTPInput = ({
  value,
  onChangeText,
  length = 6,
  editable = true,
  autoFocus = true,
}) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = (text, index) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length === 0) {
      // Handle backspace/delete
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChangeText(newValue);

      // Focus previous input on backspace
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      // Handle single digit input
      const newValue =
        value.slice(0, index) + numericText + value.slice(index + 1);
      onChangeText(newValue);

      // Auto-focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last digit entered, blur to hide keyboard (optional)
        inputRefs.current[index]?.blur();
      }
    } else if (numericText.length > 1) {
      // Handle paste - support pasting full OTP code
      const pastedValue = numericText.slice(0, length);
      onChangeText(pastedValue);

      // Focus last filled input or last input
      const lastIndex = Math.min(pastedValue.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace when field is empty
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);

    // Select text on focus for easier editing
    if (value[index]) {
      inputRefs.current[index]?.setNativeProps({
        selection: { start: 0, end: 1 },
      });
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={value[index] || ""}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
            !editable && styles.inputDisabled,
          ]}
          editable={editable}
          selectTextOnFocus
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  input: {
    width: 48,
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  inputFocused: {
    borderColor: "#7C3AED",
    backgroundColor: "#F3F0FF",
  },
  inputFilled: {
    borderColor: "#7C3AED",
    backgroundColor: "#F3F0FF",
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: "#F0F0F0",
  },
});

export default OTPInput;
