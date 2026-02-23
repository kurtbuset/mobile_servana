import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FAQItem from './FAQItem';

/**
 * FAQ List Component
 */
export const FAQList = ({ faqs, title = 'Frequently Asked Questions' }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          icon={faq.icon}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
});

export default FAQList;
