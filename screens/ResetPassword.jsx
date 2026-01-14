import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

const ResetPassword = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const handleConfirm = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all password fields");
    } else if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
    } else {
      Alert.alert("Success", "Password reset successful!");
      navigation.navigate("Login");
    }
  };

  return ( 
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Feather name="arrow-left" size={25} color="#848287" />
                <Text style={styles.headerText}>Reset Password</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Password Input */}
              <View style={styles.passwordContainer}>
                <Feather name="lock" size={20} color="#848287" style={styles.lockIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  placeholder="Password"
                  placeholderTextColor="#848287"
                  style={styles.passwordInput}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                  <Feather name={secureText ? "eye-off" : "eye"} size={22} color="#848287" />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.passwordContainer}>
                <Feather name="lock" size={20} color="#848287" style={styles.lockIcon} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureConfirm}
                  placeholder="Confirm Password"
                  placeholderTextColor="#848287"
                  style={styles.passwordInput}
                />
                <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                  <Feather name={secureConfirm ? "eye-off" : "eye"} size={22} color="#848287" />
                </TouchableOpacity>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                <Text style={styles.signup}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1F1B24",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 8,
  },
  formContainer: {
    marginTop: 60,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  lockIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: "#6237A0",
    borderRadius: 10,
    padding: 16,
    marginTop: 38,
  },
  signup: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
