import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PersonalInformation() {
  const navigation = useNavigation();
  const route = useRoute();
  const { client_id, token } = route.params || {};

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [streetAddress, setStreetAddress] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleContinue = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!middleName.trim()) {
      Alert.alert("Error", "Please enter your middle name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!streetAddress.trim()) {
      Alert.alert("Error", "Please enter street name and house number");
      return;
    }
    if (!postalCode.trim()) {
      Alert.alert("Error", "Please enter postal code");
      return;
    }

    try {
      const profileData = {
        client_id,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        birthdate: formatDate(birthdate),
        address: {
          streetAddress: streetAddress.trim(),
          address: address.trim(),
          region: region.trim(),
          postal_code: postalCode.trim(),
        },
      };

      const authToken = token || (await AsyncStorage.getItem("token"));
      const response = await axios.post(
        `${BASE_URL}/client/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Save profile data to AsyncStorage
      await AsyncStorage.setItem("profile", JSON.stringify(response.data.profile));

      navigation.navigate("ProfilePicture", {
        client_id,
        token: authToken,
      });
    } catch (error) {
      console.error("Profile save error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to save profile information"
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1B24", paddingHorizontal: 16 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Feather name="arrow-left" size={25} color="#848287" />
                <Text style={{ color: "#fff", fontSize: 20, marginLeft: 8 }}>
                  Personal Information
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={{ marginTop: 40 }}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              {/* Name */}
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#848287"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Middle Name"
                  placeholderTextColor="#848287"
                  value={middleName}
                  onChangeText={setMiddleName}
                  style={styles.input}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#848287"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#848287"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Birthdate */}
              <View style={styles.inputContainer}>
                <Feather name="calendar" size={20} color="#848287" style={styles.icon} />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateText}>
                    {formatDate(birthdate)}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={birthdate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Address</Text>

              {/* Street Name */}
              <View style={styles.inputContainer}>
                <Feather name="map-pin" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Street Name"
                  placeholderTextColor="#848287"
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="map-pin" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Address"
                  placeholderTextColor="#848287"
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                />
              </View>

              {/* Region */}
              <View style={styles.inputContainer}>
                <Feather name="map" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Region"
                  placeholderTextColor="#848287"
                  value={region}
                  onChangeText={setRegion}
                  style={styles.input}
                />
              </View>



              {/* Postal Code */}
              <View style={styles.inputContainer}>
                <Feather name="hash" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Postal Code"
                  placeholderTextColor="#848287"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity onPress={handleContinue} style={styles.button}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 5,
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#9140DD",
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});