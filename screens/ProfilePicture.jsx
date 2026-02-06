import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useDispatch } from "react-redux";

import SecureStorage from "../utils/secureStorage";
import useSecureToken from "../hooks/useSecureToken";
import AnimatedBackground from "../components/AnimatedBackground";
import ErrorModal from "../components/ErrorModal";
import ScreenHeader from "../components/ScreenHeader";
import API_URL from "../config/api";
import { setClient } from "../slices/clientSlice";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export default function ProfilePicture() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { client_id, client } = route.params || {};
  const { token } = useSecureToken();
  
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Animation for image preview
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (image) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [image]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setErrorMessage("Permission to access media library is required to upload a profile picture");
        setShowErrorModal(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setErrorMessage("Failed to pick image. Please try again.");
      setShowErrorModal(true);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        setErrorMessage("Permission to access camera is required to take a photo");
        setShowErrorModal(true);
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
    } catch (error) {
      console.error("Error taking photo:", error);
      setErrorMessage("Failed to take photo. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleSkip = () => {
    navigation.navigate("SetupComplete", { client: client || { client_id } });
  };

  const handleContinue = async () => {
    if (!image) {
      setErrorMessage("Please select an image or skip this step");
      setShowErrorModal(true);
      return;
    }

    try {
      setUploading(true);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profile_picture', {
        uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
        name: filename,
        type: type,
      });
      formData.append('client_id', client_id);

      // Upload to backend
      const response = await axios.post(
        `${API_URL}/clientAccount/profile/picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update local storage with new profile picture URL
      const profile = await SecureStorage.getProfile();
      if (profile) {
        profile.profile_picture = response.data.profile_picture_url || image;
        await SecureStorage.setProfile(profile);
      }

      // Update Redux store with new profile picture
      if (client) {
        const updatedClient = {
          ...client,
          prof_id: {
            ...client.prof_id,
            prof_picture: response.data.profile_picture_url || image,
          }
        };
        dispatch(setClient({ client: updatedClient }));
      }

      console.log('✅ Profile picture uploaded successfully');
      navigation.navigate("SetupComplete", { client: client || { client_id } });

    } catch (error) {
      console.error("Profile picture upload error:", error);
      
      // If backend endpoint doesn't exist yet, save locally
      if (error.response?.status === 404) {
        try {
          const profile = await SecureStorage.getProfile();
          if (profile) {
            profile.profile_picture = image;
            await SecureStorage.setProfile(profile);
          }
          
          // Update Redux store even if backend fails
          if (client) {
            const updatedClient = {
              ...client,
              prof_id: {
                ...client.prof_id,
                prof_picture: image,
              }
            };
            dispatch(setClient({ client: updatedClient }));
          }
          
          console.log('⚠️ Backend endpoint not ready, saved locally');
          navigation.navigate("SetupComplete", { client: client || { client_id } });
        } catch (localError) {
          setErrorMessage("Failed to save profile picture");
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage(
          error.response?.data?.error || "Failed to upload profile picture. Please try again."
        );
        setShowErrorModal(true);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: moderateScale(20), paddingBottom: verticalScale(30) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AnimatedBackground />

          <ScreenHeader 
            title="Profile Picture" 
            onBack={() => navigation.goBack()} 
          />

          <View style={styles.content}>
            {/* Icon Container */}
            <View style={styles.iconHeaderContainer}>
              <View style={styles.iconCircle}>
                <Feather name="image" size={moderateScale(40)} color="#6237A0" />
              </View>
            </View>

            <Text style={styles.title}>Add Profile Picture</Text>
            <Text style={styles.subtitle}>
              Choose a photo that represents you{'\n'}
              You can always change it later
            </Text>

            {/* Image Preview with Animation */}
            <Animated.View 
              style={[
                styles.imageContainer,
                image && { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <TouchableOpacity 
                onPress={pickImage} 
                style={styles.imageWrapper}
                activeOpacity={0.8}
              >
                {image ? (
                  <>
                    <Image
                      source={{ uri: image }}
                      style={styles.profileImage}
                    />
                    <View style={styles.imageOverlay}>
                      <Feather name="edit-2" size={moderateScale(24)} color="#fff" />
                    </View>
                  </>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <View style={styles.placeholderIconWrapper}>
                      <Feather name="user" size={moderateScale(40)} color="#6237A0" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={pickImage} 
                style={styles.secondaryButton}
                activeOpacity={0.7}
              >
                <View style={styles.buttonIconContainer}>
                  <Feather name="image" size={22} color="#6237A0" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
                  <Text style={styles.buttonSubtext}>Select from your photos</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={takePhoto} 
                style={styles.secondaryButton}
                activeOpacity={0.7}
              >
                <View style={styles.buttonIconContainer}>
                  <Feather name="camera" size={22} color="#6237A0" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.secondaryButtonText}>Take Photo</Text>
                  <Text style={styles.buttonSubtext}>Use your camera</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Continue and Skip Buttons */}
            <View style={styles.actionContainer}>
              {image && (
                <TouchableOpacity 
                  onPress={handleContinue} 
                  style={[styles.primaryButton, uploading && { opacity: 0.7 }]}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.primaryButtonText}>Uploading...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.primaryButtonText}>Continue</Text>
                      <Feather name="arrow-right" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={handleSkip} 
                style={styles.skipButton}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ErrorModal
            visible={showErrorModal}
            message={errorMessage}
            onClose={() => setShowErrorModal(false)}
            title="Notice"
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    marginTop: verticalScale(10),
    zIndex: 10,
  },
  iconHeaderContainer: {
    alignItems: "center",
    marginBottom: verticalScale(20),
    zIndex: 10,
  },
  iconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: "rgba(98, 55, 160, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(98, 55, 160, 0.3)",
  },
  title: {
    color: "#fff",
    fontSize: moderateScale(26, 0.3),
    fontWeight: "700",
    marginBottom: verticalScale(10),
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(35),
    textAlign: "center",
    paddingHorizontal: moderateScale(20),
    lineHeight: moderateScale(20),
  },
  imageContainer: {
    marginBottom: verticalScale(35),
  },
  imageWrapper: {
    position: "relative",
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(80),
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#6237A0",
    backgroundColor: "#2A2730",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(12),
    elevation: 8,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2730",
  },
  placeholderIconWrapper: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: "rgba(98, 55, 160, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: verticalScale(12),
    marginBottom: verticalScale(30),
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2730",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
    borderWidth: 2,
    borderColor: "#3A3740",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  buttonIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "rgba(98, 55, 160, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  buttonTextContainer: {
    flex: 1,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginBottom: verticalScale(2),
  },
  buttonSubtext: {
    color: "#888",
    fontSize: moderateScale(12),
    fontWeight: "400",
  },
  actionContainer: {
    width: "100%",
    gap: verticalScale(15),
    marginTop: "auto",
  },
  primaryButton: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(10),
  },
  skipButton: {
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
  },
  skipButtonText: {
    color: "#888",
    fontSize: moderateScale(16),
    fontWeight: "600",
    textAlign: "center",
  },
});

