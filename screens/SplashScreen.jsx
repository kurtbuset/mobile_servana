import React from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";

/**
 * Splash screen shown during app initialization
 * Displays Servana logo while checking token validity
 */
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});

export default SplashScreen;
