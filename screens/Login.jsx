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
} from "react-native";
import { useState } from "react";
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

const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};
// const API_URL = "http://192.168.137.1:5000"; // Replace with your backend URL
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://10.0.2.2:5000';

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

  const handleLogin = async () => {
    if (!phoneNumber?.trim() || !password?.trim()) {
      Alert.alert("Error", "Please fill in both fields");
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
        Alert.alert("Login Failed", result.error || "Login error");
        return;
      }

      await SecureStorage.setToken(result.token);
      dispatch(setClient({ client: result.client })); // Token no longer passed to Redux

      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <Image
                source={require("../assets/icon.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.title}>servana</Text>

              <View style={styles.inputContainer}>
                {/* Phone Number Input with Modal Picker */}
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

              {/* Country Modal with Search */}
              <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                  <View style={styles.searchBox}>
                    <Feather
                      name="search"
                      size={18}
                      color="#888"
                      style={{ marginRight: 8 }}
                    />
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
                        <Text style={styles.countryText}>
                          {getFlagEmoji(item.code)} {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </SafeAreaView>
              </Modal>

              {/* Password Input */}
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
                  placeholder="Password"
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

              {/* Forgot Password */}
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: 12 }}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <View style={{ marginTop: 35, width: "100%" }}>
                <TouchableOpacity
                  style={[styles.loginButton, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginText}>Login</Text>
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
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logo: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 40,
    color: "#6237A0",
    marginBottom: 30,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444148",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  flagText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 6,
  },
  separator: {
    width: 1,
    height: "70%",
    backgroundColor: "#5E5C63",
    marginRight: 10,
  },
  phoneInput: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#444148",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  passwordInput: {
    color: "#fff",
    fontSize: 16,
    paddingLeft: 45,
    paddingRight: 45,
    height: "100%",
  },
  lockIcon: {
    position: "absolute",
    left: 12,
    top: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 15,
  },
  loginButton: {
    backgroundColor: "#6237A0",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#fff",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signUpText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1F1B24",
    paddingTop: 50,
  },
  countryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  countryText: {
    color: "#fff",
    fontSize: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
});
