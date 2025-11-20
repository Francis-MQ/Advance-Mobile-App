// redux/themeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "custom";

export interface ThemeState {
  mode: ThemeMode;
  accent: string;
}

const initialState: ThemeState = {
  mode: "dark",
  accent: "#1DB954", // Spotify green
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    setAccent(state, action: PayloadAction<string>) {
      state.accent = action.payload;
    },
    hydrateTheme(_state, action: PayloadAction<ThemeState>) {
      // Replace whole slice with persisted value
      return action.payload;
    },
  },
});

export const { setTheme, setAccent, hydrateTheme } = themeSlice.actions;
export default themeSlice.reducer;
