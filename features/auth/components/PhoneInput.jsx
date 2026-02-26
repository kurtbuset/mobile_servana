import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Feather from "react-native-vector-icons/Feather";

/**
 * Phone Input Component
 *
 * Features:
 * - Phone number input with numeric validation
 * - Visual feedback for focus and error states
 * - Icon indicator
 * - Error message display
 * - Disabled state support
 *
 * Usage:
 * <PhoneInput
 *   value={phoneNumber}
 *   onChangeText={setPhoneNumber}
 *   placeholder="Phone Number"
 *   error={errorMessage}
 * />
 */
export const PhoneInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  onSubmitEditing,
  placeholder = "Phone Number",
  editable = true,
  error,
  style,
  autoFocus = false,
  returnKeyType = "done",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (text) => {
    // Remove non-numeric characters for phone number validation
    const numericText = text.replace(/[^0-9]/g, "");
    onChangeText(numericText);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <Feather
          name="phone"
          size={20}
          color={isFocused ? "#7C3AED" : "#999"}
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
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          editable={editable}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          maxLength={15}
          autoComplete="tel"
          textContentType="telephoneNumber"
          {...props}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={12} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 48,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "transparent",
  },
  input_focused: {
    borderColor: "#7C3AED",
    backgroundColor: "#FFFFFF",
  },
  input_error: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  input_disabled: {
    backgroundColor: "#E0E0E0",
    color: "#999",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 4,
    flex: 1,
  },
});

export default PhoneInput;
