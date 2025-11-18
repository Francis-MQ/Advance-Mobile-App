// app/playlist/custom.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutUp, Layout } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";

import { usePlaylist, usePlaylistActions } from "@/context/PlaylistContext";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#fff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";
const RED = "#ff5d5d";

export default function CustomPlaylistScreen() {
  const router = useRouter();
  const { state } = usePlaylist();
  const { removeSong, clearSongs } = usePlaylistActions();

  const count = state.songs.length;

  const onClear = () => {
    if (count === 0) return;
    Alert.alert("Clear playlist?", "This will remove all songs.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearSongs },
    ]);
  };

  const onPlay = () => {
    if (count === 0) return;
    Alert.alert("Play", `Playing ${count} ${count === 1 ? "song" : "songs"}`);
  };

  const onShuffle = () => {
    if (count === 0) return;
    Alert.alert("Shuffle", "Shuffling your playlist 🎲");
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
          <FontAwesome name="chevron-left" size={16} color={WHITE} />
        </Pressable>
        <Text style={styles.title}>My Playlist</Text>
        <Pressable
          hitSlop={8}
          disabled={count === 0}
          onPress={onClear}
          style={[styles.iconBtn, count === 0 && { opacity: 0.35 }]}
        >
          <FontAwesome name="trash" size={16} color={WHITE} />
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          android_ripple={{ color: "#1a3a2a" }}
          style={[styles.playBtn, count === 0 && { opacity: 0.35 }]}
          disabled={count === 0}
          onPress={onPlay}
        >
          <FontAwesome name="play" size={14} color={"#0e3d22"} />
          <Text style={styles.playText}>Play</Text>
        </Pressable>
        <Pressable
          android_ripple={{ color: "#2a2a2a" }}
          style={[styles.shuffleBtn, count === 0 && { opacity: 0.35 }]}
          disabled={count === 0}
          onPress={onShuffle}
        >
          <FontAwesome name="random" size={14} color={WHITE} />
          <Text style={styles.shuffleText}>Shuffle</Text>
        </Pressable>
      </View>

      {/* Content */}
      {count === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Your playlist is empty.</Text>
          <Pressable
            android_ripple={{ color: "#1a3a2a" }}
            onPress={() => router.push("/(tabs)/playlistBuilder")}
            style={styles.goBuild}
          >
            <FontAwesome name="plus" size={14} color={"#0e3d22"} />
            <Text style={styles.goBuildText}>Add songs in Playlist Builder</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={state.songs}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item, index }) => (
            <Animated.View
              layout={Layout.springify().damping(18)}
              entering={FadeInDown.delay(40 + index * 30)}
              exiting={FadeOutUp.duration(160)}
            >
              <Swipeable
                overshootRight={false}
                renderRightActions={() => (
                  <View style={styles.swipeDelete}>
                    <FontAwesome name="trash" size={16} color={WHITE} />
                  </View>
                )}
                onEnded={() => {
                  // gesture finished; deletion handled on open
                }}
                onSwipeableOpen={(dir) => {
                  if (dir === "right") removeSong(item.id);
                }}
              >
                <View style={styles.row}>
                  <View style={styles.dot} />
                  <Text style={styles.song} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Pressable onPress={() => removeSong(item.id)} hitSlop={8} style={styles.rowBtn}>
                    <FontAwesome name="trash" size={14} color={WHITE} />
                  </Pressable>
                </View>
              </Swipeable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingTop: Platform.OS === "ios" ? 14 : 6 },
  header: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2b2b2b",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: WHITE, fontSize: 18, fontWeight: "900" },

  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  playBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  playText: { color: "#0e3d22", fontWeight: "900" },
  shuffleBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#2b2b2b",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  shuffleText: { color: WHITE, fontWeight: "900" },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { color: MUTED, fontSize: 16 },
  goBuild: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  goBuildText: { color: "#0e3d22", fontWeight: "900" },

  row: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    opacity: 0.8,
  },
  song: { color: WHITE, flex: 1, fontWeight: "700" },
  rowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },

  swipeDelete: {
    width: 72,
    backgroundColor: RED,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
