import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch } from "react-redux";
import { setClient } from "../slices/clientSlice";
import AnimatedBackground from "../components/AnimatedBackground";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const SetupComplete = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { client } = route.params || {};

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Dispatch client data to Redux when component mounts
    if (client) {
      dispatch(setClient({ client }));
    }

    // Start animations
    Animated.sequence([
      // Icon animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Text and button animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [client, dispatch]);

  const handleGetStarted = () => {
    navigation.replace("HomeScreen");
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1F1B24" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <AnimatedBackground />
        
        <View style={styles.content}>
          {/* Success Icon with Animation */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotate }
                ],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Feather name="check" size={moderateScale(60)} color="#fff" />
            </View>
          </Animated.View>

          {/* Animated Text Content */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Title */}
            <Text style={styles.title}>All Set Up!</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Your profile has been created successfully.{"\n"}
              Let's get started!
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity 
              onPress={handleGetStarted} 
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Let's Get Started</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SetupComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1B24",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(30),
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: verticalScale(40),
  },
  iconCircle: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: "#6237A0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(20),
    elevation: 15,
    borderWidth: 4,
    borderColor: "rgba(98, 55, 160, 0.3)",
  },
  title: {
    color: "#fff",
    fontSize: moderateScale(32, 0.3),
    fontWeight: "700",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: moderateScale(15),
    marginBottom: verticalScale(50),
    textAlign: "center",
    lineHeight: moderateScale(22),
    paddingHorizontal: moderateScale(10),
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6237A0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    width: "100%",
    gap: moderateScale(8),
    shadowColor: "#6237A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
});
