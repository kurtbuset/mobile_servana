import React, { useState } from 'react';
import { 
  View, 
  Text,
  Image,
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '../../features/auth';
import { getDefaultCountry } from '../../shared/constants';
import { formatPhoneNumber } from '../../features/auth/utils/authHelpers';
import { Button, Input, PasswordInput } from '../../components/ui';
import { CountrySelector, PhoneInput } from '../../features/auth/components';
import ErrorModal from '../../components/ErrorModal';
import { ROUTES } from '../../config';

/**
 * Login Screen - Viber-style minimal design
 */
export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, loading, error, clearError } = useLogin();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text, selectedCountry.code);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: null }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const handleLogin = async () => {
    // Basic validation
    const newErrors = {};
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const countryCode = `+${selectedCountry.callingCode}`;
    const result = await login(countryCode, phoneNumber, password);

    if (result.success) {
      navigation.navigate(ROUTES.HOME);
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
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandName}>Servana</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                {/* Form */}
                <View style={styles.form}>
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                  />

                  <PhoneInput
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="Phone Number"
                    countryCode={selectedCountry.code}
                    editable={!loading}
                    error={errors.phoneNumber}
                  />

                  <PasswordInput
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Password"
                    editable={!loading}
                    error={errors.password}
                  />

                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <Button
                    title="Sign In"
                    onPress={handleLogin}
                    loading={loading}
                    size="large"
                    style={styles.signInButton}
                  />
                </View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUpDetails')}>
                    <Text style={styles.signUpText}>Sign Up</Text>
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
        onClose={clearError}
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  signInButton: {
    width: '100%',
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
  signUpText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
});
