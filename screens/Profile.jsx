import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { clearCompleteSession } from "../utils/secureLogout";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

export default function ProfileScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.data);

  // Load profile picture on mount and when client data changes
  useEffect(() => {
    loadProfilePicture();
  }, [client]);

  // Also reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfilePicture();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfilePicture = async () => {
    try {
      console.log('🔍 Loading profile picture...');
      console.log('Client data:', client);
      
      // Priority 1: Check Redux store for profile picture
      if (client?.prof_id?.prof_picture) {
        console.log('✅ Found in Redux:', client.prof_id.prof_picture);
        setImage(client.prof_id.prof_picture);
        setLoading(false);
        return;
      } 
      
      // Priority 2: Check SecureStorage
      const SecureStorage = require('../utils/secureStorage').default;
      const profile = await SecureStorage.getProfile();
      console.log('SecureStorage profile:', profile);
      
      if (profile?.profile_picture) {
        console.log('✅ Found in SecureStorage:', profile.profile_picture);
        setImage(profile.profile_picture);
      } else {
        console.log('⚠️ No profile picture found, using default');
        setImage(null);
      }
    } catch (error) {
      console.error('❌ Error loading profile picture:', error);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setToastMessage("Permission to access media library is required");
      setShowToast(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploadingImage(true);
      const newImage = result.assets[0].uri;
      
      console.log('📸 New image selected:', newImage);
      
      // Update UI immediately
      setImage(newImage);
      
      try {
        // Save to SecureStorage
        const SecureStorage = require('../utils/secureStorage').default;
        const profile = await SecureStorage.getProfile();
        if (profile) {
          profile.profile_picture = newImage;
          await SecureStorage.setProfile(profile);
          console.log('✅ Saved to SecureStorage');
        }
        
        // Update Redux store
        if (client) {
          const { setClient } = require('../slices/clientSlice');
          const updatedClient = {
            ...client,
            prof_id: {
              ...client.prof_id,
              prof_picture: newImage,
            }
          };
          dispatch(setClient({ client: updatedClient }));
          console.log('✅ Updated Redux store');
        }
        
        // Show success toast
        setToastMessage("Profile picture updated successfully");
        setShowToast(true);
      } catch (error) {
        console.error('❌ Error saving profile picture:', error);
        setToastMessage("Failed to update profile picture");
        setShowToast(true);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const getDisplayName = () => {
    const firstName = client?.prof_id?.prof_firstname || '';
    const lastName = client?.prof_id?.prof_lastname || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'User';
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await clearCompleteSession(dispatch);
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6237A0" />
                </View>
              ) : (
                <Image
                  source={image ? { uri: image } : require("../assets/userblank.jpg")}
                  style={styles.profileImage}
                />
              )}
              <View style={styles.cameraIconContainer}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="camera" size={18} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.phoneNumber}>
            {client?.client_country_code || ''} {client?.client_number || ''}
          </Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("MyProfile")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0E6FF' }]}>
                <Feather name="user" size={22} color="#6237A0" />
              </View>
              <Text style={styles.menuItemText}>My Profile</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ChangePassword")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE6E6' }]}>
                <Feather name="lock" size={22} color="#E63946" />
              </View>
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmColor="#E63946"
        icon="log-out"
        iconColor="#E63946"
      />

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  profileSection: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  loadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#F0E6FF",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6237A0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    backgroundColor: "#6237A0",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
