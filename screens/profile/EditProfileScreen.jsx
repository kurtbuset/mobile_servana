import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaContainer, KeyboardAvoidingContainer, ScrollContainer } from '../../components/layout';
import ScreenHeader from '../../components/ScreenHeader';
import { ProfileForm, useProfileUpdate, extractProfileFormData, formatProfileData } from '../../features/profile';
import { selectProfileData } from '../../store/slices/profile';
import { validateProfileForm } from '../../shared/forms';

/**
 * Edit Profile Screen - Container Component
 * 
 * Handles both:
 * - Editing existing profile (user has name)
 * - Completing profile (user skipped name during signup)
 */
export default function EditProfileScreen() {
  const navigation = useNavigation();
  const profile = useSelector(selectProfileData);
  const { updateProfile, loading, error } = useProfileUpdate();

  const [formData, setFormData] = useState(extractProfileFormData(profile));
  const [errors, setErrors] = useState({});

  // Check if this is first-time profile completion
  const isCompletingProfile = !profile?.prof_firstname && !profile?.prof_lastname;

  useEffect(() => {
    if (profile) {
      setFormData(extractProfileFormData(profile));
    }
  }, [profile]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async () => {
    // Validate form
    const validation = validateProfileForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Format and submit
    const formatted = formatProfileData(formData);
    const result = await updateProfile(formatted);

    if (result.success) {
      const message = isCompletingProfile 
        ? 'Profile completed successfully!' 
        : 'Profile updated successfully!';
      
      Alert.alert('Success', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingContainer>
        <ScrollContainer>
          <View style={styles.container}>
            <ScreenHeader 
              title={isCompletingProfile ? "Complete Profile" : "Edit Profile"}
              onBack={() => navigation.goBack()} 
            />
            
            {isCompletingProfile && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Add your information to personalize your experience with our support team
                </Text>
              </View>
            )}
            
            <ProfileForm
              firstName={formData.firstName}
              middleName={formData.middleName}
              lastName={formData.lastName}
              address={formData.address}
              streetAddress={formData.streetAddress}
              regionInfo={formData.regionInfo}
              postalCode={formData.postalCode}
              birthdate={formData.birthdate}
              errors={errors}
              loading={loading}
              onFirstNameChange={(value) => handleFieldChange('firstName', value)}
              onMiddleNameChange={(value) => handleFieldChange('middleName', value)}
              onLastNameChange={(value) => handleFieldChange('lastName', value)}
              onAddressChange={(value) => handleFieldChange('address', value)}
              onStreetAddressChange={(value) => handleFieldChange('streetAddress', value)}
              onRegionInfoChange={(value) => handleFieldChange('regionInfo', value)}
              onPostalCodeChange={(value) => handleFieldChange('postalCode', value)}
              onBirthdatePress={() => {/* Show date picker */}}
              onSubmit={handleSave}
            />
          </View>
        </ScrollContainer>
      </KeyboardAvoidingContainer>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#F3F0FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  infoText: {
    fontSize: 14,
    color: '#7C3AED',
    lineHeight: 20,
    textAlign: 'center',
  },
});
