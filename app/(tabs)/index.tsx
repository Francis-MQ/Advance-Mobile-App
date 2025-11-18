// app/(tabs)/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { usePlaylist } from "@/context/PlaylistContext";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";

const thumbs = [
  require("../../assets/images/cover1.jpeg"),
  require("../../assets/images/cover2.jpeg"),
  require("../../assets/images/cover3.jpg"),
  require("../../assets/images/cover4.jpeg"),
  require("../../assets/images/cover5.jpg"),
  require("../../assets/images/cover6.jpeg"),
];

const recentRotation = [
  { id: "r1", title: "God’s Menu", artist: "Stray Kids", cover: thumbs[0] },
  { id: "r2", title: "Black Magic", artist: "Little Mix", cover: thumbs[1] },
  { id: "r3", title: "The One That Got Away", artist: "Katy Perry", cover: thumbs[2] },
];

const madeForYou = [
  { id: "m1", title: "On Repeat", subtitle: "Songs you can’t get enough of", cover: thumbs[3] },
  { id: "m2", title: "Discover Weekly", subtitle: "Your weekly mixtape", cover: thumbs[4] },
  { id: "m3", title: "Focus Mix", subtitle: "Lo-fi, no lyrics", cover: thumbs[5] },
];

const popular = [
  { id: "p1", title: "Daily Mix 2", cover: thumbs[0] },
  { id: "p2", title: "Blink Twice", cover: thumbs[1] },
  { id: "p3", title: "Acoustic Vibes", cover: thumbs[2] },
  { id: "p4", title: "EDM Energy", cover: thumbs[3] },
  { id: "p5", title: "OPM Covers", cover: thumbs[4] },
  { id: "p6", title: "’80s Acoustic Hits", cover: thumbs[5] },
];

export default function HomeScreen() {
  const { state } = usePlaylist();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 32 }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topRow}>
        <TouchableOpacity
          accessibilityLabel="Open navigation menu"
          onPress={() => navigation.getParent()?.openDrawer()}
          style={styles.menuBtn}
        >
          <FontAwesome name="bars" size={20} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.header}>Good morning</Text>
      </View>

      {/* Quick tiles row */}
      <View style={styles.quickRow}>
        <QuickTile title="Daily Mix 2" cover={thumbs[0]} />
        <QuickTile title="Blink Twice" cover={thumbs[1]} />
      </View>

      {/* Your playlist pill */}
      <TouchableOpacity activeOpacity={0.9} style={styles.myPlaylist}>
        <View style={styles.myIconWrap}>
          <FontAwesome name="headphones" size={22} color={WHITE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.myTitle}>My Playlist</Text>
          <Text style={styles.mySub} numberOfLines={1}>
            {state.songs.length} {state.songs.length === 1 ? "song" : "songs"} • live
          </Text>
        </View>
        {state.songs.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{state.songs.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Recent rotation (compact rows) */}
      <SectionHeader title="Your recent rotation" />
      {recentRotation.map((item) => (
        <Row key={item.id} title={item.title} subtitle={item.artist} cover={item.cover} />
      ))}

      {/* Made for you – horizontal cards */}
      <SectionHeader title="Made For You" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={madeForYou}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <CardTall cover={item.cover} title={item.title} subtitle={item.subtitle} />
        )}
      />

      {/* Popular grid */}
      <SectionHeader title="Popular playlists" />
      <View style={styles.grid}>
        {popular.map((p) => (
          <GridCard key={p.id} cover={p.cover} title={p.title} />
        ))}
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function QuickTile({ title, cover }: { title: string; cover: any }) {
  return (
    <View style={styles.quickTile}>
      <Image source={cover} style={styles.quickImg} resizeMode="cover" />
      <Text style={styles.quickTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function Row({
  title,
  subtitle,
  cover,
}: {
  title: string;
  subtitle: string;
  cover: any;
}) {
  return (
    <View style={styles.row}>
      <Image source={cover} style={styles.rowImg} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity accessibilityLabel="More options">
        <FontAwesome name="ellipsis-v" color={WHITE} size={16} />
      </TouchableOpacity>
    </View>
  );
}

function CardTall({
  cover,
  title,
  subtitle,
}: {
  cover: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.tallCard}>
      <Image source={cover} style={styles.tallImg} />
      <Text style={styles.tallTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.tallSub} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

function GridCard({ cover, title }: { cover: any; title: string }) {
  return (
    <View style={styles.gridCard}>
      <Image source={cover} style={styles.gridImg} />
      <Text style={styles.gridTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  menuBtn: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  header: {
    color: WHITE,
    fontSize: 28,
    fontWeight: "800",
  },

  quickRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  quickTile: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    overflow: "hidden",
  },
  quickImg: { width: "100%", height: 72 },
  quickTitle: { color: WHITE, padding: 10, fontWeight: "700" },

  myPlaylist: {
    marginHorizontal: 16,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  myIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#173e2a",
    alignItems: "center",
    justifyContent: "center",
  },
  myTitle: { color: WHITE, fontWeight: "800", fontSize: 16 },
  mySub: { color: MUTED, marginTop: 2, fontSize: 12 },
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

  sectionHeader: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowImg: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#2b2b2b" },
  rowTitle: { color: WHITE, fontWeight: "700" },
  rowSub: { color: MUTED, fontSize: 12, marginTop: 2 },

  tallCard: {
    width: 180,
    backgroundColor: CARD,
    borderRadius: 14,
    overflow: "hidden",
    paddingBottom: 10,
  },
  tallImg: { width: "100%", height: 140 },
  tallTitle: { color: WHITE, fontWeight: "700", paddingHorizontal: 10, marginTop: 8 },
  tallSub: { color: MUTED, fontSize: 12, paddingHorizontal: 10, marginTop: 2 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  gridCard: {
    width: "47.5%",
    backgroundColor: CARD,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
  },
  gridImg: { width: "100%", aspectRatio: 1 },
  gridTitle: { color: WHITE, fontWeight: "700", padding: 10 },
});
