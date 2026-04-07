import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * End Chat Modal Component
 * Provides chat rating, feedback, and confirmation before ending chat
 */
export const EndChatModal = ({ 
  visible, 
  onClose, 
  onConfirmEndChat,
  chatDuration = null,
  messageCount = 0,
  isLoading = false 
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState('confirm'); // 'confirm', 'rating', 'complete'

  const handleEndChat = () => {
    if (step === 'confirm') {
      setStep('rating');
    } else if (step === 'rating') {
      // Submit rating and end chat
      const feedbackData = {
        rating,
        feedback,
        chatDuration,
        messageCount
      };
      console.log('📤 EndChatModal sending feedback:', feedbackData);
      onConfirmEndChat(feedbackData);
      // Close modal immediately after submitting
      resetModal();
    }
  };

  const resetModal = () => {
    setRating(0);
    setFeedback('');
    setStep('confirm');
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Feather
              name="star"
              size={32}
              color={star <= rating ? '#FFD700' : '#E5E7EB'}
              style={star <= rating && styles.filledStar}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Feather name="message-circle" size={48} color="#EF4444" />
      </View>
      
      <Text style={styles.title}>End Chat Session?</Text>
      <Text style={styles.subtitle}>
        Are you sure you want to end this conversation? This action cannot be undone.
      </Text>

      {(chatDuration || messageCount > 0) && (
        <View style={styles.chatStats}>
          {chatDuration && (
            <View style={styles.statItem}>
              <Feather name="clock" size={16} color="#6B7280" />
              <Text style={styles.statText}>Duration: {chatDuration}</Text>
            </View>
          )}
          {messageCount > 0 && (
            <View style={styles.statItem}>
              <Feather name="message-square" size={16} color="#6B7280" />
              <Text style={styles.statText}>{messageCount} messages</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={resetModal}
          style={[styles.button, styles.cancelButton]}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleEndChat}
          style={[styles.button, styles.endButton]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.endButtonText}>End Chat</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRatingStep = () => {
    // Check if both rating and feedback are provided
    const isFormValid = rating > 0 && feedback.trim().length > 0;
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
          <Feather name="heart" size={48} color="#7C3AED" />
        </View>
        
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>
          Please rate your chat experience and share your feedback. Both are required to help us improve our service.
        </Text>

        {renderStars()}
        
        {rating === 0 && (
          <Text style={styles.requiredText}>Please select a rating</Text>
        )}

        <TextInput
          style={[
            styles.feedbackInput,
            feedback.trim().length === 0 && styles.feedbackInputError
          ]}
          placeholder="Share your thoughts (required) *"
          placeholderTextColor="#9CA3AF"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        
        {feedback.trim().length === 0 && (
          <Text style={styles.requiredText}>Feedback is required</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={resetModal}
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleEndChat}
            style={[
              styles.button, 
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled
            ]}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[
                styles.submitButtonText,
                !isFormValid && styles.submitButtonTextDisabled
              ]}>
                Submit & End Chat
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetModal}
    >
      <TouchableWithoutFeedback onPress={step === 'complete' ? resetModal : undefined}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {step === 'confirm' && renderConfirmStep()}
              {step === 'rating' && renderRatingStep()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  chatStats: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  filledStar: {
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 8,
  },
  feedbackInputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  requiredText: {
    fontSize: 12,
    color: '#EF4444',
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: 4,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  finalStars: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  doneButton: {
    backgroundColor: '#10B981',
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EndChatModal;