import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { confirmSecureLogout } from '../utils/secureLogout';

/**
 * Reusable secure logout button component
 */
export default function SecureLogoutButton({ style, textStyle, title = "Logout" }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    confirmSecureLogout(dispatch, navigation);
  };

  return (
    <TouchableOpacity 
      style={[styles.logoutButton, style]} 
      onPress={handleLogout}
    >
      <Text style={[styles.logoutText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});