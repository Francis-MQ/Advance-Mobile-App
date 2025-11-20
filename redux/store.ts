// redux/store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer, { ThemeState, hydrateTheme } from "./themeSlice";

const PERSIST_KEY = "THEME_STORE_V1";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

// Persist theme slice on every change
store.subscribe(() => {
  const state = store.getState();
  const theme: ThemeState = state.theme;
  AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(theme)).catch((e) =>
    console.warn("Theme persist failed:", e)
  );
});

// Load theme slice once on app start
export async function loadThemeFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as ThemeState;
    store.dispatch(hydrateTheme(parsed));
  } catch (e) {
    console.warn("Theme hydrate failed:", e);
  }
}

// Infer types for hooks and selectors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
