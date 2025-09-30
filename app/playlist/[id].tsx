import React from "react";
import { View, Text, StyleSheet, Image, FlatList, StatusBar } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

const BG = "#121212";
const WHITE = "#fff";
const MUTED = "#b3b3b3";

// mock tracks
const tracks = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Track ${i + 1}`,
  artist: i % 2 ? "Various Artists" : "Artist Name",
}));

export default function PlaylistDetail() {
  const { id, title, cover } = useLocalSearchParams<{
    id: string;
    title: string;
    cover: string;
  }>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Image source={{ uri: cover }} style={styles.cover} />
      <Text style={styles.title}>{title || `Playlist ${id}`}</Text>
      <Text style={styles.subtitle}>Public • 12 songs</Text>

      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.track}>{item.title}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
            </View>
          </View>
        )}
      />
      <Stack.Screen
        options={{
          title: "Playlist",
          headerStyle: { backgroundColor: BG },
          headerTintColor: WHITE,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  cover: { width: "100%", aspectRatio: 1, marginBottom: 16 },
  title: { color: WHITE, fontSize: 26, fontWeight: "800", paddingHorizontal: 16 },
  subtitle: { color: MUTED, paddingHorizontal: 16, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  index: { color: MUTED, width: 24, textAlign: "center" },
  track: { color: WHITE, fontWeight: "600" },
  artist: { color: MUTED, fontSize: 12, marginTop: 2 },
});
