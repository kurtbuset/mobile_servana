import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { ROUTES } from '../../config/navigation';
import Feather from 'react-native-vector-icons/Feather';

/**
 * Sign Up Success Screen (Viber Style)
 * Shows success animation and auto-navigates to dashboard
 */
export default function SignUpSuccessScreen() {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to dashboard after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.HOME);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigation.replace(ROUTES.HOME);
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Feather name="check" size={60} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.title}>Welcome to Servana!</Text>
            <Text style={styles.subtitle}>
              Your account has been created successfully
            </Text>
            <Text style={styles.description}>
              Get ready to experience amazing features
            </Text>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Button
              title="Get Started"
              onPress={handleContinue}
              size="large"
              style={styles.button}
            />

            <Text style={styles.autoText}>
              Redirecting automatically...
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  checkmarkContainer: {
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  autoText: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
  },
});
