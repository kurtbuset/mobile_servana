import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Enhanced Department Selector Component
 * User-friendly department selection with improved UI and chat history access
 */
export const DepartmentSelector = ({ departments, onSelect, onViewHistory }) => {
  // Department icons mapping for better visual representation
  const getDepartmentIcon = (deptName) => {
    const name = deptName.toLowerCase();
    if (name.includes('it') || name.includes('technical') || name.includes('tech')) return 'monitor';
    if (name.includes('payment') || name.includes('billing') || name.includes('finance')) return 'credit-card';
    if (name.includes('customer') || name.includes('service') || name.includes('support')) return 'headphones';
    if (name.includes('sales') || name.includes('marketing')) return 'trending-up';
    return 'help-circle'; // Default icon
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Feather name="message-circle" size={32} color="#7C3AED" />
        </View>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.promptText}>
          Choose the department that best matches your inquiry to get connected with the right support team.
        </Text>
      </View>

      {/* Department Options */}
      <ScrollView 
        style={styles.departmentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.departmentListContent}
      >
        {departments.map((department, index) => (
          <TouchableOpacity
            key={department.dept_id}
            style={[
              styles.optionButton,
              { 
                transform: [{ scale: 1 }],
                opacity: 1,
              }
            ]}
            onPress={() => onSelect(department)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Feather 
                  name={getDepartmentIcon(department.dept_name)} 
                  size={20} 
                  color="#7C3AED" 
                />
              </View>
              <Text style={styles.optionText}>{department.dept_name}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {/* Help Text */}
        <Text style={styles.helpText}>
          💡 All your conversations are automatically preserved in one continuous thread
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  promptText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  departmentList: {
    flex: 1,
  },
  departmentListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  helpText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default DepartmentSelector;
