import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Verification Code Input Component
 * 6-digit code input with validation indicator
 */
export const VerificationCodeInput = ({ value, onChangeText }) => {
  const handleChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    onChangeText(numericText);
  };

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Feather name="shield" size={16} color="#6237A0" />
        <Text style={styles.inputLabel}>Verification Code</Text>
      </View>
      <View style={styles.codeContainer}>
        <Feather name="shield" size={20} color="#848287" style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="Enter 6-digit code"
          placeholderTextColor="#848287"
          style={styles.codeInput}
          maxLength={6}
        />
        {value.length === 6 && (
          <Feather name="check-circle" size={20} color="#6237A0" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    width: '100%',
    marginBottom: 20,
    zIndex: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: '#848287',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    backgroundColor: '#444148',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444148',
  },
  icon: {
    marginRight: 10,
  },
  codeInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: '600',
  },
});

export default VerificationCodeInput;
