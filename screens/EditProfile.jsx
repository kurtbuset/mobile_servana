import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform
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
  const { token } = useSecureToken(); // Get token from SecureStorage, not Redux
  const dispatch = useDispatch();
  console.log(client)
  const [firstName, setFirstName] = useState(client?.prof_id?.prof_firstname || '');
  const [middleName, setMiddleName] = useState(client?.prof_id?.prof_middlename || '');
  const [lastName, setLastName] = useState(client?.prof_id?.prof_lastname || '');
  const [address, setAddress] = useState(client?.prof_id?.prof_address || '');
  const [streetAddress, setStreetAddress] = useState(client?.prof_id?.prof_street_address || '');
  const [regionInfo, setRegionInfo] = useState(client?.prof_id?.prof_region_info || '');
  const [postalCode, setPostalCode] = useState(client?.prof_id?.prof_postal_code || '');
  const [birthdate, setBirthdate] = useState(client?.prof_id?.prof_date_of_birth || '');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleSave = async () => {
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
            prof_id: data.profile // <-- data.profile is from backend
          }
          // Token no longer stored in Redux for security
        }));

        alert('Profile updated successfully!');
        navigation.goBack();
      } else {
        alert(data.message || 'Failed to update profile');
        console.error('Update error:', data);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating profile');
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    const formatted = date.toISOString().split('T')[0]; // YYYY-MM-DD
    setBirthdate(formatted);
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Image and Edit Button */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/userblank.jpg')}
            style={styles.profileImage}
          />
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
          <InputField label="Middle Name" value={middleName} onChangeText={setMiddleName} />
          <InputField label="Last Name" value={lastName} onChangeText={setLastName} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthdate</Text>
            <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
              <Text style={styles.dateText}>{birthdate || 'Select your birthdate'}</Text>
              <Feather name="calendar" size={20} color="#6237A0" />
            </TouchableOpacity>
          </View>

          <InputField label="Street Address" value={streetAddress} onChangeText={setStreetAddress} />
          <InputField label="Address" value={address} onChangeText={setAddress} />
          <InputField label="Region Info" value={regionInfo} onChangeText={setRegionInfo} />
          <InputField label="Postal Code" value={postalCode} onChangeText={setPostalCode} />
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
}

function InputField({ label, placeholder, value, onChangeText }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  saveText: {
    fontSize: 16,
    color: '#8a2be2',
    fontWeight: '500',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  imageContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  editPhotoText: {
    color: '#8a2be2',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  formContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
  },
  dateInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

