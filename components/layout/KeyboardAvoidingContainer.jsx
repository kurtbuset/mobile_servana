import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * Keyboard Avoiding Container
 */
export const KeyboardAvoidingContainer = ({
  children,
  style,
  ...props
}) => {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardAvoidingContainer;
