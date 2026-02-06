import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

const AnimatedBackground = () => {
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blob 1 animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Blob 2 animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Blob 3 animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob3Anim, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob3Anim, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.blob1,
          {
            transform: [
              {
                translateX: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
              {
                translateY: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
              {
                scale: blob1Anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.1, 0.9],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          {
            transform: [
              {
                translateX: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
              {
                translateY: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
              {
                scale: blob2Anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.9, 1.1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob3,
          {
            transform: [
              {
                translateX: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
              {
                translateY: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                scale: blob3Anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.05, 0.95],
                }),
              },
            ],
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  blob1: {
    position: "absolute",
    top: verticalScale(-100),
    right: scale(-100),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: "#6237A0",
    opacity: 0.15,
  },
  blob2: {
    position: "absolute",
    bottom: verticalScale(-120),
    left: scale(-120),
    width: scale(280),
    height: scale(280),
    borderRadius: scale(140),
    backgroundColor: "#8B5CF6",
    opacity: 0.12,
  },
  blob3: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: "#A78BFA",
    opacity: 0.1,
  },
});

export default AnimatedBackground;
