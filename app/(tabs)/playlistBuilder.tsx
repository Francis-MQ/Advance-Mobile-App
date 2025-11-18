// app/(tabs)/playlistBuilder.tsx
import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Alert,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import AnimatedRe, { FadeInDown, FadeOutUp, Layout } from "react-native-reanimated";

// 🔗 shared playlist state
import { usePlaylist, usePlaylistActions } from "@/context/PlaylistContext";

const BG = "#121212";
const CARD = "#181818";
const FIELD = "#222";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";
const RED = "#ff5d5d";

type Song = { id: string; title: string };

// Animated + memoized row
const SongRow = React.memo(function SongRow({
  song,
  onRemove,
}: {
  song: Song;
  onRemove: (id: string) => void;
}) {
  return (
    <AnimatedRe.View
      layout={Layout.springify().damping(18)}
      entering={FadeInDown.springify().mass(0.6)}
      exiting={FadeOutUp.duration(180)}
      style={styles.row}
    >
      <Text style={styles.songTitle} numberOfLines={1}>
        {song.title}
      </Text>
      <TouchableOpacity
        accessibilityLabel={`Remove ${song.title}`}
        onPress={() => onRemove(song.id)}
        style={styles.iconBtn}
      >
        <FontAwesome name="trash" size={16} color={WHITE} />
      </TouchableOpacity>
    </AnimatedRe.View>
  );
});

export default function PlaylistBuilderScreen() {
  const { state } = usePlaylist();
  const { addSong, removeSong, clearSongs, undo, redo } = usePlaylistActions();
  const [text, setText] = useState("");

  // --------- Tiny toast (no extra libs) ----------
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toastOpacity]);

  // --------- Handlers ----------
  const onAdd = useCallback(async () => {
    const t = text.trim();
    if (!t) return;
    await Haptics.selectionAsync();
    addSong(t);
    setText("");
    showToast(`Added “${t}”`);
  }, [text, addSong, showToast]);

  const onRemove = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeSong(id);
    showToast("Removed from playlist");
  }, [removeSong, showToast]);

  const onClearAll = useCallback(() => {
    if (state.songs.length === 0) return;
    Alert.alert("Clear playlist?", "This will remove all songs.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearSongs();
          showToast("Playlist cleared");
        },
      },
    ]);
  }, [state.songs.length, clearSongs, showToast]);

  const onUndo = useCallback(async () => {
    if (state.past.length === 0) return;
    await Haptics.selectionAsync();
    undo();
    showToast("Undid last action");
  }, [undo, state.past.length, showToast]);

  const onRedo = useCallback(async () => {
    if (state.future.length === 0) return;
    await Haptics.selectionAsync();
    redo();
    showToast("Redid action");
  }, [redo, state.future.length, showToast]);

  // --------- Derived state ----------
  const songCount = state.songs.length;
  const lastFiveHistory = useMemo(() => state.history.slice(0, 5), [state.history]);
  const canUndo = state.past?.length > 0;
  const canRedo = state.future?.length > 0;

  return (
    <View style={styles.root}>
      {/* Header / Counter */}
      <View style={styles.header}>
        <Text style={styles.title}>Playlist Builder</Text>
        <Text style={styles.counter}>
          {songCount} song{songCount === 1 ? "" : "s"}
        </Text>
      </View>

      {/* Input + Add */}
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a song name..."
          placeholderTextColor={MUTED}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onAdd}
        />
        <TouchableOpacity
          accessibilityLabel="Add song"
          style={[styles.addBtn, !text.trim() && { opacity: 0.5 }]}
          onPress={onAdd}
          disabled={!text.trim()}
        >
          <FontAwesome name="plus" size={16} color={"#0e3d22"} />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onClearAll}
          disabled={state.songs.length === 0}
          style={[styles.clearBtn, state.songs.length === 0 && { opacity: 0.5 }]}
        >
          <FontAwesome name="trash" size={14} color={WHITE} />
          <Text style={styles.clearText}>Clear Playlist</Text>
        </TouchableOpacity>

        {/* Undo / Redo */}
        <View style={{ flexDirection: "row", gap: 8, marginLeft: 8 }}>
          <TouchableOpacity
            style={[styles.undoRedoBtn, !canUndo && { opacity: 0.4 }]}
            onPress={onUndo}
            disabled={!canUndo}
          >
            <FontAwesome name="undo" size={14} color={WHITE} />
            <Text style={styles.undoRedoText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.undoRedoBtn, !canRedo && { opacity: 0.4 }]}
            onPress={onRedo}
            disabled={!canRedo}
          >
            <FontAwesome name="repeat" size={14} color={WHITE} />
            <Text style={styles.undoRedoText}>Redo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Songs List */}
      <View style={styles.card}>
        {state.songs.length === 0 ? (
          <AnimatedRe.Text entering={FadeInDown.duration(180)} style={styles.emptyText}>
            No songs yet. Add your first track!
          </AnimatedRe.Text>
        ) : (
          <FlatList
            data={state.songs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => <SongRow song={item} onRemove={onRemove} />}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      {/* History (latest) */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionLabel}>Recent Actions</Text>
        {lastFiveHistory.length === 0 ? (
          <Text style={styles.muted}>No history yet.</Text>
        ) : (
          lastFiveHistory.map((h) => {
            const time = new Date(h.timestamp).toLocaleTimeString();
            if (h.type === "ADD") {
              return (
                <Text key={h.id} style={styles.historyRow}>
                  <Text style={styles.badgeAdd}>ADD</Text>{" "}
                  <Text style={styles.white}>{h.title}</Text> · {time}
                </Text>
              );
            }
            if (h.type === "REMOVE") {
              return (
                <Text key={h.id} style={styles.historyRow}>
                  <Text style={styles.badgeRemove}>REM</Text>{" "}
                  <Text style={styles.white}>{h.title}</Text> · {time}
                </Text>
              );
            }
            return (
              <Text key={h.id} style={styles.historyRow}>
                <Text style={styles.badgeClear}>CLR</Text> cleared (
                {(h as any).count}) · {time}
              </Text>
            );
          })
        )}
      </View>

      {/* Toast */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { opacity: toastOpacity, transform: [{ translateY: toastOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }) }] },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, padding: 16, paddingTop: Platform.OS === "ios" ? 18 : 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { color: WHITE, fontSize: 22, fontWeight: "800" },
  counter: { color: MUTED, fontWeight: "600" },

  inputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  input: {
    flex: 1,
    backgroundColor: FIELD,
    color: WHITE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2c2c2c",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addText: { color: "#0e3d22", fontWeight: "800" },

  actionsRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8, alignItems: "center" },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: RED,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearText: { color: WHITE, fontWeight: "700" },
  undoRedoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2b2b2b",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  undoRedoText: { color: WHITE, fontWeight: "700" },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2b2b2b",
  },
  songTitle: { color: WHITE, flex: 1, fontWeight: "600" },
  iconBtn: { backgroundColor: "#2a2a2a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  sectionLabel: { color: WHITE, fontWeight: "800", marginBottom: 8 },
  historyRow: { color: MUTED, marginBottom: 4 },
  muted: { color: MUTED },
  white: { color: WHITE },
  badgeAdd: {
    color: "#0f713a",
    backgroundColor: "#56f1a1",
    fontWeight: "900",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeRemove: {
    color: "#6d1010",
    backgroundColor: "#ffb0b0",
    fontWeight: "900",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeClear: {
    color: "#593400",
    backgroundColor: "#ffd28a",
    fontWeight: "900",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 12,
  },

  // Toast
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#222",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
  },
  toastText: { color: WHITE, textAlign: "center", fontWeight: "700" },
});
