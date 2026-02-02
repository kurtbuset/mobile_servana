import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native'; // ✅ You already have this
import { useSelector } from "react-redux";

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, and PayPal.',
  },
  {
    question: 'Can I change my payment method?',
    answer: 'Yes, you can change it in the account settings.',
  },
  {
    question: 'What are the features of your service?',
    answer: '24/7 support, fast response, and great value.',
  },
];

const Dashboard = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigation = useNavigation(); // ✅ Add this line
  const client = useSelector((state) => state.client.data);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBlock}>
          <Text style={styles.header}>Hi {client?.prof_id?.prof_firstname || 'User'}</Text>
          <Text style={styles.subheader}>Helping you, one chat at a time.</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Start a conversation</Text>
            <View style={styles.avatarRow}>
              {[1, 2, 3].map((_, i) => (
                <Image
                  key={i}
                  source={require('../assets/icon.png')}
                  style={styles.avatar}
                />
              ))}
              <View>
                <Text style={styles.needHelp}>Need help?</Text>
                <Text style={styles.replyTime}>Get a reply in a minute</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Messages')} // ✅ Navigates to Messages screen
            >
              <Text style={styles.buttonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleFAQ(index)}
              style={styles.faqItem}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Feather
                  name="chevron-down"
                  size={16}
                  style={{
                    transform: [{ rotate: openIndex === index ? '180deg' : '0deg' }],
                  }}
                />
              </View>
              {openIndex === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
    // Center horizontally removed because header/subheader will be left aligned
  },
  topBlock: {
    marginTop: 100, // pushes whole block down
    width: '100%',
    maxWidth: 400,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'left', // aligned left now
  },
  subheader: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'left', // aligned left now
  },
  card: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  needHelp: {
    fontWeight: '600',
  },
  replyTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#7c3aed',
    padding: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  faqSection: {
    marginTop: 70,
    paddingVertical: 16,
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left', // Left aligned FAQ title for consistency
  },
  faqItem: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontWeight: '500',
  },
  faqAnswer: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default Dashboard;
