import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { Input, Button } from "../../components/ui";
import { authAPI } from "../../shared/api";
import ErrorModal from "../../components/ErrorModal";
import Feather from "react-native-vector-icons/Feather";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../config/navigation";
import { setRequiresProfileSetup } from "../../store/slices/profile";

/**
 * Profile Setup Screen (Optional)
 * Allows new users to optionally add their name after authentication
 * Can be skipped - users can add name later in settings
 * 
 * UX: Simple, single-field form asking "What should we call you?"
 * This creates a friendly, conversational tone for customer support
 */
export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { optional = true } = route.params || {};
  const { updateProfile } = useAuth();

  // Form state
  const [name, setName] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation (optional but if provided, must be valid)
    if (name.trim() && name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save profile and navigate to success screen
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // If name is empty, treat as skip
    if (!name.trim()) {
      handleSkip();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authAPI.completeProfile(
        name.trim(),
        " ", // No lastname
      );

      // Backend returns { profile, message }
      // The profile object needs to be merged into client.prof_id
      // The updateProfile method in authStorage handles this correctly
      await updateProfile(response.profile);

      // Clear the requiresProfileSetup flag
      dispatch(setRequiresProfileSetup(false));

      // Navigate to success screen
      navigation.replace(ROUTES.WELCOME_SUCCESS, {
        firstname: name.trim(),
      });
    } catch (err) {
      console.error("Complete profile error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to save profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Skip profile setup and go directly to success screen
   */
  const handleSkip = () => {
    if (optional) {
      // Clear the requiresProfileSetup flag
      dispatch(setRequiresProfileSetup(false));
      
      // Navigate to success screen without name
      navigation.replace(ROUTES.WELCOME_SUCCESS, {
        firstname: null,
      });
    }
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
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Feather name="user" size={40} color="#7C3AED" />
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={styles.subtitle}>
                  {optional
                    ? "Help us personalize your experience\n(Optional - you can skip this)"
                    : "Please enter your name to continue"}
                </Text>

                {/* Form */}
                <View style={styles.form}>
                  <Input
                    label="Name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) {
                        setErrors({ ...errors, name: null });
                      }
                    }}
                    placeholder="Enter your name"
                    error={errors.name}
                    editable={!loading}
                    autoCapitalize="words"
                    autoFocus={true}
                  />

                  <Button
                    title="Continue"
                    onPress={handleSave}
                    loading={loading}
                    size="large"
                    style={styles.saveButton}
                  />

                  {optional && (
                    <Button
                      title="Skip for now"
                      onPress={handleSkip}
                      variant="ghost"
                      size="large"
                      disabled={loading}
                      style={styles.skipButton}
                    />
                  )}
                </View>

                {/* Info Text */}
                {optional && (
                  <View style={styles.infoContainer}>
                    <Feather name="info" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      Adding your name helps our support team provide a more personalized experience
                    </Text>
                  </View>
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
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 40,
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
  form: {
    width: "100%",
    marginBottom: 24,
  },
  saveButton: {
    width: "100%",
    marginTop: 8,
  },
  skipButton: {
    width: "100%",
    marginTop: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
});
