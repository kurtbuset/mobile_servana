import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { OTPInput } from '../../features/auth/components';
import { Button } from '../../components/ui';
import { authAPI } from '../../shared/api';
import ErrorModal from '../../components/ErrorModal';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Sign Up - Step 2: OTP Verification (Viber Style)
 */
export default function SignUpOTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone_country_code, phone_number, firstName, lastName, password } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Verify OTP
      await authAPI.verifyOtp({
        phone_country_code,
        phone_number,
        otp,
      });

      // Complete registration after OTP verification
      const result = await authAPI.completeRegistration({
        phone_country_code,
        phone_number,
        firstName,
        lastName,
        password,
        birthdate: new Date().toISOString().split('T')[0],
        address: '',
      });

      // Navigate to profile picture screen with client and token
      navigation.navigate('SignUpProfilePicture', {
        client: result.client,
        token: result.token,
      });
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResending(true);
      setError('');

      await authAPI.sendOtp({
        phone_country_code,
        phone_number,
      });

      Alert.alert('Success', 'OTP has been resent to your phone number');
      setOtp('');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Feather name="arrow-left" size={24} color="#1A1A1A" />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Feather name="message-circle" size={40} color="#7C3AED" />
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Verify Your Number</Text>
                <Text style={styles.subtitle}>
                  Enter the 6-digit code sent to{'\n'}
                  {phone_country_code} {phone_number}
                </Text>

                {/* OTP Input */}
                <View style={styles.form}>
                  <OTPInput
                    value={otp}
                    onChangeText={setOtp}
                    length={6}
                    editable={!loading}
                  />

                  <Button
                    title="Verify"
                    onPress={handleVerifyOTP}
                    loading={loading}
                    size="large"
                    style={styles.verifyButton}
                  />
                </View>

                {/* Resend OTP */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Didn't receive the code? </Text>
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={resending}
                  >
                    <Text style={[styles.resendText, resending && styles.resendTextDisabled]}>
                      {resending ? 'Sending...' : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ErrorModal
        visible={!!error}
        message={error}
        onClose={() => setError('')}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
});
