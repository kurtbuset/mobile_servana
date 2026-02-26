import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "../navigation/BottomTabs";
import { ROUTES, ANIMATIONS, SCREEN_OPTIONS } from "../config/navigation";
import { useAuth } from "../contexts/AuthContext";

// Refactored Screens (Phase 5)
import { AuthScreen, ProfileSetupScreen, WelcomeSuccessScreen } from "../screens/auth/index";
import {
  ProfileScreen as MyProfile,
  EditProfileScreen as EditProfile,
} from "../screens/profile/index";

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#1F1B24",
  },
};

// Animation configurations from config
const {
  SLIDE_RIGHT,
  SLIDE_BOTTOM,
  FADE,
  DEFAULT: defaultAnimation,
} = ANIMATIONS;

const AppNavigation = () => {
  // Get authentication state from AuthContext
  // This is managed by token validation on app initialization
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          ...SCREEN_OPTIONS.DEFAULT,
          ...defaultAnimation,
        }}
        // Set initial route based on authentication status
        // This ensures proper navigation on app start
        initialRouteName={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}
      >
        {!isAuthenticated ? (
          // Auth Stack - shown when user is not authenticated
          // Initial route: LOGIN (AuthScreen)
          <>
            <Stack.Screen
              name={ROUTES.LOGIN}
              component={AuthScreen}
              options={{
                ...FADE,
                ...SCREEN_OPTIONS.NO_GESTURE,
              }}
            />
          </>
        ) : (
          // Main App Stack - shown when user is authenticated
          // Initial route: HOME (Dashboard via BottomTabs)
          <>
            <Stack.Screen
              name={ROUTES.HOME}
              component={BottomTabs}
              options={{
                ...FADE,
                ...SCREEN_OPTIONS.NO_GESTURE,
              }}
            />
            <Stack.Screen
              name={ROUTES.PROFILE_SETUP}
              component={ProfileSetupScreen}
              options={{
                ...SLIDE_RIGHT,
                ...SCREEN_OPTIONS.NO_GESTURE,
              }}
            />
            <Stack.Screen
              name={ROUTES.WELCOME_SUCCESS}
              component={WelcomeSuccessScreen}
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
              name={ROUTES.EDIT_PROFILE}
              component={EditProfile}
              options={{
                ...SLIDE_RIGHT,
                ...SCREEN_OPTIONS.LIGHT_BG,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
