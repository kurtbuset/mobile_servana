import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppNavigation from './navigation/appNavigation';
import { useSecureAuth } from './hooks/useSecureAuth';
import testNetworkConnection from './utils/networkTest';

// Auth wrapper component to handle secure authentication restoration
function AuthWrapper({ children }) {
  const { isLoading } = useSecureAuth();
  
  useEffect(() => {
    // Test network connection on app startup
    const testConnection = async () => {
      const result = await testNetworkConnection();
      if (result.success) {
        console.log('🌐 Backend connection verified');
      } else {
        console.error('🚨 Backend connection failed:', result.message);
        console.error('📱 Make sure:');
        console.error('   1. Backend server is running');
        console.error('   2. You are on the same Wi-Fi network');
        console.error('   3. Windows Firewall allows port 5000');
      }
    };
    
    testConnection();
  }, []);
  
  if (isLoading) {
    // You can replace this with a proper loading screen
    return null;
  }
  
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthWrapper>
        <AppNavigation />
      </AuthWrapper>
    </Provider>
  );
}