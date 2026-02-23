import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaContainer, KeyboardAvoidingContainer, ScrollContainer } from '../../components/layout';
import { Button, PasswordInput } from '../../components/ui';
import { authAPI } from '../../shared/api';
import { validateChangePasswordForm } from '../../shared/forms';
import { useMutation } from '../../hooks/data';
import ScreenHeader from '../../components/ScreenHeader';

/**
 * Change Password Screen - Container Component
 */
export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { mutate, loading } = useMutation(authAPI.changePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validate form
    const validation = validateChangePasswordForm({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit
    const result = await mutate(currentPassword, newPassword);

    if (result.success) {
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to change password');
    }
  };

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingContainer>
        <ScrollContainer>
          <ScreenHeader 
              title="Change Password" 
              onBack={() => navigation.goBack()} 
            />
          <View style={styles.container}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Enter your current password and choose a new one
            </Text>

            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              error={errors.currentPassword}
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              error={errors.newPassword}
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              error={errors.confirmPassword}
            />

            <Button
              title="Change Password"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    marginTop: 24,
  },
});
