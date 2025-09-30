// app/(auth)/signup.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

// ---- Theme (Spotify-ish)
const SPOTIFY_GREEN = "#1DB954";
const GREEN_DARK = "#169c46";
const BG = "#121212";
const CARD = "#181818";
const FIELD = "#222";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";

// Auth stack routes (same as login.tsx)
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  App: undefined; // ✅ main drawer
};

export default function SignUpScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const onSignUp = () => {
    // ✅ after sign up, go straight to drawer
    navigation.replace("App");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Create Account</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={MUTED}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={MUTED}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={MUTED}
            secureTextEntry
          />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.btnShadow} onPress={onSignUp}>
            <LinearGradient
              colors={[SPOTIFY_GREEN, GREEN_DARK]}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.footerText, { color: SPOTIFY_GREEN }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: {
    color: WHITE,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
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
  btnShadow: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
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
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  footerText: { color: MUTED },
});
