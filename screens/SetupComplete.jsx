import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch } from "react-redux";
import { setClient } from "../slices/clientSlice";

const SetupComplete = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { client, token } = route.params || {};

  useEffect(() => {
    // Dispatch client data to Redux when component mounts
    if (client && token) {
      dispatch(setClient({ client, token }));
    }
  }, [client, token, dispatch]);

  const handleGetStarted = () => {
    // Navigate to Dashboard (HomeScreen which contains BottomTabs)
    navigation.replace("HomeScreen");
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Feather name="check-circle" size={80} color="#9140DD" />
          </View>

          {/* Title */}
          <Text style={styles.title}>All Set Up!</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your profile has been created successfully.{"\n"}
            Let's get started!
          </Text>

          {/* Get Started Button */}
          <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
            <Text style={styles.buttonText}>Let's Get Started</Text>
            <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SetupComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    color: "#848287",
    fontSize: 16,
    marginBottom: 50,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9140DD",
    borderRadius: 10,
    padding: 16,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
