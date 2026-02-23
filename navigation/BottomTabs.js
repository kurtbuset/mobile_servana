import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import { ROUTES, TAB_CONFIG } from '../config/navigation';

// Refactored Screens (Phase 5)
import { DashboardScreen } from '../screens/dashboard';
import { ProfileScreen } from "../screens/profile";
import MessagesScreen from '../screens/messaging/MessagesScreen'; // Refactored (Phase 10)

const Tab = createMaterialTopTabNavigator();

const BottomTabs = () => {
  return (
    <View style={styles.container}>
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
            height: TAB_CONFIG.INDICATOR_HEIGHT,
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
            height: TAB_CONFIG.HEIGHT,
            paddingBottom: TAB_CONFIG.PADDING_BOTTOM,
            paddingTop: 8,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
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
    backgroundColor: '#F9FAFB',
  },
});

export default BottomTabs;
