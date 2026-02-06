import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";

import AnimatedBackground from "../components/AnimatedBackground";
import ErrorModal from "../components/ErrorModal";
import ScreenHeader from "../components/ScreenHeader";
import API_URL from '../config/api';

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { phone_country_code, phone_number } = route.params || {};

  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

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
    setCountdown(120);
    setCanResend(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      await axios.post(`${API_URL}/clientAccount/auth/send-otp`, {
        phone_country_code,
        phone_number,
      });
      setErrorMessage("Code sent successfully! Please check your phone.");
      setShowErrorModal(true);
      startCountdown();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to resend OTP");
      setShowErrorModal(true);
    } finally {
      setResendLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Validation
    if (!/^\d{6}$/.test(verificationCode)) {
      setErrorMessage("Please enter a 6-digit verification code");
      setShowErrorModal(true);
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill out all password fields");
      setShowErrorModal(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setShowErrorModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      
      // Verify OTP and reset password
      await axios.post(`${API_URL}/clientAccount/auth/reset-password`, {
        phone_country_code,
        phone_number,
        otp: verificationCode,
        newPassword: password,
      });

      setErrorMessage("Password reset successful! You can now login with your new password.");
      setShowErrorModal(true);
      
      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);

    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to reset password");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: moderateScale(20), paddingBottom: verticalScale(30) }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            <AnimatedBackground />

            <ScreenHeader 
              title="Reset Password" 
              onBack={() => navigation.goBack()} 
            />

            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Feather name="lock" size={moderateScale(50)} color="#6237A0" />
              </View>
            </View>

            <Text style={styles.title}>Verify & Reset</Text>
            <Text style={styles.subtitle}>
              Enter the verification code and your new password
            </Text>

            {/* Verification Code Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Feather name="shield" size={16} color="#6237A0" />
                <Text style={styles.inputLabel}>Verification Code</Text>
              </View>
              <View style={styles.inputContainer}>
                <Feather name="shield" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  value={verificationCode}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
                    setVerificationCode(numericText);
                  }}
                  keyboardType="numeric"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#848287"
                  style={styles.input}
                  maxLength={6}
                />
                {verificationCode.length === 6 && (
                  <Feather name="check-circle" size={20} color="#6237A0" />
                )}
              </View>
            </View>

            {/* Resend Code Button with Countdown */}
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resendLoading || !canResend}
              style={[
                styles.resendButton,
                (!canResend || resendLoading) && { opacity: 0.5 }
              ]}
              activeOpacity={0.7}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#6237A0" />
              ) : (
                <View style={styles.resendContent}>
                  <Feather name="refresh-cw" size={16} color={canResend ? "#6237A0" : "#666"} />
                  <Text style={[
                    styles.resendText,
                    !canResend && { color: "#666", textDecorationLine: "none" }
                  ]}>
                    {canResend ? "Resend Code" : `Resend in ${formatTime(countdown)}`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Feather name="lock" size={16} color="#6237A0" />
                <Text style={styles.inputLabel}>New Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  placeholder="Enter new password"
                  placeholderTextColor="#848287"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  <Feather name={secureText ? "eye-off" : "eye"} size={20} color="#848287" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Feather name="lock" size={16} color="#6237A0" />
                <Text style={styles.inputLabel}>Confirm Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureConfirm}
                  placeholder="Confirm new password"
                  placeholderTextColor="#848287"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                  <Feather name={secureConfirm ? "eye-off" : "eye"} size={20} color="#848287" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              disabled={loading || verificationCode.length !== 6 || !password || !confirmPassword}
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                (loading || verificationCode.length !== 6 || !password || !confirmPassword) && { opacity: 0.5 }
              ]}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.loadingText}>Resetting...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Reset Password</Text>
                  <Feather name="check" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <ErrorModal
              visible={showErrorModal}
              message={errorMessage}
              onClose={() => setShowErrorModal(false)}
              title="Notice"
            />
          </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    position: "relative",
    overflow: "hidden",
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: verticalScale(20),
    zIndex: 10,
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: "rgba(98, 55, 160, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(98, 55, 160, 0.3)",
  },
  title: {
    color: "#fff",
    fontSize: moderateScale(26, 0.3),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(10),
    zIndex: 10,
  },
  subtitle: {
    color: "#888",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(30),
    lineHeight: moderateScale(20),
    zIndex: 10,
  },
  inputGroup: {
    width: "100%",
    marginBottom: verticalScale(20),
    zIndex: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
    gap: moderateScale(6),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: "#848287",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    height: verticalScale(50),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444148",
  },
  icon: {
    marginRight: moderateScale(10),
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: moderateScale(16),
  },
  resendButton: {
    alignSelf: "center",
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(20),
    zIndex: 10,
  },
  resendContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  resendText: {
    color: "#6237A0",
    fontSize: moderateScale(15),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  confirmButton: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    marginTop: verticalScale(10),
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
    zIndex: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  loadingText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
});
