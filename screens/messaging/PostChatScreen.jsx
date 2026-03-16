import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Post Chat Screen
 * Displayed after a chat session has been successfully ended
 * Shows summary and provides options for next actions
 */
export default function PostChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get chat data from navigation params
  const { 
    chatDuration = null,
    messageCount = 0,
    rating = null,
    feedback = null 
  } = route.params || {};

  const handleStartNewChat = () => {
    navigation.navigate('Messages');
  };

  const handleViewHistory = () => {
    navigation.navigate('ChatHistory');
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Feather name="check" size={48} color="#10B981" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Chat Session Completed</Text>
        <Text style={styles.subtitle}>
          Thank you for using our service. Your conversation has been saved.
        </Text>

        {/* Chat Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Feather name="clock" size={20} color="#6B7280" />
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {chatDuration || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Feather name="message-square" size={20} color="#6B7280" />
              <Text style={styles.summaryLabel}>Messages</Text>
              <Text style={styles.summaryValue}>
                {messageCount}
              </Text>
            </View>
          </View>

          {rating && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={20}
                    color={star <= rating ? '#FFD700' : '#E5E7EB'}
                  />
                ))}
              </View>
            </View>
          )}

          {feedback && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Your Feedback</Text>
              <Text style={styles.feedbackText}>"{feedback}"</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartNewChat}
          >
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Start New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewHistory}
          >
            <Feather name="history" size={20} color="#7C3AED" />
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleBackToDashboard}
          >
            <Feather name="home" size={20} color="#6B7280" />
            <Text style={styles.tertiaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need More Help?</Text>
          <Text style={styles.helpText}>
            If you have additional questions or concerns, feel free to start a new chat session or contact our support team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  feedbackSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  tertiaryButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  helpSection: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});