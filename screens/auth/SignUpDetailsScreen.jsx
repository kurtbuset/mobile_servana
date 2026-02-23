import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Input, PasswordInput, Button } from '../../components/ui';
import { PhoneInput, CountrySelector } from '../../features/auth/components';
import { getDefaultCountry } from '../../shared/constants';
import { authAPI } from '../../shared/api';
import ErrorModal from '../../components/ErrorModal';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Sign Up - Step 1: Personal Details + Phone Number (Viber Style)
 */
export default function SignUpDetailsScreen() {
  const navigation = useNavigation();
  
  // Phone fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  
  // Personal details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (!phoneNumber || phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const phone_country_code = `+${selectedCountry.callingCode}`;
      
      // Send OTP
      await authAPI.sendOtp({
        phone_country_code,
        phone_number: phoneNumber,
      });

      // Navigate to OTP verification with all data
      navigation.navigate('SignUpOTP', {
        phone_country_code,
        phone_number: phoneNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
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

                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                {/* Title */}
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Enter your details to get started
                </Text>

                {/* Form */}
                <View style={styles.form}>
                  {/* Phone Section */}
                  <Text style={styles.sectionTitle}>Phone Number</Text>
                  
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                  />

                  <PhoneInput
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (errors.phoneNumber) {
                        setErrors({ ...errors, phoneNumber: null });
                      }
                    }}
                    placeholder="Phone Number"
                    countryCode={selectedCountry.code}
                    editable={!loading}
                    error={errors.phoneNumber}
                  />

                  {/* Personal Details Section */}
                  <Text style={styles.sectionTitle}>Personal Information</Text>

                  <Input
                    label="First Name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName) {
                        setErrors({ ...errors, firstName: null });
                      }
                    }}
                    placeholder="Enter your first name"
                    error={errors.firstName}
                    editable={!loading}
                  />

                  <Input
                    label="Last Name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName) {
                        setErrors({ ...errors, lastName: null });
                      }
                    }}
                    placeholder="Enter your last name"
                    error={errors.lastName}
                    editable={!loading}
                  />

                  <PasswordInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors({ ...errors, password: null });
                      }
                    }}
                    placeholder="Create a password"
                    error={errors.password}
                    editable={!loading}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: null });
                      }
                    }}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                    editable={!loading}
                  />

                  <Button
                    title="Continue"
                    onPress={handleContinue}
                    loading={loading}
                    size="large"
                    style={styles.continueButton}
                  />
                </View>

                {/* Login Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>Sign In</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
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
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
  },
  continueButton: {
    width: '100%',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  loginText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
});
