import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button } from '../../../components/ui';

/**
 * Profile Edit Form Component
 */
export const ProfileForm = ({
  firstName,
  middleName,
  lastName,
  address,
  streetAddress,
  regionInfo,
  postalCode,
  birthdate,
  errors,
  loading,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  onAddressChange,
  onStreetAddressChange,
  onRegionInfoChange,
  onPostalCodeChange,
  onBirthdatePress,
  onSubmit,
}) => {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="First Name *"
        value={firstName}
        onChangeText={onFirstNameChange}
        placeholder="Enter first name"
        error={errors?.firstName}
      />

      <Input
        label="Middle Name"
        value={middleName}
        onChangeText={onMiddleNameChange}
        placeholder="Enter middle name (optional)"
      />

      <Input
        label="Last Name"
        value={lastName}
        onChangeText={onLastNameChange}
        placeholder="Enter last name (optional)"
        error={errors?.lastName}
      />

      <Input
        label="Date of Birth"
        value={formatDisplayDate(birthdate)}
        placeholder="Select date of birth"
        editable={false}
        onPress={onBirthdatePress}
      />

      <Input
        label="Address"
        value={address}
        onChangeText={onAddressChange}
        placeholder="Enter address"
      />

      <Input
        label="Street Address"
        value={streetAddress}
        onChangeText={onStreetAddressChange}
        placeholder="Enter street address"
      />

      <Input
        label="Region"
        value={regionInfo}
        onChangeText={onRegionInfoChange}
        placeholder="Enter region"
      />

      <Input
        label="Postal Code"
        value={postalCode}
        onChangeText={onPostalCodeChange}
        placeholder="Enter postal code"
        keyboardType="number-pad"
        error={errors?.postalCode}
      />

      <Button
        title="Save Changes"
        onPress={onSubmit}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
});

export default ProfileForm;
