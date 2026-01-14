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
import { parsePhoneNumberFromString, getExampleNumber } from "libphonenumber-js";

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

const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
};

const ForgotPassword = () => {
  const navigation = useNavigation();

  const [selectedCountry, setSelectedCountry] = useState(rawCountries[1]); // PH
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const filteredCountries = rawCountries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      country.callingCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

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

  const handleSendCode = () => {
    const fullNumber = `+${selectedCountry.callingCode}${phoneNumber}`;
    const parsed = parsePhoneNumberFromString(fullNumber);

    console.log('fullNumber: ', fullNumber)
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1B24" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <Image
                source={require("../assets/icon.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>Enter your phone number to reset your password</Text>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={styles.countryPicker}
                >
                  <Text style={styles.flagText}>
                    {getFlagEmoji(selectedCountry.code)} +{selectedCountry.callingCode}
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
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                />
              </View>

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
                        <Text style={styles.countryText}>
                          {getFlagEmoji(item.code)} {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </SafeAreaView>
              </Modal>

              <TouchableOpacity style={styles.sendButton} onPress={handleSendCode}>
                <Text style={styles.sendText}>Send Code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2B2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    width: "100%",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  flagText: {
    color: "white",
    fontSize: 16,
    marginRight: 6,
  },
  separator: {
    width: 1,
    height: "70%",
    backgroundColor: "#5E5C63",
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    color: "white",
    paddingVertical: 12,
  },
  sendButton: {
    backgroundColor: "#6237A0",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
    width: "100%",
  },
  sendText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1F1B24",
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2B2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    paddingVertical: 10,
  },
  countryItem: {
    paddingVertical: 12,
    borderBottomColor: "#444",
    borderBottomWidth: 1,
  },
  countryText: {
    color: "white",
    fontSize: 16,
  },
});

export default ForgotPassword;
