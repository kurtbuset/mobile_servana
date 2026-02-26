import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getExampleNumber } from 'libphonenumber-js';
import { COUNTRIES, getFlagEmoji } from '../../../shared/constants';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * LoginForm - Presentational Component
 * Beautiful UI matching original design
 */
export const LoginForm = ({
  phoneNumber,
  password,
  selectedCountry,
  errors,
  loading,
  onPhoneChange,
  onPasswordChange,
  onCountrySelect,
  onSubmit,
  onForgotPassword,
  onSignUp,
}) => {
  const [secureText, setSecureText] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePhoneChange = (text) => {
    const digitsOnly = text.replace(/\D/g, '');
    try {
      const example = getExampleNumber(selectedCountry.code, 'mobile');
      const maxLength = example?.nationalNumber?.length || 10;
      if (digitsOnly.length <= maxLength) {
        onPhoneChange(digitsOnly);
      }
    } catch {
      if (digitsOnly.length <= 15) {
        onPhoneChange(digitsOnly);
      }
    }
  };

  const filteredCountries = COUNTRIES.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(query) ||
      country.callingCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.formContainer}>
      {/* Logo with glow effect */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/icon.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>servana</Text>

      {/* Phone Number Input */}
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
          />
        </View>
      </View>

      {/* Country Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
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
              <TouchableOpacity onPress={() => setSearchQuery('')}>
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
                  selectedCountry.code === item.code && styles.countryItemSelected,
                ]}
                onPress={() => {
                  onCountrySelect(item);
                  setModalVisible(false);
                  setSearchQuery('');
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
            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Feather name="lock" size={16} color="#6237A0" />
          <Text style={styles.inputLabel}>Password</Text>
        </View>
        <View style={styles.passwordContainer}>
          <Feather name="lock" size={20} color="#848287" style={styles.lockIcon} />
          <TextInput
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={secureText}
            placeholder="••••••••"
            placeholderTextColor="#848287"
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeIcon}
          >
            <Feather name={secureText ? 'eye-off' : 'eye'} size={22} color="#848287" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        style={{ alignSelf: 'flex-end', marginBottom: verticalScale(12) }}
        onPress={onForgotPassword}
      >
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <View style={{ marginTop: verticalScale(35), width: '100%' }}>
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={onSubmit}
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
        <TouchableOpacity onPress={onSignUp}>
          <Text style={styles.linkText}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    shadowColor: '#6237A0',
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
    color: '#6237A0',
    marginBottom: verticalScale(30),
    fontWeight: '600',
    zIndex: 10,
  },
  inputGroup: {
    width: '100%',
    marginBottom: verticalScale(15),
    zIndex: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    gap: moderateScale(6),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: '#848287',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444148',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    height: verticalScale(50),
    borderWidth: 2,
    borderColor: '#444148',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  flagText: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginRight: moderateScale(6),
  },
  separator: {
    width: 1,
    height: '70%',
    backgroundColor: '#5E5C63',
    marginRight: moderateScale(10),
  },
  phoneInput: {
    color: '#fff',
    fontSize: moderateScale(16),
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#444148',
    borderRadius: moderateScale(10),
    height: verticalScale(50),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#444148',
  },
  passwordInput: {
    color: '#fff',
    fontSize: moderateScale(16),
    paddingLeft: moderateScale(45),
    paddingRight: moderateScale(45),
    height: '100%',
  },
  lockIcon: {
    position: 'absolute',
    left: moderateScale(12),
    top: verticalScale(15),
  },
  eyeIcon: {
    position: 'absolute',
    right: moderateScale(12),
    top: verticalScale(15),
  },
  loginButton: {
    backgroundColor: '#6237A0',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#6237A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  loginText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  loadingText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: moderateScale(14),
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(20),
  },
  signUpText: {
    color: '#fff',
    fontSize: moderateScale(14),
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#1F1B24',
    paddingTop: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: moderateScale(22),
    fontWeight: '700',
  },
  closeButton: {
    padding: moderateScale(5),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2730',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(15),
    marginHorizontal: moderateScale(20),
    marginVertical: verticalScale(15),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: '#3A3740',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: moderateScale(15),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: '#1F1B24',
  },
  countryItemSelected: {
    backgroundColor: 'rgba(98, 55, 160, 0.1)',
  },
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  countryCode: {
    color: '#888',
    fontSize: moderateScale(13),
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#2A2730',
    marginLeft: moderateScale(65),
  },
});

export default LoginForm;
