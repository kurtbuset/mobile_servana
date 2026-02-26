import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Department Selector Component
 * Displays department options for initial contact
 */
export const DepartmentSelector = ({ departments, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>
        To connect you with the right support team...
      </Text>
      {departments.map((department) => (
        <TouchableOpacity
          key={department.dept_id}
          style={styles.optionButton}
          onPress={() => onSelect(department)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionText}>{department.dept_name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  promptText: {
    color: '#374151',
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  optionButton: {
    borderColor: '#7C3AED',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DepartmentSelector;
