// hooks/useThemeColors.ts
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { ThemeMode } from "@/redux/themeSlice";

export type ThemeColors = {
  bg: string;
  text: string;
  card: string;
  accent: string;
};

export function useThemeColors(): ThemeColors & { mode: ThemeMode } {
  const { mode, accent } = useSelector((state: RootState) => state.theme);

  const themes: Record<ThemeMode, ThemeColors> = {
    light: {
      bg: "#ffffff",
      text: "#000000",
      card: "#e6e6e6",
      accent,
    },
    dark: {
      bg: "#121212",
      text: "#ffffff",
      card: "#181818",
      accent,
    },
    custom: {
      bg: "#0f0f0f",
      text: "#ffffff",
      card: "#1a1a1a",
      accent,
    },
  };

  const palette = themes[mode];

  return { ...palette, mode };
}
