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
  Animated,
  Easing,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
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

const { width, height } = Dimensions.get("window");

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Country Data
const rawCountries = [
  { label: "United States", code: "US", callingCode: "1" },
  { label: "Philippines", code: "PH", callingCode: "63" },
  { label: "United Kingdom", code: "GB", callingCode: "44" },
  { label: "Canada", code: "CA", callingCode: "1" },
  { label: "Australia", code: "AU", callingCode: "61" },
  { label: "New Zealand", code: "NZ", callingCode: "64" },
  { label: "India", code: "IN", callingCode: "91" },
  { label: "Singapore", code: "SG", callingCode: "65" },
  { label: "Malaysia", code: "MY", callingCode: "60" },
  { label: "Indonesia", code: "ID", callingCode: "62" },
  { label: "Thailand", code: "TH", callingCode: "66" },
  { label: "Japan", code: "JP", callingCode: "81" },
  { label: "South Korea", code: "KR", callingCode: "82" },
  { label: "China", code: "CN", callingCode: "86" },
  { label: "Germany", code: "DE", callingCode: "49" },
  { label: "France", code: "FR", callingCode: "33" },
  { label: "Spain", code: "ES", callingCode: "34" },
  { label: "Italy", code: "IT", callingCode: "39" },
  { label: "Brazil", code: "BR", callingCode: "55" },
  { label: "South Africa", code: "ZA", callingCode: "27" },
  { label: "United Arab Emirates", code: "AE", callingCode: "971" },
  { label: "Saudi Arabia", code: "SA", callingCode: "966" },
  { label: "Egypt", code: "EG", callingCode: "20" },
  { label: "Nigeria", code: "NG", callingCode: "234" },
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

  const [selectedCountry, setSelectedCountry] = useState(rawCountries[1]); // Philippines
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Set default to 20 years ago for better UX
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 20);
  const [birthdate, setBirthdate] = useState(defaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Animation values for floating blobs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blob animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob3Anim, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob3Anim, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
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
    // Validation
    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name");
      setShowErrorModal(true);
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("Please enter your last name");
      setShowErrorModal(true);
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter your phone number");
      setShowErrorModal(true);
      return;
    }
    if (!password) {
      setErrorMessage("Please enter a password");
      setShowErrorModal(true);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setShowErrorModal(true);
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
      setErrorMessage(error.response?.data?.error || "Something went wrong. Please try again.");
      setShowErrorModal(true);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: moderateScale(20), paddingBottom: verticalScale(30) }} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            {/* Animated background blobs */}
            <Animated.View
              style={[
                styles.blob1,
                {
                  transform: [
                    {
                      translateX: blob1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 30],
                      }),
                    },
                    {
                      translateY: blob1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -50],
                      }),
                    },
                    {
                      scale: blob1Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 0.9],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.blob2,
                {
                  transform: [
                    {
                      translateX: blob2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                    {
                      translateY: blob2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20],
                      }),
                    },
                    {
                      scale: blob2Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0.9, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.blob3,
                {
                  transform: [
                    {
                      translateX: blob3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 25],
                      }),
                    },
                    {
                      translateY: blob3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30],
                      }),
                    },
                    {
                      scale: blob3Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.05, 0.95],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Account</Text>
              <View style={{ width: moderateScale(40) }} />
            </View>

            <Text style={styles.subtitle}>Sign up to get started</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="user" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>First Name</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#848287" style={styles.icon} />
                  <TextInput
                    placeholder="Enter your first name"
                    placeholderTextColor="#848287"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.baseInput}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="user" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Last Name</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#848287" style={styles.icon} />
                  <TextInput
                    placeholder="Enter your last name"
                    placeholderTextColor="#848287"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.baseInput}
                  />
                </View>
              </View>

              {/* Birthdate - Simple Single Picker */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="calendar" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Birthdate</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.inputContainer}
                  activeOpacity={0.7}
                >
                  <Feather name="calendar" size={20} color="#848287" style={styles.icon} />
                  <Text style={styles.dateText}>{formatDate(birthdate)}</Text>
                  <Feather name="chevron-down" size={20} color="#848287" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              </View>

              {/* Single Native Date Picker */}
              {showDatePicker && (
                Platform.OS === 'ios' ? (
                  <Modal
                    visible={showDatePicker}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.datePickerModalOverlay}>
                      <View style={styles.datePickerModalContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.datePickerButton}>Cancel</Text>
                          </TouchableOpacity>
                          <Text style={styles.datePickerTitle}>Select Birthdate</Text>
                          <TouchableOpacity onPress={handleDateConfirm}>
                            <Text style={[styles.datePickerButton, { color: '#6237A0', fontWeight: '600' }]}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={birthdate}
                          mode="date"
                          display="spinner"
                          onChange={onChangeDate}
                          maximumDate={new Date()}
                          minimumDate={new Date(1924, 0, 1)}
                          textColor="#fff"
                          themeVariant="dark"
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={birthdate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                    minimumDate={new Date(1924, 0, 1)}
                  />
                )
              )}

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="phone" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                </View>
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
              </View>

              {/* Modal Picker - Improved UI */}
              <Modal visible={modalVisible} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Country</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setModalVisible(false);
                        setSearchQuery("");
                      }}
                      style={styles.closeButton}
                    >
                      <Feather name="x" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#6237A0" style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Search country, code or dial"
                      placeholderTextColor="#666"
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Feather name="x-circle" size={18} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.countryItem,
                          selectedCountry.code === item.code && styles.countryItemSelected
                        ]}
                        onPress={() => {
                          setSelectedCountry(item);
                          setModalVisible(false);
                          setSearchQuery("");
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.countryItemContent}>
                          <Text style={styles.countryFlag}>{getFlagEmoji(item.code)}</Text>
                          <View style={styles.countryInfo}>
                            <Text style={styles.countryText}>{item.label}</Text>
                            <Text style={styles.countryCode}>+{item.callingCode}</Text>
                          </View>
                        </View>
                        {selectedCountry.code === item.code && (
                          <Feather name="check" size={20} color="#6237A0" />
                        )}
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator2} />}
                    showsVerticalScrollIndicator={false}
                  />
                </SafeAreaView>
              </Modal>

              {/* Password */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="lock" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <Feather name="lock" size={20} color="#848287" style={styles.icon} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    placeholder="Enter your password"
                    placeholderTextColor="#848287"
                    style={styles.baseInput}
                  />
                  <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                    <Feather name={secureText ? "eye-off" : "eye"} size={22} color="#848287" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                style={[styles.signupButton, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.loadingText}>Creating account...</Text>
                  </View>
                ) : (
                  <View style={styles.signupButtonContent}>
                    <Text style={styles.signup}>Sign Up</Text>
                    <Feather name="arrow-right" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}> Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Modal */}
            <Modal
              visible={showErrorModal}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowErrorModal(false)}
              statusBarTranslucent={true}
            >
              <TouchableOpacity 
                style={styles.errorModalOverlay}
                activeOpacity={1}
                onPress={() => setShowErrorModal(false)}
              >
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.errorModalContainer}>
                    <View style={styles.errorIconContainer}>
                      <Feather name="alert-circle" size={40} color="#FF6B6B" />
                    </View>
                    <Text style={styles.errorModalTitle}>Oops!</Text>
                    <Text style={styles.errorModalMessage}>{errorMessage}</Text>
                    <TouchableOpacity
                      style={styles.errorModalButton}
                      onPress={() => setShowErrorModal(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.errorModalButtonText}>Got it</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    position: "relative",
    overflow: "hidden",
  },
  // Animated blob styles
  blob1: {
    position: "absolute",
    top: verticalScale(-100),
    right: scale(-100),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: "#6237A0",
    opacity: 0.15,
  },
  blob2: {
    position: "absolute",
    bottom: verticalScale(-120),
    left: scale(-120),
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    backgroundColor: "#8B5CF6",
    opacity: 0.12,
  },
  blob3: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: "#A78BFA",
    opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(98, 55, 160, 0.2)",
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(24, 0.3),
    fontWeight: "700",
  },
  subtitle: {
    color: "#888",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(30),
    zIndex: 10,
  },
  formContainer: {
    zIndex: 10,
    paddingBottom: verticalScale(30),
  },
  inputGroup: {
    width: "100%",
    marginBottom: verticalScale(15),
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
    gap: moderateScale(6),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: "#848287",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    height: verticalScale(50),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444148",
  },
  baseInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    paddingVertical: verticalScale(10),
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    flex: 1,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: moderateScale(8),
  },
  flagText: {
    color: "#fff",
    fontSize: moderateScale(16),
    marginRight: moderateScale(4),
  },
  separator: {
    width: 1,
    height: verticalScale(18),
    backgroundColor: "#5E5C63",
    marginRight: moderateScale(8),
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#444148",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(50),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444148",
  },
  icon: {
    marginRight: moderateScale(10),
  },
  eyeIcon: {
    marginLeft: moderateScale(10),
  },
  signupButton: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    marginTop: verticalScale(25),
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  signupButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  signup: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  loadingText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  loginText: {
    color: "#888",
    fontSize: moderateScale(14),
  },
  loginLink: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#1F1B24",
    paddingTop: verticalScale(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontWeight: "700",
  },
  closeButton: {
    padding: moderateScale(5),
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2730",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(15),
    marginHorizontal: moderateScale(20),
    marginVertical: verticalScale(15),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: "#3A3740",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: moderateScale(15),
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: "#1F1B24",
  },
  countryItemSelected: {
    backgroundColor: "rgba(98, 55, 160, 0.1)",
  },
  countryItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countryFlag: {
    fontSize: moderateScale(28),
    marginRight: moderateScale(15),
  },
  countryInfo: {
    flex: 1,
  },
  countryText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
    marginBottom: verticalScale(2),
  },
  countryCode: {
    color: "#888",
    fontSize: moderateScale(13),
  },
  separator2: {
    height: 1,
    backgroundColor: "#2A2730",
    marginLeft: moderateScale(65),
  },
  // iOS Date Picker Modal Styles
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  datePickerModalContainer: {
    backgroundColor: "#2A2730",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#3A3740",
  },
  datePickerTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  datePickerButton: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(30),
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  errorModalContainer: {
    backgroundColor: "#2A2730",
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: "center",
    width: "100%",
    maxWidth: moderateScale(320),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  errorIconContainer: {
    marginBottom: verticalScale(12),
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: moderateScale(40),
    padding: moderateScale(12),
  },
  errorModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#fff",
    marginBottom: verticalScale(8),
  },
  errorModalMessage: {
    fontSize: moderateScale(14),
    color: "#B8B8B8",
    textAlign: "center",
    marginBottom: verticalScale(18),
    lineHeight: moderateScale(20),
    paddingHorizontal: moderateScale(5),
  },
  errorModalButton: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(35),
    width: "100%",
    alignItems: "center",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(6),
    elevation: 5,
  },
  errorModalButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});
