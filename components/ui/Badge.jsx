import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Badge Component for status indicators
 */
export const Badge = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  return (
    <View style={[
      styles.badge,
      styles[`badge_${variant}`],
      styles[`badge_${size}`],
      style,
    ]}>
      <Text style={[
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badge_default: {
    backgroundColor: '#E0E0E0',
  },
  badge_success: {
    backgroundColor: '#4CAF50',
  },
  badge_warning: {
    backgroundColor: '#FF9800',
  },
  badge_error: {
    backgroundColor: '#FF6B6B',
  },
  badge_info: {
    backgroundColor: '#6C5CE7',
  },
  badge_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge_large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '600',
  },
  text_default: {
    color: '#1A1A1A',
  },
  text_success: {
    color: '#FFFFFF',
  },
  text_warning: {
    color: '#FFFFFF',
  },
  text_error: {
    color: '#FFFFFF',
  },
  text_info: {
    color: '#FFFFFF',
  },
  text_small: {
    fontSize: 10,
  },
  text_medium: {
    fontSize: 12,
  },
  text_large: {
    fontSize: 14,
  },
});

export default Badge;
