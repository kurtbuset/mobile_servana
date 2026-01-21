import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
// import BASE_URL from "../apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePicture ()  {
  const navigation = useNavigation();
  const route = useRoute();
  const { client_id, token, client } = route.params || {};
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSkip = () => {
    navigation.navigate("SetupComplete", { client: client || { client_id }, token });
  };

  const handleContinue = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image or skip this step");
      return;
    }

    try {
      const authToken = token || (await AsyncStorage.getItem("token"));
      
      // For mock backend, send the image URI directly
      // await axios.post(
      //   `${BASE_URL}/client/profile/picture`,
      //   {
      //     profile_picture: image,
      //     client_id,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${authToken}`,
      //     },
      //   }
      // );

      // Update profile in AsyncStorage
      const profileStr = await AsyncStorage.getItem("profile");
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        profile.profile_picture = image;
        await AsyncStorage.setItem("profile", JSON.stringify(profile));
      }

      navigation.navigate("SetupComplete", { client: client || { client_id }, token: authToken });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to upload profile picture"
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1B24", paddingHorizontal: 16 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Feather name="arrow-left" size={25} color="#848287" />
              <Text style={{ color: "#fff", fontSize: 20, marginLeft: 8 }}>
                Profile Picture
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ marginTop: 60, alignItems: "center", flex: 1 }}>
            <Text style={styles.title}>Add Profile Picture</Text>
            <Text style={styles.subtitle}>
              You can add a profile picture now or skip this step
            </Text>

            {/* Image Preview */}
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                <Image
                  source={
                    image
                      ? { uri: image }
                      : require("../assets/userblank.jpg")
                  }
                  style={styles.profileImage}
                />
                <View style={styles.cameraIconContainer}>
                  <Feather name="camera" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.secondaryButton}>
                <Feather name="image" size={20} color="#9140DD" />
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={takePhoto} style={styles.secondaryButton}>
                <Feather name="camera" size={20} color="#9140DD" />
                <Text style={styles.secondaryButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Continue and Skip Buttons */}
            <View style={styles.actionContainer}>
              {image && (
                <TouchableOpacity onPress={handleContinue} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};


const styles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#848287",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  imageContainer: {
    marginBottom: 30,
  },
  imageWrapper: {
    position: "relative",
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#9140DD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1F1B24",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
    marginBottom: 30,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#444148",
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionContainer: {
    width: "100%",
    gap: 15,
    marginTop: "auto",
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#9140DD",
    borderRadius: 10,
    padding: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  skipButton: {
    borderRadius: 10,
    padding: 16,
  },
  skipButtonText: {
    color: "#848287",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

