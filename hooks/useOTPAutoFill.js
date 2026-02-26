import { useEffect, useRef, useState } from 'react';
import { Platform, Clipboard } from 'react-native';

/**
 * OTP Auto-Fill Hook
 * 
 * Provides automatic OTP detection and filling:
 * - iOS: Uses native textContentType="oneTimeCode" (automatic)
 * - Android: Monitors clipboard for OTP codes
 * 
 * Usage:
 * const { startMonitoring, stopMonitoring } = useOTPAutoFill(onOTPDetected);
 * 
 * @param {Function} onOTPDetected - Callback when OTP is detected (receives OTP string)
 * @param {Object} options - Configuration options
 * @param {number} options.otpLength - Expected OTP length (default: 6)
 * @param {number} options.pollingInterval - Clipboard check interval in ms (default: 1000)
 * @param {boolean} options.autoStart - Start monitoring automatically (default: false)
 */
export const useOTPAutoFill = (
  onOTPDetected,
  options = {}
) => {
  const {
    otpLength = 6,
    pollingInterval = 1000,
    autoStart = false,
  } = options;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef(null);
  const lastClipboardContent = useRef('');

  /**
   * Extract OTP from text
   * Supports various OTP formats:
   * - "123456 is your code"
   * - "Your OTP: 123456"
   * - "Verification code 123456"
   * - "123456" (standalone)
   */
  const extractOTP = (text) => {
    if (!text || typeof text !== 'string') return null;

    // Remove whitespace and newlines
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Pattern 1: Exact N digits (most common)
    const exactPattern = new RegExp(`\\b(\\d{${otpLength}})\\b`);
    const exactMatch = cleanText.match(exactPattern);
    if (exactMatch) {
      return exactMatch[1];
    }

    // Pattern 2: N digits with common OTP keywords
    const keywordPattern = new RegExp(
      `(?:code|otp|verification|pin|password)\\s*:?\\s*(\\d{${otpLength}})`,
      'i'
    );
    const keywordMatch = cleanText.match(keywordPattern);
    if (keywordMatch) {
      return keywordMatch[1];
    }

    // Pattern 3: First N consecutive digits found
    const digitsPattern = new RegExp(`(\\d{${otpLength}})`);
    const digitsMatch = cleanText.match(digitsPattern);
    if (digitsMatch) {
      return digitsMatch[1];
    }

    return null;
  };

  /**
   * Check clipboard for OTP
   */
  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();

      // Skip if clipboard hasn't changed
      if (clipboardContent === lastClipboardContent.current) {
        return;
      }

      lastClipboardContent.current = clipboardContent;

      // Try to extract OTP
      const otp = extractOTP(clipboardContent);

      if (otp) {
        console.log('✅ OTP detected from clipboard:', otp);
        onOTPDetected(otp);
        
        // Stop monitoring after successful detection
        stopMonitoring();
      }
    } catch (error) {
      console.error('❌ Failed to read clipboard:', error);
    }
  };

  /**
   * Start monitoring clipboard for OTP
   */
  const startMonitoring = () => {
    if (isMonitoring) {
      console.log('⚠️ Already monitoring clipboard');
      return;
    }

    // iOS handles OTP automatically via textContentType
    if (Platform.OS === 'ios') {
      console.log('📱 iOS: Auto OTP enabled via textContentType="oneTimeCode"');
      console.log('💡 Clipboard monitoring also active as fallback');
    } else {
      console.log('📋 Android: Clipboard monitoring active for OTP detection');
      console.log('💡 Tip: Copy OTP from SMS for auto-fill');
    }

    setIsMonitoring(true);

    // Start polling clipboard
    intervalRef.current = setInterval(checkClipboard, pollingInterval);

    // Initial check
    checkClipboard();
  };

  /**
   * Stop monitoring clipboard
   */
  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsMonitoring(false);
    lastClipboardContent.current = '';
    console.log('🛑 Stopped OTP monitoring');
  };

  /**
   * Auto-start if enabled
   */
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [autoStart]);

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
  };
};

export default useOTPAutoFill;
