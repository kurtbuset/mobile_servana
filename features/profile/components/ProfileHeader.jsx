import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '../../../components/ui';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Profile Header Component
 */
export const ProfileHeader = ({
  profile,
  onEditPress,
  onImagePress,
  editable = true,
}) => {
  const fullName = profile
    ? `${profile.prof_firstname || ''} ${profile.prof_lastname || ''}`.trim()
    : 'User';

  const imageSource = profile?.prof_picture
    ? { uri: profile.prof_picture }
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onImagePress}
        disabled={!editable}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar source={imageSource} name={fullName} size="xlarge" />
          {editable && (
            <View style={styles.editBadge}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.name}>{fullName}</Text>

      {profile?.prof_address && (
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location}>{profile.prof_address}</Text>
        </View>
      )}

      {editable && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={16} color="#6C5CE7" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C5CE7',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C5CE7',
    marginLeft: 6,
  },
});

export default ProfileHeader;
