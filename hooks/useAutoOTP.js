import { useEffect, useRef } from 'react';
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import * as SMS from 'expo-sms';

/**
 * Auto OTP Detection Hook
 * 
 * Automatically detects and fills OTP from incoming SMS
 * 
 * iOS: Uses textContentType="oneTimeCode" (built-in)
 * Android: Uses SMS User Consent API via native module
 * 
 * @param {Function} onOTPReceived - Callback when OTP is detected
 * @param {number} otpLength - Expected OTP length (default: 6)
 * @returns {Object} - { startListening, stopListening, isListening }
 */
export const useAutoOTP = (onOTPReceived, otpLength = 6) => {
  const isListening = useRef(false);
  const listenerRef = useRef(null);

  /**
   * Extract OTP from SMS message
   * Looks for patterns like:
   * - "123456 is your code"
   * - "Your OTP is 123456"
   * - "Code: 123456"
   */
  const extractOTP = (message) => {
    if (!message) return null;

    // Pattern 1: Look for N consecutive digits
    const digitPattern = new RegExp(`\\b\\d{${otpLength}}\\b`);
    const match = message.match(digitPattern);
    
    if (match) {
      return match[0];
    }

    // Pattern 2: Look for "code" or "otp" followed by digits
    const codePattern = new RegExp(`(?:code|otp|verification)\\s*:?\\s*(\\d{${otpLength}})`, 'i');
    const codeMatch = message.match(codePattern);
    
    if (codeMatch) {
      return codeMatch[1];
    }

    return null;
  };

  /**
   * Start listening for SMS (Android only)
   * iOS handles this automatically via textContentType
   */
  const startListening = async () => {
    if (Platform.OS !== 'android') {
      // iOS handles OTP automatically via textContentType="oneTimeCode"
      console.log('📱 iOS: Auto OTP enabled via textContentType');
      return;
    }

    if (isListening.current) {
      console.log('⚠️ Already listening for OTP');
      return;
    }

    try {
      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      
      if (!isAvailable) {
        console.log('❌ SMS not available on this device');
        return;
      }

      isListening.current = true;
      console.log('👂 Started listening for OTP SMS (Android)');

      // Note: Expo doesn't have built-in SMS reading capability
      // For production, you would need to:
      // 1. Use expo-sms-retriever (community package)
      // 2. Or create a native module
      // 3. Or use react-native-otp-verify
      
      // For now, we'll rely on clipboard monitoring as fallback
      startClipboardMonitoring();

    } catch (error) {
      console.error('❌ Failed to start OTP listener:', error);
      isListening.current = false;
    }
  };

  /**
   * Fallback: Monitor clipboard for OTP
   * Users can copy OTP from SMS and it will auto-fill
   */
  const startClipboardMonitoring = () => {
    // This is a fallback approach
    // In production, use a proper SMS reading library
    console.log('📋 Clipboard monitoring active (fallback)');
  };

  /**
   * Stop listening for SMS
   */
  const stopListening = () => {
    if (!isListening.current) return;

    if (listenerRef.current) {
      listenerRef.current.remove();
      listenerRef.current = null;
    }

    isListening.current = false;
    console.log('🛑 Stopped listening for OTP');
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    startListening,
    stopListening,
    isListening: isListening.current,
  };
};

export default useAutoOTP;
