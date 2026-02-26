import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDateSeparator } from '../utils/messageHelpers';

/**
 * Date Separator Component
 */
export const DateSeparator = ({ date }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{formatDateSeparator(date)}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  text: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
});

export default DateSeparator;
