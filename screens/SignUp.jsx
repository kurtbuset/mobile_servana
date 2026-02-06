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
  Modal,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import {
  parsePhoneNumberFromString,
  getExampleNumber,
} from "libphonenumber-js";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../slices/userSlice";
import { ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

// Country Data
const rawCountries = [
  { label: "US +1", code: "US", callingCode: "1" },
  { label: "PH +63", code: "PH", callingCode: "63" },
  { label: "GB +44", code: "GB", callingCode: "44" },
  { label: "CA +1", code: "CA", callingCode: "1" },
  { label: "AU +61", code: "AU", callingCode: "61" },
  { label: "NZ +64", code: "NZ", callingCode: "64" },
  { label: "IN +91", code: "IN", callingCode: "91" },
  { label: "SG +65", code: "SG", callingCode: "65" },
  { label: "MY +60", code: "MY", callingCode: "60" },
  { label: "ID +62", code: "ID", callingCode: "62" },
  { label: "TH +66", code: "TH", callingCode: "66" },
  { label: "JP +81", code: "JP", callingCode: "81" },
  { label: "KR +82", code: "KR", callingCode: "82" },
  { label: "CN +86", code: "CN", callingCode: "86" },
  { label: "DE +49", code: "DE", callingCode: "49" },
  { label: "FR +33", code: "FR", callingCode: "33" },
  { label: "ES +34", code: "ES", callingCode: "34" },
  { label: "IT +39", code: "IT", callingCode: "39" },
  { label: "BR +55", code: "BR", callingCode: "55" },
  { label: "ZA +27", code: "ZA", callingCode: "27" },
  { label: "AE +971", code: "AE", callingCode: "971" },
  { label: "SA +966", code: "SA", callingCode: "966" },
  { label: "EG +20", code: "EG", callingCode: "20" },
  { label: "NG +234", code: "NG", callingCode: "234" },
];

const formatDate = (date) => date.toISOString().split("T")[0];

const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

import API_URL from '../config/api';

const SignUp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [selectedCountry, setSelectedCountry] = useState(rawCountries[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthdate(selectedDate);
  };

  const handlePhoneChange = (text) => {
    const digitsOnly = text.replace(/\D/g, "");
    try {
      const example = getExampleNumber(selectedCountry.code, "mobile");
      const maxLength = example?.nationalNumber?.length || 10;
      if (digitsOnly.length <= maxLength) setPhoneNumber(digitsOnly);
    } catch {
      if (digitsOnly.length <= 15) setPhoneNumber(digitsOnly);
    }
  };

  const filteredCountries = rawCountries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      country.callingCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  const handleSignUp = async () => {
    if (!phoneNumber.trim()) {
      console.error("Error", "Please enter a valid phone number");
      return;
    }
    if (!password) {
      console.error("Error", "Please fill out all password fields");
      return;
    }

    dispatch(setLoading(true));

    try {
      const signUpData = {
        profile: {
          firstName,
          lastName,
          birthdate: formatDate(birthdate),
        },
        auth: {
          client_country_code: `+${selectedCountry.callingCode}`,
          client_number: phoneNumber,
          password,
        },
      };

      const { data } = await axios.post(`${API_URL}/clientAccount/auth/send-otp`, {
        phone_country_code: `+${selectedCountry.callingCode}`,
        phone_number: phoneNumber,
      });

      console.log("Success", data.message);
      navigation.navigate("SignUpVerification", {
        phone_country_code: `+${selectedCountry.callingCode}`,
        phone_number: phoneNumber,
        password,
        firstName,
        lastName,
        birthdate: formatDate(birthdate),
      });

    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1B24", paddingHorizontal: 16 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Feather name="arrow-left" size={25} color="#848287" />
                <Text style={{ color: "#fff", fontSize: 20, marginLeft: 8 }}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={{ marginTop: 60 }}>
              {/* First Name */}
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#848287"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.baseInput}
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#848287"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.baseInput}
                />
              </View>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={birthdate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}
              <View style={styles.inputContainer}>
                <Feather name="calendar" size={20} color="#848287" style={styles.icon} />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                  <Text style={styles.dateText}>{formatDate(birthdate)}</Text>
                </TouchableOpacity>
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.countryPicker}>
                  <Text style={styles.flagText}>
                    {getFlagEmoji(selectedCountry.code)} +{selectedCountry.callingCode}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#848287" />
                </TouchableOpacity>
                <View style={styles.separator} />
                <TextInput
                  placeholder="Phone Number"
                  placeholderTextColor="#848287"
                  keyboardType="phone-pad"
                  value={phoneNumber || ""}
                  onChangeText={handlePhoneChange}
                  style={styles.baseInput}
                />
              </View>

              {/* Modal Picker */}
              <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                  <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Search country, code or dial"
                      placeholderTextColor="#aaa"
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryItem}
                        onPress={() => {
                          setSelectedCountry(item);
                          setModalVisible(false);
                          setSearchQuery("");
                        }}
                      >
                        <Text style={styles.countryText}>{getFlagEmoji(item.code)} {item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </SafeAreaView>
              </Modal>

              {/* Password */}
              <View style={styles.passwordContainer}>
                <Feather name="lock" size={20} color="#848287" style={styles.icon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  placeholder="Password"
                  placeholderTextColor="#848287"
                  style={styles.baseInput}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                  <Feather name={secureText ? "eye-off" : "eye"} size={22} color="#848287" />
                </TouchableOpacity>
              </View>


              {/* Sign Up */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#4A3A6A" : "#6237A0",
                  borderRadius: 10,
                  padding: 16,
                  marginTop: 38,
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signup}>Sign Up</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    alignItems: "center",
    marginBottom: 20,
  },
  baseInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  flagText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 4,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: "#5E5C63",
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1F1B24",
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  countryItem: {
    paddingVertical: 12,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  countryText: {
    color: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  signup: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
