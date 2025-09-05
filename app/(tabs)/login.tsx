import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// ---- Theme (Spotify-ish)
const SPOTIFY_GREEN = "#1DB954";
const GREEN_DARK = "#169c46";
const BG = "#121212";
const CARD = "#181818";
const FIELD = "#222";
const MUTED = "#b3b3b3";
const WHITE = "#ffffff";

export default function LoginScreen() {
  // animation for logo + wordmark
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Signing in", "Demo action – wire your auth here.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Wordmark (animated) */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brand}>Spotify</Text>
        </Animated.View>

        {/* Form card */}
        <View style={styles.card} accessible accessibilityLabel="Login form">
          <TextInput
            style={styles.input}
            placeholder="Username or email"
            placeholderTextColor={MUTED}
            keyboardType="email-address"
            textContentType="username"
            autoCapitalize="none"
            returnKeyType="next"
            accessibilityLabel="Username or email"
            accessibilityHint="Enter your Spotify username or email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={MUTED}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
            accessibilityLabel="Password"
            accessibilityHint="Enter your password"
          />

          {/* Primary button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={onSignIn}
            style={styles.btnShadow}
          >
            <LinearGradient
              colors={[SPOTIFY_GREEN, GREEN_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Forgot Password", "This would open the reset flow.")
            }
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Social sign-in row (circular buttons only) */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => Alert.alert("Facebook", "Continue with Facebook")}
          >
            <FontAwesome name="facebook" size={22} color={WHITE} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => Alert.alert("Google", "Continue with Google")}
          >
            <FontAwesome name="google" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Sign Up", "This would open sign up.")}
          >
            <Text style={[styles.footerText, { color: SPOTIFY_GREEN }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40, justifyContent: "center" },

  // header
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logoContainer: { alignItems: "center", justifyContent: "center" },
  logo: { width: 140, height: 140 },
  brand: { color: WHITE, fontSize: 28, fontWeight: "800", marginTop: 6 },

  // card
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: FIELD,
    color: WHITE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2c2c2c",
  },

  // primary button
  btnShadow: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  primaryBtn: {
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryBtnText: {
    color: BG,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  linkText: { color: MUTED, textAlign: "center", marginTop: 10 },

  // new circular social buttons
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 16,
    marginBottom: 16,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#181818", // dark circle
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // Android glow
    shadowColor: "#000", // iOS glow
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  footerText: { color: MUTED },
});
