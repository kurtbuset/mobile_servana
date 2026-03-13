import { useEffect } from "react";
import { Provider } from "react-redux";
import { View, StatusBar } from "react-native";
import { store } from "./store";
import AppNavigation from "./navigation/appNavigation";
import { useAuth } from "./contexts/AuthContext";
import testNetworkConnection from "./utils/networkTest";
import SplashScreen from "./screens/SplashScreen";

// Phase 3 Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext-simple";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";

/**
 * Auth wrapper component to handle secure authentication restoration
 * Implements Viber-style app initialization:
 * - Shows splash screen during token validation
 * - Navigates to Dashboard if token is valid (NO OTP NEEDED)
 * - Navigates to Auth Screen if token is invalid/missing
 */
function AuthWrapper({ children }) {
  const { isLoading } = useAuth();

  useEffect(() => {
    // Test network connection on app startup
    const testConnection = async () => {
      const result = await testNetworkConnection();
      if (result.success) {
        console.log("🌐 Backend connection verified");
      } else {
        console.error("🚨 Backend connection failed:", result.message);
        console.error("📱 Make sure:");
        console.error("   1. Backend server is running");
        console.error("   2. You are on the same Wi-Fi network");
        console.error("   3. Windows Firewall allows port 5000");
      }
    };

    testConnection();
  }, []);

  // Show splash screen during token validation
  if (isLoading) {
    return <SplashScreen />;
  }

  // Token validation complete - show appropriate screen
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SocketProvider>
              <View style={{ flex: 1, backgroundColor: "#1F1B24" }}>
                <StatusBar
                  backgroundColor="#1F1B24"
                  barStyle="light-content"
                  translucent={false}
                />
                <AuthWrapper>
                  <AppNavigation />
                </AuthWrapper>
              </View>
            </SocketProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
