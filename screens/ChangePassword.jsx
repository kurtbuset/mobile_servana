import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Change Password</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("SuccessScreen")}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lockIcon}>
        <Feather name="lock" size={60} color="#000" />
      </View>

      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}></Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="Current Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    color: "#8a2be2",
    fontWeight: "500",
  },
  lockIcon: {
    alignItems: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});
