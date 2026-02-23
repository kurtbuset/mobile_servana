import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaContainer, ScrollContainer } from '../../components/layout';
import { WelcomeHeader, QuickActionCard, FAQList } from '../../features/dashboard';
import { selectProfileData } from '../../store/slices/profile';

/**
 * Dashboard Screen - Container Component
 */
export default function DashboardScreen() {
  const navigation = useNavigation();
  const profile = useSelector(selectProfileData);

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

  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        <LinearGradient
          colors={['#7C3AED', '#A78BFA', '#E0E7FF', '#F9FAFB']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradientBackground}
        />

        <ScrollContainer>
          <View style={styles.content}>
            <WelcomeHeader
              userName={profile?.prof_firstname}
              tagline="How can we help you today?"
            />

            <QuickActionCard
              title="Start a Conversation"
              subtitle="Get instant support"
              icon="message-circle"
              onPress={() => navigation.navigate('Messages')}
            />

            <FAQList faqs={faqs} />
          </View>
        </ScrollContainer>
      </View>
    </SafeAreaContainer>
  );
}

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
    height: 400,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 20,
  },
});
