import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ✅ Added
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const [image, setImage] = useState(null);
  const navigation = useNavigation(); // ✅ Added
  const client = useSelector((state) => state.client.data);
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Feather name="arrow-left" size={24} color="black" />
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.topSection}>
        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                image ? { uri: image } : require("../assets/userblank.jpg")
              }
              style={styles.profileImage}
            />
            <Feather
              name="camera"
              size={20}
              color="black"
              strokeWidth={1}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
          <Text style={styles.phoneNumber}>  { client.client_number}</Text>
        </View>
      </View>

      <View style={styles.selectionSection}>
        <TouchableOpacity
          style={styles.selectionRow}
          onPress={() => navigation.navigate("MyProfile")}
        >
          <Feather
            name="user"
            size={24}
            color="#6237A0"
            style={styles.selectionIcon}
          />
          <Text style={styles.selectionText}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectionRow}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <Feather
            name="lock"
            size={24}
            color="#6237A0"
            style={styles.selectionIcon}
          />
          <Text style={styles.selectionText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace("Login")} // ✅ Updated
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  topSection: {
    paddingTop: 80,
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  phoneNumber: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  logoutSection: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  logoutButton: {
    backgroundColor: "#6237A0",
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectionSection: {
    marginTop: 40,
    paddingHorizontal: 30,
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  selectionIcon: {
    marginRight: 16,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
