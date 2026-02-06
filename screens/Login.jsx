import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TextInput,
  Platform,
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
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import {
  parsePhoneNumberFromString,
  getExampleNumber,
} from "libphonenumber-js";
import { ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { setClient, clearClient } from "../slices/clientSlice";
import SecureStorage from "../utils/secureStorage";
import { clearCompleteSession } from "../utils/secureLogout";

const { width, height } = Dimensions.get("window");

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

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

const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};
// const API_URL = "http://192.168.137.1:5000"; // Replace with your backend URL
import API_URL from '../config/api';

export default function Login() {
  const dispatch = useDispatch()
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    rawCountries.find((c) => c.code === "PH") || rawCountries[0]
  );
  // PH
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Animation values for floating blobs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blob 1 animation
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

    // Blob 2 animation
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

    // Blob 3 animation
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

  const handleLogin = async () => {
    if (!phoneNumber?.trim() || !password?.trim()) {
      if (!phoneNumber?.trim() && !password?.trim()) {
        setErrorMessage("Phone number and password are required to login");
      } else if (!phoneNumber?.trim()) {
        setErrorMessage("Please enter your phone number to continue");
      } else {
        setErrorMessage("Please enter your password to continue");
      }
      setShowErrorModal(true);
      return;
    }

    // console.log(selectedCountry.code)
    // console.log(phoneNumber)
    // console.log(password)

    setLoading(true); // 🔄 start loading

    try {
      // Clear any existing session data before login
      await clearCompleteSession(dispatch);
      
      const response = await fetch(`${API_URL}/clientAccount/logincl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // client_country_code: selectedCountry.code,
          client_country_code: `+${selectedCountry.callingCode}`,
          client_number: phoneNumber,
          client_password: password,
        }),
      });


      const result = await response.json();


      if (!response.ok) {
        const errorMsg = result.error || "Unable to login. Please check your credentials and try again.";
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        return;
      }

      await SecureStorage.setToken(result.token);
      
      // Display token in console
      console.log("🔐 Token stored in SecureStorage:", result.token);
      
      // Restore profile picture from SecureStorage if it exists
      const profile = await SecureStorage.getProfile();
      if (profile?.profile_picture && result.client?.prof_id) {
        result.client.prof_id.prof_picture = profile.profile_picture;
        console.log('📸 Profile picture restored from SecureStorage after login');
      }
      
      // Clear and recreate socket with new token
      const { clearSocket } = require('../socket');
      clearSocket(); // Clear old socket
      console.log('🔌 Socket cleared after login, will be recreated with new token');
      
      dispatch(setClient({ client: result.client })); // Token no longer passed to Redux

      navigation.navigate("HomeScreen");
    } catch (error) {
      setErrorMessage("Network error. Please check your internet connection and try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false); // ✅ stop loading (always)
    }
  };

  const handlePhoneChange = (text) => {
    const digitsOnly = text.replace(/\D/g, "");
    try {
      const example = getExampleNumber(selectedCountry.code, "mobile");
      const maxLength = example?.nationalNumber?.length || 10;
      if (digitsOnly.length <= maxLength) {
        setPhoneNumber(digitsOnly);
      }
    } catch {
      if (digitsOnly.length <= 15) {
        setPhoneNumber(digitsOnly);
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredCountries = rawCountries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      country.callingCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1B24" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(30) }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
              <View style={styles.container}>
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

              {/* Logo with glow effect (static) */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/icon.png")}
                  resizeMode="contain"
                  style={styles.logo}
                />
              </View>
              <Text style={styles.title}>servana</Text>

              {/* Phone Number Input with label and icon */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="phone" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.countryPicker}
                  >
                    <Text style={styles.flagText}>
                      {getFlagEmoji(selectedCountry.code)} +
                      {selectedCountry.callingCode}
                    </Text>
                    <Feather name="chevron-down" size={18} color="#848287" />
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TextInput
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="Phone Number"
                    placeholderTextColor="#848287"
                    keyboardType="phone-pad"
                    style={styles.phoneInput}
                  />
                </View>
              </View>

              {/* Country Modal with Search - Improved UI */}
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
                    <Feather
                      name="search"
                      size={18}
                      color="#6237A0"
                      style={{ marginRight: 8 }}
                    />
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
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                  />
                </SafeAreaView>
              </Modal>

              {/* Improved Error Modal - Compact */}
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

              {/* Password Input with label and icon */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Feather name="lock" size={16} color="#6237A0" />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#848287"
                    style={styles.lockIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    placeholder="••••••••"
                    placeholderTextColor="#848287"
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={secureText ? "eye-off" : "eye"}
                      size={22}
                      color="#848287"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: verticalScale(12) }}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button with gradient effect */}
              <View style={{ marginTop: verticalScale(35), width: "100%" }}>
                <TouchableOpacity
                  style={[styles.loginButton, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.loadingText}>Logging in...</Text>
                    </View>
                  ) : (
                    <View style={styles.loginButtonContent}>
                      <Text style={styles.loginText}>Login</Text>
                      <Feather name="arrow-right" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign Up */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                  <Text style={styles.linkText}> Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(30),
    position: "relative",
    overflow: "hidden",
  },
  // Animated blob styles - responsive sizes
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
  logoContainer: {
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: moderateScale(40),
    elevation: 15,
    zIndex: 10,
  },
  logo: {
    width: moderateScale(200, 0.3),
    height: moderateScale(200, 0.3),
  },
  title: {
    fontSize: moderateScale(36, 0.3),
    color: "#6237A0",
    marginBottom: verticalScale(30),
    fontWeight: "600",
    zIndex: 10,
  },
  inputGroup: {
    width: "100%",
    marginBottom: verticalScale(15),
    zIndex: 10,
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
    alignItems: "center",
    backgroundColor: "#444148",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    height: verticalScale(50),
    borderWidth: 2,
    borderColor: "#444148",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: moderateScale(10),
  },
  flagText: {
    color: "#fff",
    fontSize: moderateScale(16),
    marginRight: moderateScale(6),
  },
  separator: {
    width: 1,
    height: "70%",
    backgroundColor: "#5E5C63",
    marginRight: moderateScale(10),
  },
  phoneInput: {
    color: "#fff",
    fontSize: moderateScale(16),
    flex: 1,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#444148",
    borderRadius: moderateScale(10),
    height: verticalScale(50),
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#444148",
  },
  passwordInput: {
    color: "#fff",
    fontSize: moderateScale(16),
    paddingLeft: moderateScale(45),
    paddingRight: moderateScale(45),
    height: "100%",
  },
  lockIcon: {
    position: "absolute",
    left: moderateScale(12),
    top: verticalScale(15),
  },
  eyeIcon: {
    position: "absolute",
    right: moderateScale(12),
    top: verticalScale(15),
  },
  loginButton: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    width: "100%",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  loginText: {
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
  linkText: {
    color: "#fff",
    textDecorationLine: "underline",
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: verticalScale(20),
  },
  signUpText: {
    color: "#fff",
    fontSize: moderateScale(14),
  },
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
  separator: {
    height: 1,
    backgroundColor: "#2A2730",
    marginLeft: moderateScale(65),
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
