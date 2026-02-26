import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Welcome Header Component
 */
export const WelcomeHeader = ({ userName, tagline }) => {
  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.userName}>{userName || 'User'} 👋</Text>
      </View>
      {tagline && <Text style={styles.tagline}>{tagline}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

export default WelcomeHeader;
