import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

/**
 * Scrollable Container Component
 */
export const ScrollContainer = ({
  children,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ...props
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default ScrollContainer;
