import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Splash screen shown during app initialization
 * Displays while checking token validity
 */
const SplashScreen = () => {
  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: '#1F1B24', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
    >
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text 
        style={{ 
          color: '#FFFFFF', 
          marginTop: 16, 
          fontSize: 16 
        }}
      >
        Loading...
      </Text>
    </View>
  );
};

export default SplashScreen;
