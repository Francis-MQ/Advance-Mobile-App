import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";   // 👈 import router
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();  // 👈 initialize router

  const toggleNotifications = () => {
    setNotifications((prev) => !prev);
    Haptics.selectionAsync();
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    Haptics.selectionAsync();
  };

  const logout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Logout", "You have been logged out.", [
      {
        text: "OK",
        onPress: () => {
          // 👇 navigate back to login
          router.replace("/login"); 
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        {/* Notifications toggle */}
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            thumbColor={notifications ? C.green : "#888"}
            trackColor={{ false: "#333", true: "#1db95455" }}
          />
        </View>

        {/* Dark Mode toggle */}
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            thumbColor={darkMode ? C.green : "#888"}
            trackColor={{ false: "#333", true: "#1db95455" }}
          />
        </View>
      </View>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.btnShadow}
        activeOpacity={0.9}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <LinearGradient
          colors={[C.green, C.greenDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 20, gap: 16 },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: C.text, fontSize: 16, fontWeight: "600" },

  btnShadow: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 20,
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
    color: C.bg,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
