import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconWrapper}>
        <Feather name="check-circle" size={80} color="green" />
      </View>
      <Text style={styles.title}>Success!</Text>
      <Text style={styles.message}>Your password has been changed successfully</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ChangePassword')} // or wherever you'd like to go
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'purple',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
