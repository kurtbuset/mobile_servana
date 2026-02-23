import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, StatusBar, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { setClient } from '../../store/slices/profile';
import SecureStorage from '../../utils/secureStorage';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'react-native-image-picker';

/**
 * Sign Up - Step 4: Profile Picture (Viber Style)
 */
export default function SignUpProfilePictureScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { client, token } = route.params;

  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    Alert.alert(
      'Select Photo',
      'Choose how you want to add your profile picture',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            ImagePicker.launchCamera(options, handleImageResponse);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            ImagePicker.launchImageLibrary(options, handleImageResponse);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.error('ImagePicker Error:', response.errorMessage);
      Alert.alert('Error', 'Failed to select image');
    } else if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setProfilePicture({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'profile.jpg',
      });
    }
  };

  const handleContinue = async () => {
    try {
      setUploading(true);

      await SecureStorage.setToken(token);
      await SecureStorage.setProfile({
        ...client,
        profile_picture: profilePicture?.uri || null,
      });

      dispatch(setClient({ 
        client: {
          ...client,
          prof_id: {
            ...client.prof_id,
            prof_picture: profilePicture?.uri || null,
          },
        },
      }));

      navigation.navigate('SignUpSuccess');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await SecureStorage.setToken(token);
      await SecureStorage.setProfile(client);
      dispatch(setClient({ client }));
      navigation.navigate('SignUpSuccess');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Skip Button */}
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              disabled={uploading}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Feather name="camera" size={40} color="#7C3AED" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Add Profile Picture</Text>
            <Text style={styles.subtitle}>
              Help others recognize you
            </Text>

            {/* Profile Picture */}
            <View style={styles.pictureContainer}>
              <TouchableOpacity
                style={styles.pictureButton}
                onPress={handleSelectImage}
                activeOpacity={0.8}
              >
                {profilePicture ? (
                  <Image source={{ uri: profilePicture.uri }} style={styles.picture} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Feather name="user" size={60} color="#CCC" />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Feather name="camera" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {profilePicture && (
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={handleSelectImage}
                >
                  <Text style={styles.changeText}>Change Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Continue Button */}
            <Button
              title={profilePicture ? 'Continue' : 'Skip for Now'}
              onPress={handleContinue}
              loading={uploading}
              size="large"
              style={styles.continueButton}
            />

            {/* Info Text */}
            <Text style={styles.infoText}>
              You can always add or change your profile picture later in settings
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  pictureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pictureButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    marginBottom: 16,
  },
  infoText: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
