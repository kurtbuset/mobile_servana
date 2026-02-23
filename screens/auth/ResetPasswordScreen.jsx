import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaContainer, KeyboardAvoidingContainer, ScrollContainer } from '../../components/layout';
import { Button, PasswordInput } from '../../components/ui';
import { usePasswordReset, VerificationInput } from '../../features/auth';
import { validateResetPasswordForm } from '../../shared/forms';
import ErrorModal from '../../components/ErrorModal';

/**
 * Reset Password Screen - Container Component
 */
export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetPassword, loading, error, clearError } = usePasswordReset();

  const { phone_country_code, phone_number } = route.params;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validate OTP
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter 6-digit code' });
      return;
    }

    // Validate passwords
    const validation = validateResetPasswordForm({
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const fullPhone = `${phone_country_code}${phone_number}`;
    const result = await resetPassword(fullPhone, otp, newPassword);

    if (result.success) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingContainer>
        <ScrollContainer>
          <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the code sent to your phone and create a new password
            </Text>

            <VerificationInput
              length={6}
              onComplete={setOtp}
              error={errors.otp}
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              error={errors.newPassword}
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              error={errors.confirmPassword}
            />

            <Button
              title="Reset Password"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
          </View>
        </ScrollContainer>
      </KeyboardAvoidingContainer>

      <ErrorModal
        visible={!!error}
        message={error}
        onClose={clearError}
      />
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
    marginTop: 24,
  },
});
