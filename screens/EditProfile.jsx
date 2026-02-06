import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setClient } from '../slices/clientSlice';
import useSecureToken from '../hooks/useSecureToken';

import API_URL from '../config/api';

export default function EditProfile() { 
  const navigation = useNavigation();
  const client = useSelector((state) => state.client.data);
  const { token } = useSecureToken();
  const dispatch = useDispatch();
  
  const [firstName, setFirstName] = useState(client?.prof_id?.prof_firstname || '');
  const [middleName, setMiddleName] = useState(client?.prof_id?.prof_middlename || '');
  const [lastName, setLastName] = useState(client?.prof_id?.prof_lastname || '');
  const [address, setAddress] = useState(client?.prof_id?.prof_address || '');
  const [streetAddress, setStreetAddress] = useState(client?.prof_id?.prof_street_address || '');
  const [regionInfo, setRegionInfo] = useState(client?.prof_id?.prof_region_info || '');
  const [postalCode, setPostalCode] = useState(client?.prof_id?.prof_postal_code || '');
  const [birthdate, setBirthdate] = useState(client?.prof_id?.prof_date_of_birth || '');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    loadProfilePicture();
  }, [client]);

  const loadProfilePicture = async () => {
    try {
      if (client?.prof_id?.prof_picture) {
        setImage(client.prof_id.prof_picture);
      } else {
        const SecureStorage = require('../utils/secureStorage').default;
        const profile = await SecureStorage.getProfile();
        if (profile?.profile_picture) {
          setImage(profile.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Required Fields', 'First name and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/clientAccount/${client?.prof_id?.prof_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prof_firstname: firstName,
          prof_middlename: middleName,
          prof_lastname: lastName,
          prof_address: address,
          prof_street_address: streetAddress,
          prof_region_info: regionInfo,
          prof_postal_code: postalCode,
          prof_date_of_birth: birthdate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(setClient({
          client: {
            ...client,
            prof_id: data.profile
          }
        }));

        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
        console.error('Update error:', data);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    const formatted = date.toISOString().split('T')[0];
    setBirthdate(formatted);
    hideDatePicker();
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          activeOpacity={0.7}
          style={styles.saveButtonContainer}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.saveText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <Image
            source={image ? { uri: image } : require('../assets/userblank.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editPhotoButton} activeOpacity={0.7}>
            <Feather name="camera" size={16} color="#6237A0" />
            <Text style={styles.editPhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={18} color="#6237A0" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.card}>
            <InputField 
              label="First Name *" 
              value={firstName} 
              onChangeText={setFirstName}
              focused={focusedInput === 'firstName'}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
            <InputField 
              label="Middle Name" 
              value={middleName} 
              onChangeText={setMiddleName}
              focused={focusedInput === 'middleName'}
              onFocus={() => setFocusedInput('middleName')}
              onBlur={() => setFocusedInput(null)}
            />
            <InputField 
              label="Last Name *" 
              value={lastName} 
              onChangeText={setLastName}
              focused={focusedInput === 'lastName'}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthdate</Text>
              <TouchableOpacity style={styles.dateInput} onPress={showDatePicker} activeOpacity={0.7}>
                <Text style={[styles.dateText, !birthdate && styles.dateTextPlaceholder]}>
                  {formatDisplayDate(birthdate) || 'Select your birthdate'}
                </Text>
                <Feather name="calendar" size={20} color="#6237A0" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color="#6237A0" />
            <Text style={styles.sectionTitle}>Address Information</Text>
          </View>
          <View style={styles.card}>
            <InputField 
              label="Street Address" 
              value={streetAddress} 
              onChangeText={setStreetAddress}
              focused={focusedInput === 'streetAddress'}
              onFocus={() => setFocusedInput('streetAddress')}
              onBlur={() => setFocusedInput(null)}
            />
            <InputField 
              label="Region, Province, City" 
              value={regionInfo} 
              onChangeText={setRegionInfo}
              focused={focusedInput === 'regionInfo'}
              onFocus={() => setFocusedInput('regionInfo')}
              onBlur={() => setFocusedInput(null)}
            />
            <InputField 
              label="Postal Code" 
              value={postalCode} 
              onChangeText={setPostalCode}
              keyboardType="numeric"
              focused={focusedInput === 'postalCode'}
              onFocus={() => setFocusedInput('postalCode')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
      />
    </View>
  );
}

function InputField({ label, placeholder, value, onChangeText, keyboardType, focused, onFocus, onBlur }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
    color: '#1A1A1A',
  },
  saveButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6237A0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  imageSection: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#F0E6FF',
  },
  editPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0E6FF',
    borderRadius: 20,
  },
  editPhotoText: {
    color: '#6237A0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#1A1A1A',
  },
  inputFocused: {
    borderColor: '#6237A0',
    backgroundColor: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  dateText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateTextPlaceholder: {
    color: '#999',
  },
});

