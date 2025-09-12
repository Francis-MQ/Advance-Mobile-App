import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

export default function ProfileScreen() {
  const onEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Edit Profile", "Wire your edit/profile form here.");
  };

  return (
    <View style={styles.root}>

      {/* Card with avatar + info */}
      <View style={styles.card} accessible accessibilityLabel="Profile card">
        <View style={styles.avatarWrap} accessibilityLabel="Profile picture">
          <View style={styles.avatarGlow} />
          <View style={styles.avatar}>
            <FontAwesome name="user" size={42} color={C.text} />
          </View>
        </View>

        <Text style={styles.name} accessibilityRole="header">
          Francis Daniel V. Austria
        </Text>
        <Text style={styles.email}>francis@example.com</Text>

        {/* Edit profile button */}
        <TouchableOpacity
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          activeOpacity={0.9}
          style={styles.btnShadow}
        >
          <LinearGradient
            colors={[C.green, C.greenDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quick actions (mock) */}
      <View style={styles.row}>
        <View style={styles.quickCard}>
          <FontAwesome name="music" size={20} color={C.text} />
          <Text style={styles.quickText}>My Playlists</Text>
        </View>
        <View style={styles.quickCard}>
          <FontAwesome name="heart" size={20} color={C.text} />
          <Text style={styles.quickText}>Liked Songs</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
    gap: 16,
  },

  // card
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  // avatar
  avatarWrap: { marginBottom: 14 },
  avatarGlow: {
    position: "absolute",
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1db95422",
    top: -6,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2f2f2f",
  },

  name: { color: C.text, fontSize: 22, fontWeight: "800", marginTop: 4 },
  email: { color: C.muted, marginTop: 2, marginBottom: 12 },

  // primary button
  btnShadow: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    alignSelf: "stretch",
  },
  primaryBtn: {
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: C.bg,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // quick actions row
  row: { flexDirection: "row", gap: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quickText: { color: C.text, fontWeight: "700" },
});
