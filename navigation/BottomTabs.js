// components/BottomNavbar.jsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Feather from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from '../screens/Dashboard';
import Messages from '../screens/Messages';
import Profile from '../screens/Profile';
// import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true, // 🔹 Hide tab bar when keyboard is open
        tabBarShowLabel: false, // 🔹 Hide label under icon
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Messages') {
            iconName = 'message-circle';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return (
            <Feather
              name={iconName}
              size={size}
              color={color}
              strokeWidth={1} // 🔹 Set stroke width
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
