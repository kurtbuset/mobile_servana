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
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Input, Button } from "../../components/ui";
import { authAPI } from "../../shared/api";
import ErrorModal from "../../components/ErrorModal";
import Feather from "react-native-vector-icons/Feather";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../config/navigation";

/**
 * Profile Setup Screen (Optional)
 * Allows new users to optionally add their name after authentication
 * Can be skipped - users can add profile later in settings
 */
export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { optional = true } = route.params || {};
  const { updateProfile } = useAuth();

  // Form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    // First name validation (optional but if provided, must be valid)
    if (firstname.trim() && firstname.trim().length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    }

    // Last name validation (optional but if provided, must be valid)
    if (lastname.trim() && lastname.trim().length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save profile and navigate to home
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // If both fields are empty, treat as skip
    if (!firstname.trim() && !lastname.trim()) {
      handleSkip();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authAPI.completeProfile(
        firstname.trim(),
        lastname.trim(),
      );

      // Update profile in auth context
      await updateProfile({
        prof_firstname: firstname.trim(),
        prof_lastname: lastname.trim(),
      });

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate(ROUTES.HOME),
        },
      ]);
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
   * Skip profile setup and go directly to home
   */
  const handleSkip = () => {
    if (optional) {
      // Navigate to home screen
      navigation.navigate(ROUTES.HOME);
    } else {
      Alert.alert(
        "Profile Required",
        "Please complete your profile to continue.",
      );
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
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>
                  {optional
                    ? "Add your name to personalize your account\n(You can skip this step)"
                    : "Please add your name to continue"}
                </Text>

                {/* Form */}
                <View style={styles.form}>
                  <Input
                    label="First Name"
                    value={firstname}
                    onChangeText={(text) => {
                      setFirstname(text);
                      if (errors.firstname) {
                        setErrors({ ...errors, firstname: null });
                      }
                    }}
                    placeholder="Enter your first name"
                    error={errors.firstname}
                    editable={!loading}
                    autoCapitalize="words"
                  />

                  <Input
                    label="Last Name"
                    value={lastname}
                    onChangeText={(text) => {
                      setLastname(text);
                      if (errors.lastname) {
                        setErrors({ ...errors, lastname: null });
                      }
                    }}
                    placeholder="Enter your last name"
                    error={errors.lastname}
                    editable={!loading}
                    autoCapitalize="words"
                  />

                  <Button
                    title="Save"
                    onPress={handleSave}
                    loading={loading}
                    size="large"
                    style={styles.saveButton}
                  />

                  {optional && (
                    <Button
                      title="Skip"
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
                      You can add or edit your profile later in Settings
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
