import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  PhoneInput,
  CountrySelector,
  OTPInput,
} from "../../features/auth/components";
import { Button } from "../../components/ui";
import { getDefaultCountry } from "../../shared/constants";
import { authAPI } from "../../shared/api";
import ErrorModal from "../../components/ErrorModal";
import Feather from "react-native-vector-icons/Feather";
import { ROUTES } from "../../config/navigation";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Unified Authentication Screen (Viber-Style)
 * Handles both new user registration and existing user login
 *
 * Flow:
 * 1. Phone Input Step - User enters phone number
 * 2. OTP Input Step - User enters OTP code
 * 3. Navigate to Dashboard or Profile Setup based on response
 */
export default function AuthScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  // Step management: 'phone' or 'otp'
  const [step, setStep] = useState("phone");

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());

  // OTP input state
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  // Timer for OTP expiration
  const [timer, setTimer] = useState(300);

  // OTP expiration timer
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  /**
   * Step 1: Request OTP
   * Sends OTP to the provided phone number
   * Backend detects if user is new or existing
   */
  const handleRequestOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const phoneCountryCode = `+${selectedCountry.callingCode}`;

      const response = await authAPI.requestOtp(phoneCountryCode, phoneNumber);

      // Store user type and expiration
      setIsNewUser(response.is_new_user);
      setOtpExpiresIn(response.otp_expires_in || 300);
      setTimer(response.otp_expires_in || 300);

      // Move to OTP step
      setStep("otp");
    } catch (err) {
      console.error("Request OTP error:", err);
      setError(
        err.response?.data?.error || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP
   * Verifies the OTP code and authenticates the user
   * Handles both new user registration and existing user login
   */
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const phoneCountryCode = `+${selectedCountry.callingCode}`;

      const response = await authAPI.verifyOtp(
        phoneCountryCode,
        phoneNumber,
        otp,
      );

      // Update authentication state (saves token and profile)
      await login(response.client, response.token);

      // Navigate based on profile status
      if (response.requires_profile) {
        // New user without profile - navigate to optional profile setup
        navigation.navigate(ROUTES.PROFILE_SETUP, { optional: true });
      }
      // If profile exists, the auth state change will automatically
      // switch to the Main App Stack (HomeScreen)
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errorMessage =
        err.response?.data?.error || "Invalid OTP. Please try again.";
      const attemptsRemaining = err.response?.data?.attempts_remaining;

      if (attemptsRemaining !== undefined) {
        setError(`${errorMessage} (${attemptsRemaining} attempts remaining)`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   * Allows user to request a new OTP code
   */
  const handleResendOtp = async () => {
    try {
      setResending(true);
      setError("");
      setOtp(""); // Clear current OTP input

      const phoneCountryCode = `+${selectedCountry.callingCode}`;

      const response = await authAPI.requestOtp(phoneCountryCode, phoneNumber);

      // Reset timer
      setTimer(response.otp_expires_in || 300);

      Alert.alert("Success", "OTP has been resent to your phone number");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err.response?.data?.error || "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  /**
   * Go back to phone input step
   */
  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setTimer(300);
  };

  /**
   * Format timer display (MM:SS)
   */
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                {/* Back Button */}
                {step === "otp" && (
                  <TouchableOpacity
                    onPress={handleBackToPhone}
                    style={styles.backButton}
                  >
                    <Feather name="arrow-left" size={24} color="#1A1A1A" />
                  </TouchableOpacity>
                )}

                {/* Phone Input Step */}
                {step === "phone" && (
                  <>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                      <Image
                        source={require("../../assets/icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>
                      Enter your phone number to continue
                    </Text>

                    {/* Form */}
                    <View style={styles.form}>
                      <CountrySelector
                        selectedCountry={selectedCountry}
                        onSelect={setSelectedCountry}
                      />

                      <PhoneInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Phone Number"
                        countryCode={selectedCountry.code}
                        editable={!loading}
                      />

                      <Button
                        title="Continue"
                        onPress={handleRequestOtp}
                        loading={loading}
                        size="large"
                        style={styles.continueButton}
                      />
                    </View>
                  </>
                )}

                {/* OTP Input Step */}
                {step === "otp" && (
                  <>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      <View style={styles.iconCircle}>
                        <Feather
                          name="message-circle"
                          size={40}
                          color="#7C3AED"
                        />
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                      {isNewUser ? "Create Account" : "Welcome Back"}
                    </Text>
                    <Text style={styles.subtitle}>
                      Enter the 6-digit code sent to{"\n"}+
                      {selectedCountry.callingCode} {phoneNumber}
                    </Text>

                    {/* Timer */}
                    {timer > 0 && (
                      <Text style={styles.timer}>
                        Code expires in {formatTimer(timer)}
                      </Text>
                    )}

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
                        onPress={handleVerifyOtp}
                        loading={loading}
                        size="large"
                        style={styles.verifyButton}
                      />
                    </View>

                    {/* Resend OTP */}
                    <View style={styles.footer}>
                      <Text style={styles.footerText}>
                        Didn't receive the code?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={resending || timer > 240} // Allow resend after 1 minute
                      >
                        <Text
                          style={[
                            styles.resendText,
                            (resending || timer > 240) &&
                              styles.resendTextDisabled,
                          ]}
                        >
                          {resending ? "Sending..." : "Resend"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ErrorModal
        visible={!!error}
        message={error}
        onClose={() => setError("")}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    justifyContent: "center",
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  timer: {
    fontSize: 14,
    color: "#7C3AED",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  form: {
    width: "100%",
    marginBottom: 24,
  },
  continueButton: {
    width: "100%",
    marginTop: 8,
  },
  verifyButton: {
    width: "100%",
    marginTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  resendText: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
});
