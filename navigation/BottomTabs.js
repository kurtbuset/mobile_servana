import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import AnimatedTabIcon from '../components/AnimatedTabIcon';

// Screens
import HomeScreen from '../screens/Dashboard';
import Messages from '../screens/Messages';
import Profile from '../screens/Profile';

const Tab = createMaterialTopTabNavigator();

const BottomTabs = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          swipeEnabled: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#6237A0',
          tabBarInactiveTintColor: '#999',
          tabBarPressColor: 'transparent',
          tabBarIndicatorStyle: {
            backgroundColor: '#6237A0',
            height: 3,
            borderRadius: 2,
            marginBottom: Platform.OS === 'ios' ? 25 : 5,
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 8,
            paddingTop: 8,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
          },
          tabBarIcon: ({ color, focused }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = 'home';
            } else if (route.name === 'Messages') {
              iconName = 'message-circle';
            } else if (route.name === 'Profile') {
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
        <Tab.Screen name="Dashboard" component={HomeScreen} />
        <Tab.Screen name="Messages" component={Messages} />
        <Tab.Screen name="Profile" component={Profile} />
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
