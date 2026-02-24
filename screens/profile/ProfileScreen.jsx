import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaContainer, ScrollContainer } from '../../components/layout';
import { ProfileHeader, ProfileStats } from '../../features/profile';
import { selectProfileData } from '../../store/slices/profile';
// import { useLogout } from '../../features/auth/hooks';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Profile Screen - Container Component
 */
export default function ProfileScreen() {
  const navigation = useNavigation();
  const profile = useSelector(selectProfileData);
  // const { logout, isLoggingOut } = useLogout();

  const stats = [
    { label: 'Messages', value: '0' },
    { label: 'Tickets', value: '0' },
  ];

  const menuItems = [
    {
      icon: 'user',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'settings',
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaContainer>
      <ScrollContainer>
        <View style={styles.container}>
          <ProfileHeader
            profile={profile}
            onEditPress={() => navigation.navigate('EditProfile')}
            onImagePress={() => navigation.navigate('ProfilePicture')}
          />

          <ProfileStats stats={stats} />

          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
                // disabled={isLoggingOut}
              >
                <View style={styles.menuLeft}>
                  <Feather 
                    name={item.icon} 
                    size={20} 
                    color={item.danger ? '#EF4444' : '#666'} 
                  />
                  <Text 
                    style={[
                      styles.menuLabel, 
                      item.danger && styles.dangerLabel
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollContainer>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  dangerLabel: {
    color: '#EF4444',
  },
});
