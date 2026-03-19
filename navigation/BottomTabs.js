import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import { ROUTES, TAB_CONFIG } from '../config/navigation';

// Refactored Screens (Phase 5)
import { DashboardScreen } from '../screens/dashboard';
import { ProfileScreen } from "../screens/profile";
import MessagesScreen from '../screens/messaging/MessagesScreen'; // Refactored (Phase 10)

const Tab = createMaterialTopTabNavigator();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);
  
  return (
    <View style={[styles.container]}>
      <Tab.Navigator
        tabBarPosition={TAB_CONFIG.POSITION}
        screenOptions={({ route }) => ({
          swipeEnabled: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: TAB_CONFIG.ACTIVE_COLOR,
          tabBarInactiveTintColor: TAB_CONFIG.INACTIVE_COLOR,
          tabBarPressColor: 'transparent',
          tabBarIndicatorStyle: {
            backgroundColor: TAB_CONFIG.INDICATOR_COLOR,
            height: 0,
            borderRadius: 2,
            marginBottom: TAB_CONFIG.PADDING_BOTTOM,
          },
          tabBarStyle: {
            backgroundColor: TAB_CONFIG.BG_COLOR,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            borderTopWidth: 0,
            height: 60 + (insets.bottom || 10),
            paddingBottom: TAB_CONFIG.PADDING_BOTTOM + (insets.bottom || 10),
            paddingTop: 4,
            display: isKeyboardVisible ? 'none' : 'flex',
          },
          tabBarItemStyle: {
            paddingVertical: 6,
            height: 50,
          },
          tabBarIcon: ({ color, focused }) => {
            let iconName;

            if (route.name === ROUTES.DASHBOARD) {
              iconName = 'home';
            } else if (route.name === ROUTES.MESSAGES) {
              iconName = 'message-circle';
            } else if (route.name === ROUTES.PROFILE) {
              iconName = 'user';
            }

            return (
              <AnimatedTabIcon
                name={iconName}
                color={color}
                focused={focused}
              />
            );
          },
        })}
        sceneContainerStyle={{
          backgroundColor: '#F9FAFB',
        }}
      >
        <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
        <Tab.Screen name={ROUTES.MESSAGES} component={MessagesScreen} />
        <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0074e7ff',
  },
});

export default BottomTabs;
