import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ScreenHeader = ({ title, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: moderateScale(40) }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(98, 55, 160, 0.2)",
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
  },
  title: {
    color: "#fff",
    fontSize: moderateScale(24, 0.3),
    fontWeight: "700",
  },
});

export default ScreenHeader;
