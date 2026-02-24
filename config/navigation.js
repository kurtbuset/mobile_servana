import { Platform } from "react-native";

/**
 * Navigation Configuration
 * Centralized navigation settings and route names
 */

// Route Names
export const ROUTES = {
  // Auth Stack
  LOGIN: "Login",
  PROFILE_SETUP: "ProfileSetup",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",

  // Multi-Step Sign Up Flow
  SIGN_UP_PHONE: "SignUpPhone",
  SIGN_UP_OTP: "SignUpOTP",
  SIGN_UP_DETAILS: "SignUpDetails",
  SIGN_UP_PROFILE_PICTURE: "SignUpProfilePicture",
  SIGN_UP_SUCCESS: "SignUpSuccess",

  // Main Stack
  HOME: "HomeScreen",
  DASHBOARD: "Dashboard",
  MESSAGES: "Messages",
  PROFILE: "Profile",

  // Profile Stack
  MY_PROFILE: "MyProfile",
  EDIT_PROFILE: "EditProfile",
  CHANGE_PASSWORD: "ChangePassword",

  // Utility
  SUCCESS: "SuccessScreen",
};

// Animation Configurations
export const ANIMATIONS = {
  SLIDE_RIGHT: {
    animation: "slide_from_right",
    animationDuration: 250,
  },
  SLIDE_BOTTOM: {
    animation: "slide_from_bottom",
    animationDuration: 300,
  },
  FADE: {
    animation: "fade",
    animationDuration: 200,
  },
  DEFAULT: Platform.select({
    ios: { animation: "default" },
    android: {
      animation: "slide_from_right",
      animationDuration: 250,
    },
  }),
};

// Screen Options
export const SCREEN_OPTIONS = {
  DEFAULT: {
    headerShown: false,
    contentStyle: { backgroundColor: "#1F1B24" },
    cardStyle: { backgroundColor: "#1F1B24", opacity: 1 },
    cardOverlayEnabled: false,
    presentation: "card",
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: true,
  },
  NO_GESTURE: {
    gestureEnabled: false,
  },
  LIGHT_BG: {
    cardStyle: { backgroundColor: "#F8F9FA" },
  },
};

// Tab Bar Configuration
export const TAB_CONFIG = {
  POSITION: "bottom",
  ACTIVE_COLOR: "#6237A0",
  INACTIVE_COLOR: "#999",
  INDICATOR_COLOR: "#6237A0",
  INDICATOR_HEIGHT: 3,
  BG_COLOR: "#fff",
  HEIGHT: Platform.select({
    ios: 90,
    android: 65,
  }),
  PADDING_BOTTOM: Platform.select({
    ios: 25,
    android: 8,
  }),
};

export default {
  ROUTES,
  ANIMATIONS,
  SCREEN_OPTIONS,
  TAB_CONFIG,
};
