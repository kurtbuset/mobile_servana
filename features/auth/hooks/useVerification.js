import { useState, useEffect } from 'react';
import { authAPI } from '../../../shared/api';
import { setClient } from '../../../store/slices/profile';
import { clearCompleteSession } from '../../../utils/secureLogout';
import SecureStorage from '../../../utils/secureStorage';

/**
 * Custom hook for OTP verification during registration
 */
export const useVerification = ({
  phone_country_code,
  phone_number,
  password,
  firstName,
  lastName,
  birthdate,
  dispatch,
  navigation,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(120); // 2 minutes
    setCanResend(false);
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      
      // Use auth API to send OTP
      await authAPI.sendOtp({
        phone_country_code,
        phone_number,
      });

      setErrorMessage('Code sent successfully! Please check your phone.');
      setShowErrorModal(true);
      startCountdown();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to resend OTP');
      setShowErrorModal(true);
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * Verify OTP and complete registration
   */
  const handleVerify = async () => {
    if (!/^\d{6}$/.test(verificationCode)) {
      setErrorMessage('Please enter a 6-digit verification code');
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);

      // Clear any existing session data before registration
      await clearCompleteSession();

      // Step 1: Verify OTP
      await authAPI.verifyOtp({
        phone_country_code,
        phone_number,
        otp: verificationCode,
      });

      // Step 2: Complete registration
      const data = await authAPI.completeRegistration({
        phone_country_code,
        phone_number,
        firstName,
        lastName,
        birthdate,
        address: '', // optional
        password,
      });

      // Step 3: Store token in SecureStorage and set client in Redux
      await SecureStorage.setToken(data.token);
      dispatch(setClient({ client: data.client }));

      // Step 4: Clear and recreate socket with new token
      const { clearSocket } = require('../../../socket');
      clearSocket();
      console.log('🔌 Socket cleared after registration, will be recreated with new token');

      console.log('✅ Registration successful, token stored securely, client set in Redux');

      // Navigate to profile picture setup
      navigation.navigate('ProfilePicture', {
        client_id: data.client.client_id,
        client: data.client,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || 'Failed to verify OTP or register account'
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    verificationCode,
    setVerificationCode,
    loading,
    resendLoading,
    countdown,
    canResend,
    errorMessage,
    showErrorModal,
    setShowErrorModal,
    handleVerify,
    handleResendOtp,
  };
};

export default useVerification;
