import { Provider } from "react-redux";
import { View, StatusBar } from "react-native";
import { store } from "./store";
import AppNavigation from "./navigation/appNavigation";
import { useAuth } from "./contexts/AuthContext";
import SplashScreen from "./screens/SplashScreen";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

function AuthWrapper({ children }) {
  const { isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary fallbackMessage="The app encountered a critical error. Please restart.">
      <Provider store={store}>
        <AuthProvider>
          <SocketProvider>
            <View style={{ flex: 1, backgroundColor: "#1F1B24" }}>
              <StatusBar
                backgroundColor="#1F1B24"
                barStyle="light-content"
                translucent={false}
              />
              <AuthWrapper>
                <ErrorBoundary fallbackMessage="Navigation failed to load.">
                  <AppNavigation />
                </ErrorBoundary>
              </AuthWrapper>
            </View>
          </SocketProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}
