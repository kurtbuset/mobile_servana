import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearCompleteSession } from '../utils/secureLogout';
import ConfirmModal from './ConfirmModal';

/**
 * Reusable secure logout button component with confirmation modal
 */
export default function SecureLogoutButton({ style, textStyle, title = "Logout" }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await clearCompleteSession(dispatch);
    navigation.replace('Login');
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.logoutButton, style]} 
        onPress={() => setShowLogoutModal(true)}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={18} color="#fff" style={styles.icon} />
        <Text style={[styles.logoutText, textStyle]}>{title}</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmColor="#E63946"
        icon="log-out"
        iconColor="#E63946"
      />
    </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});