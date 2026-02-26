import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Canned Messages Modal Component
 * Displays a modal with pre-defined quick messages
 */
export const CannedMessagesModal = ({ visible, onClose, onSelectMessage }) => {
  const cannedMessages = [
    "I have an issue for the you know...?",
    "Please provide your account number.",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Quick Messages</Text>
                <Text style={styles.modalSubtitle}>Select a message to send</Text>
              </View>

              {/* Messages List */}
              <FlatList
                data={cannedMessages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => onSelectMessage(item)}
                    style={[
                      styles.cannedMessageItem,
                      index === cannedMessages.length - 1 && styles.cannedMessageItemLast
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cannedMessageIcon}>
                      <Feather name="message-square" size={20} color="#7C3AED" />
                    </View>
                    <Text style={styles.cannedMessageText}>{item}</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseButton}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cannedMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cannedMessageItemLast: {
    borderBottomWidth: 0,
  },
  cannedMessageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cannedMessageText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 22,
  },
  modalCloseButton: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default CannedMessagesModal;
