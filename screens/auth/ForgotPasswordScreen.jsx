import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaContainer, KeyboardAvoidingContainer, ScrollContainer } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { usePasswordReset, CountrySelector } from '../../features/auth';
import { getDefaultCountry } from '../../shared/constants';
import { formatPhoneNumber } from '../../features/auth/utils/authHelpers';
// import { ErrorModal } from '../../components';

/**
 * Forgot Password Screen - Container Component
 */
export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { requestReset, loading, error, clearError } = usePasswordReset();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text, selectedCountry.code);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }

    const countryCode = `+${selectedCountry.callingCode}`;
    const result = await requestReset(countryCode, phoneNumber);

    if (result.success) {
      navigation.navigate('ResetPassword', {
        phone_country_code: countryCode,
        phone_number: phoneNumber,
      });
    }
  };

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingContainer>
        <ScrollContainer>
          <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to receive a reset code
            </Text>

            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={setSelectedCountry}
            />

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />

            <Button
              title="Send Reset Code"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
          </View>
        </ScrollContainer>
      </KeyboardAvoidingContainer>

      {/* <ErrorModal
        visible={!!error}
        message={error}
        onClose={clearError}
      /> */}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
});
