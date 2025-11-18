// components/DrawerContent.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { usePlaylist } from "@/context/PlaylistContext";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";

type ProfileState = {
  username: string;
  email: string;
  genre?: string;
  avatarUri?: string | null;
};

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { state } = usePlaylist();
  const [profile, setProfile] = useState<ProfileState>({
    username: "Guest",
    email: "guest@example.com",
    genre: "Pop",
    avatarUri: null,
  });

  // Read future Activity 2 cache if it exists
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("PROFILE_FORM_V1");
        if (raw) {
          const data = JSON.parse(raw) as {
            username?: string;
            email?: string;
            genre?: string;
          };
          setProfile({
            username: data.username || "Guest",
            email: data.email || "guest@example.com",
            genre: data.genre || "Pop",
            avatarUri: `https://via.placeholder.com/80?text=${encodeURIComponent(
              (data.genre || "User").toUpperCase()
            )}`,
          });
        }
      } catch {
        // ignore – we’ll just show defaults
      }
    })();
  }, []);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: BG, paddingTop: 0 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
          ) : (
            <FontAwesome name="user" size={28} color={WHITE} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.username}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {profile.email}
          </Text>
        </View>

        {/* Live song count from shared playlist */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{state.songs.length}</Text>
        </View>
      </View>

      <View style={styles.headerFooter}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => props.navigation.navigate("Profile" as never)}
        >
          <FontAwesome name="pencil" size={12} color={WHITE} />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Default drawer items (Main Tabs, Playlist Builder, Auth, Profile, Settings…) */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  name: { color: WHITE, fontWeight: "800", fontSize: 18 },
  email: { color: MUTED, marginTop: 2, fontSize: 12 },
  badge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#0e3d22", fontWeight: "800" },
  headerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: CARD,
    borderRadius: 999,
  },
  editText: { color: WHITE, fontWeight: "700", fontSize: 12 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2a2a2a",
    marginVertical: 10,
    marginHorizontal: 16,
  },
});
