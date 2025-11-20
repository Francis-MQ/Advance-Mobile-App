// app/(tabs)/themeSettings.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { setTheme, setAccent, ThemeMode } from "@/redux/themeSlice";
import { useThemeColors } from "@/hooks/useThemeColors";
import * as Haptics from "expo-haptics";

const PRESET_ACCENTS = ["#1DB954", "#FF6B6B", "#4DA8DA", "#F5C518"];

export default function ThemeSettings() {
  const dispatch = useDispatch();
  const colors = useThemeColors();

  const changeMode = async (mode: ThemeMode) => {
    await Haptics.selectionAsync();
    dispatch(setTheme(mode));
  };

  const changeAccent = async (accent: string) => {
    await Haptics.selectionAsync();
    dispatch(setAccent(accent));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Text style={[styles.header, { color: colors.text }]}>Theme Settings</Text>

      <Text style={[styles.label, { color: colors.text }]}>Mode</Text>
      <View style={styles.row}>
        {(["light", "dark", "custom"] as ThemeMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => changeMode(mode)}
            style={[
              styles.modeBtn,
              {
                borderColor: colors.accent,
                backgroundColor:
                  colors.mode === mode ? colors.accent : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.modeText,
                {
                  color: colors.mode === mode ? "#000" : colors.text,
                },
              ]}
            >
              {mode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>
        Accent color
      </Text>
      <View style={styles.row}>
        {PRESET_ACCENTS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => changeAccent(c)}
            style={[
              styles.swatch,
              {
                backgroundColor: c,
                borderWidth: c === colors.accent ? 3 : 1,
                borderColor: c === colors.accent ? "#fff" : "#333",
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>
          Preview
        </Text>
        <Text style={{ color: colors.text }}>
          Mode: <Text style={{ color: colors.accent }}>{colors.mode}</Text>
        </Text>
        <Text style={{ color: colors.text }}>
          Accent: <Text style={{ color: colors.accent }}>{colors.accent}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  modeText: { fontWeight: "700", fontSize: 12 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  previewCard: {
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
});
