import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "../navigation/BottomTabs";
import { ROUTES, ANIMATIONS, SCREEN_OPTIONS } from "../config/navigation";

// Refactored Screens (Phase 5)
import { LoginScreen, ForgotPasswordScreen, ResetPasswordScreen } from "../screens/auth/index";
import { ProfileScreen as MyProfile, EditProfileScreen as EditProfile, ChangePasswordScreen as ChangePassword } from "../screens/profile/index";

// New Multi-Step Sign Up Flow
import SignUpDetailsScreen from "../screens/auth/SignUpDetailsScreen";
import SignUpOTPScreen from "../screens/auth/SignUpOTPScreen";
import SignUpProfilePictureScreen from "../screens/auth/SignUpProfilePictureScreen";
import SignUpSuccessScreen from "../screens/auth/SignUpSuccessScreen";

// Legacy Screens (to be refactored)
import SuccessScreen from '../screens/SuccessScreen';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#1F1B24",
  },
};

// Animation configurations from config
const { SLIDE_RIGHT, SLIDE_BOTTOM, FADE, DEFAULT: defaultAnimation } = ANIMATIONS;

const AppNavigation = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          ...SCREEN_OPTIONS.DEFAULT,
          ...defaultAnimation,
        }}
      >
        <Stack.Screen 
          name={ROUTES.LOGIN}
          component={LoginScreen}
          options={{
            ...FADE,
            ...SCREEN_OPTIONS.NO_GESTURE,
          }}
        />
        
        {/* Multi-Step Sign Up Flow */}
        <Stack.Screen 
          name="SignUpDetails"
          component={SignUpDetailsScreen}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name="SignUpOTP"
          component={SignUpOTPScreen}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name="SignUpProfilePicture"
          component={SignUpProfilePictureScreen}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name="SignUpSuccess"
          component={SignUpSuccessScreen}
          options={{
            ...FADE,
            ...SCREEN_OPTIONS.NO_GESTURE,
          }}
        />
        
        <Stack.Screen 
          name={ROUTES.FORGOT_PASSWORD}
          component={ForgotPasswordScreen}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name={ROUTES.RESET_PASSWORD}
          component={ResetPasswordScreen}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name={ROUTES.HOME}
          component={BottomTabs}
          options={{
            ...FADE,
            ...SCREEN_OPTIONS.NO_GESTURE,
          }}
        />
        <Stack.Screen 
          name={ROUTES.MY_PROFILE}
          component={MyProfile}
          options={{
            ...SLIDE_RIGHT,
            ...SCREEN_OPTIONS.LIGHT_BG,
          }}
        />
        <Stack.Screen 
          name={ROUTES.CHANGE_PASSWORD}
          component={ChangePassword}
          options={SLIDE_RIGHT}
        />
        <Stack.Screen 
          name={ROUTES.SUCCESS}
          component={SuccessScreen}
          options={{
            ...SLIDE_BOTTOM,
            ...SCREEN_OPTIONS.NO_GESTURE,
          }}
        />
        <Stack.Screen 
          name={ROUTES.EDIT_PROFILE}
          component={EditProfile}
          options={{
            ...SLIDE_RIGHT,
            ...SCREEN_OPTIONS.LIGHT_BG,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;
