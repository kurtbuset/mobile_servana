import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ErrorModal = ({ visible, message, onClose, title = "Oops!" }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <Feather name="alert-circle" size={40} color="#FF6B6B" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(30),
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    backgroundColor: "#2A2730",
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: "center",
    width: "100%",
    maxWidth: moderateScale(320),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  iconContainer: {
    marginBottom: verticalScale(12),
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: moderateScale(40),
    padding: moderateScale(12),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#fff",
    marginBottom: verticalScale(8),
  },
  message: {
    fontSize: moderateScale(14),
    color: "#B8B8B8",
    textAlign: "center",
    marginBottom: verticalScale(18),
    lineHeight: moderateScale(20),
    paddingHorizontal: moderateScale(5),
  },
  button: {
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(35),
    width: "100%",
    alignItems: "center",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(6),
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});

export default ErrorModal;
