import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppNavigation from './navigation/appNavigation';
import { SocketProvider } from './SocketProvider';
import { useSecureAuth } from './hooks/useSecureAuth';

// Auth wrapper component to handle secure authentication restoration
function AuthWrapper({ children }) {
  const { isLoading } = useSecureAuth();
  
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
        {/* <SocketProvider> */}
          <AppNavigation />
        {/* </SocketProvider> */}
      </AuthWrapper>
    </Provider>
  );
}