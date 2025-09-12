import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#fff";
const MUTED = "#b3b3b3";

// ---- Mock playlists
const DATA = [
  { id: "1", title: "Daily Mix 1",   subtitle: "Indie • Chill",     cover: require("../../assets/images/cover1.jpeg") },
  { id: "2", title: "Top Hits",      subtitle: "Pop • Today",       cover: require("../../assets/images/cover2.jpeg") },
  { id: "3", title: "Coding Focus",  subtitle: "Lo-fi • Beats",     cover: require("../../assets/images/cover3.jpg") },
  { id: "4", title: "Workout Boost", subtitle: "EDM • Energy",      cover: require("../../assets/images/cover4.jpeg") },
  { id: "5", title: "OPM Vibes",     subtitle: "Pinoy • Feel-good", cover: require("../../assets/images/cover5.jpg") },
  { id: "6", title: "Acoustic Chill",subtitle: "Acoustic • Calm",   cover: require("../../assets/images/cover6.jpeg") },
];

export default function PlaylistsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>Playlists</Text>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listPad}
        renderItem={({ item }) => {
          const coverUri = Image.resolveAssetSource(item.cover).uri;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/playlist/[id]",
                  params: { id: item.id, title: item.title, cover: coverUri },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title}`}
            >
              {/* Force a perfect square for the cover */}
              <View style={styles.coverWrap}>
                <Image source={item.cover} style={styles.cover} resizeMode="cover" />
              </View>

              {/* Fixed-height text block so every card has same height */}
              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingTop: 8 },
  header: {
    color: WHITE,
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  listPad: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 12 },

  card: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  // square wrapper defines exact image box
  coverWrap: {
    width: "100%",
    aspectRatio: 1, // exact square
    borderRadius: 12,
    overflow: "hidden", // round corners on the image
    marginBottom: 10,
  },
  cover: { width: "100%", height: "100%" },

  // fixed text region to normalize heights
  meta: { minHeight: 44, justifyContent: "center" },
  title: { color: WHITE, fontWeight: "700" },
  subtitle: { color: MUTED, marginTop: 2, fontSize: 12 },
});
