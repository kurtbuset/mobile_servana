import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppNavigation from './navigation/appNavigation';
import {SocketProvider } from './SocketProvider';

export default function App() {
  return (
    <Provider store={store}>
      {/* <SocketProvider>  */}
        <AppNavigation />
      {/* </SocketProvider> */}
    </Provider>
  );
}