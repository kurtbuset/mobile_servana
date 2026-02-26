import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Safe Area Container Component
 */
export const SafeAreaContainer = ({
  children,
  edges = ['top', 'bottom'],
  style,
}) => {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, style]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default SafeAreaContainer;
