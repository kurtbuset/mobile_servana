import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, and PayPal.',
    icon: 'credit-card',
  },
  {
    question: 'Can I change my payment method?',
    answer: 'Yes, you can change it in the account settings.',
    icon: 'settings',
  },
  {
    question: 'What are the features of your service?',
    answer: '24/7 support, fast response, and great value.',
    icon: 'star',
  },
];

const Dashboard = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigation = useNavigation();
  const client = useSelector((state) => state.client.data);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Gradient Background with smooth edge */}
      <LinearGradient
        colors={['#7C3AED', '#A78BFA', '#E0E7FF', '#F9FAFB']}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.gradientBackground}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{client?.prof_id?.prof_firstname || 'User'} 👋</Text>
          </View>
          <Text style={styles.tagline}>How can we help you today?</Text>
        </View>

        {/* Main CTA Card */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaLeft}>
                <View style={styles.ctaIconCircle}>
                  <Feather name="message-circle" size={24} color="#fff" />
                </View>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaTitle}>Start a Conversation</Text>
                  <Text style={styles.ctaSubtitle}>Get instant support</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleFAQ(index)}
              style={[
                styles.faqItem,
                openIndex === index && styles.faqItemOpen
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqIconContainer}>
                  <Feather name={faq.icon} size={18} color="#7C3AED" />
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Feather
                  name={openIndex === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#9CA3AF"
                />
              </View>
              {openIndex === index && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: verticalScale(10) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: verticalScale(400),
  },
  scrollContent: {
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
  },
  
  // Welcome Section
  welcomeSection: {
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  greetingContainer: {
    marginBottom: verticalScale(6),
  },
  greeting: {
    fontSize: moderateScale(16),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#fff',
    marginTop: verticalScale(2),
  },
  tagline: {
    fontSize: moderateScale(15),
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: verticalScale(2),
  },

  // CTA Card
  ctaCard: {
    marginHorizontal: moderateScale(20),
    marginBottom: verticalScale(20),
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(12),
    elevation: 6,
  },
  ctaGradient: {
    padding: moderateScale(18),
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ctaIconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(14),
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: '#fff',
    marginBottom: verticalScale(3),
  },
  ctaSubtitle: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // FAQ Section
  faqSection: {
    paddingHorizontal: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: verticalScale(12),
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(6),
    elevation: 2,
  },
  faqItemOpen: {
    shadowOpacity: 0.08,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  faqQuestion: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1F2937',
    marginRight: moderateScale(8),
  },
  faqAnswerContainer: {
    marginTop: verticalScale(10),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswer: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    lineHeight: moderateScale(20),
  },
});

export default Dashboard;
