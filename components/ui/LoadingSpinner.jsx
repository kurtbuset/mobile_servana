import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({
  size = 'large',
  color = '#6C5CE7',
  fullScreen = false,
  style,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default LoadingSpinner;
