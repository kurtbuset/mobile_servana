import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Basic Container Component
 */
export const Container = ({
  children,
  padding = true,
  centered = false,
  style,
}) => {
  return (
    <View style={[
      styles.container,
      padding && styles.container_padded,
      centered && styles.container_centered,
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container_padded: {
    paddingHorizontal: 20,
  },
  container_centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Container;
