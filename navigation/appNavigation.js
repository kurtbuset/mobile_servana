import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import Login from "../screens/Login";
import ForgotPassword from "../screens/ForgotPassword";
import SignUp from "../screens/SignUp";
import BottomTabs from "../navigation/BottomTabs";
import ResetPassword from "../screens/ResetPassword";
import SignUpVerification from "../screens/SignUpVerification";
import MyProfile from "../screens/MyProfile";
import ChangePassword from "../screens/ChangePassword";
import SuccessScreen from '../screens/SuccessScreen';
import EditProfile from "../screens/EditProfile";
import ProfilePicture from "../screens/ProfilePicture";
import SetupComplete from "../screens/SetupComplete";

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#1F1B24",
  },
};

// Enhanced animation configurations
const slideFromRight = {
  animation: 'slide_from_right',
  animationDuration: 250,
};

const slideFromBottom = {
  animation: 'slide_from_bottom',
  animationDuration: 300,
};

const fadeIn = {
  animation: 'fade',
  animationDuration: 200,
};

const defaultAnimation = Platform.select({
  ios: {
    animation: 'default',
  },
  android: {
    animation: 'slide_from_right',
    animationDuration: 250,
  },
});

const AppNavigation = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: "#1F1B24" 
          },
          ...defaultAnimation,
          cardStyle: { 
            backgroundColor: "#1F1B24",
            opacity: 1,
          },
          cardOverlayEnabled: false,
          presentation: 'card',
          // Smooth gesture handling
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{
            ...fadeIn,
            cardStyle: { backgroundColor: "#1F1B24" },
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPassword}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="HomeScreen" 
          component={BottomTabs}
          options={{
            ...fadeIn,
            gestureEnabled: false,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPassword}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="SignUpVerification" 
          component={SignUpVerification}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="ProfilePicture" 
          component={ProfilePicture}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="SetupComplete" 
          component={SetupComplete}
          options={{
            ...fadeIn,
            gestureEnabled: false,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="MyProfile" 
          component={MyProfile}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#F8F9FA" },
          }}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePassword}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="SuccessScreen" 
          component={SuccessScreen}
          options={{
            ...slideFromBottom,
            gestureEnabled: false,
            cardStyle: { backgroundColor: "#1F1B24" },
          }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfile}
          options={{
            ...slideFromRight,
            cardStyle: { backgroundColor: "#F8F9FA" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;
