// context/PlaylistContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
  } from "react";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const STORAGE_KEY = "PLAYLIST_STATE_V1";
  
  // ---------- Types ----------
  export type Song = { id: string; title: string };
  
  export type HistoryEntry =
    | { id: string; type: "ADD"; title: string; timestamp: number }
    | { id: string; type: "REMOVE"; title: string; timestamp: number }
    | { id: string; type: "CLEAR"; count: number; timestamp: number };
  
  type Snapshot = { songs: Song[]; history: HistoryEntry[] };
  
  type State = Snapshot & {
    past: Snapshot[];   // stack (top at index 0)
    future: Snapshot[]; // stack (top at index 0)
  };
  
  type Action =
    | { type: "ADD_SONG"; title: string }
    | { type: "REMOVE_SONG"; id: string }
    | { type: "CLEAR_SONGS" }
    | { type: "HYDRATE"; payload: State }
    | { type: "UNDO" }
    | { type: "REDO" };
  
  const initialState: State = {
    songs: [],
    history: [],
    past: [],
    future: [],
  };
  
  // ---------- Reducer ----------
  const nowId = () => String(Date.now() + Math.random());
  
  const pushPast = (state: State): State["past"] => {
    const snap: Snapshot = { songs: state.songs, history: state.history };
    const next = [snap, ...state.past];
    return next.slice(0, 50);
  };
  
  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "HYDRATE":
        return action.payload;
  
      case "ADD_SONG": {
        const title = action.title.trim();
        if (!title) return state;
        const song: Song = { id: nowId(), title };
        const entry: HistoryEntry = {
          id: nowId(),
          type: "ADD",
          title,
          timestamp: Date.now(),
        };
        return {
          songs: [song, ...state.songs],
          history: [entry, ...state.history],
          past: pushPast(state),
          future: [], // invalidate redo stack on new change
        };
      }
  
      case "REMOVE_SONG": {
        const song = state.songs.find((s) => s.id === action.id);
        const nextSongs = state.songs.filter((s) => s.id !== action.id);
        const entry: HistoryEntry = {
          id: nowId(),
          type: "REMOVE",
          title: song?.title ?? "",
          timestamp: Date.now(),
        };
        return {
          songs: nextSongs,
          history: [entry, ...state.history],
          past: pushPast(state),
          future: [],
        };
      }
  
      case "CLEAR_SONGS": {
        if (state.songs.length === 0) return state;
        const entry: HistoryEntry = {
          id: nowId(),
          type: "CLEAR",
          count: state.songs.length,
          timestamp: Date.now(),
        };
        return {
          songs: [],
          history: [entry, ...state.history],
          past: pushPast(state),
          future: [],
        };
      }
  
      case "UNDO": {
        const [prev, ...rest] = state.past;
        if (!prev) return state;
        const current: Snapshot = { songs: state.songs, history: state.history };
        return { songs: prev.songs, history: prev.history, past: rest, future: [current, ...state.future] };
      }
  
      case "REDO": {
        const [next, ...rest] = state.future;
        if (!next) return state;
        const current: Snapshot = { songs: state.songs, history: state.history };
        return { songs: next.songs, history: next.history, past: [current, ...state.past], future: rest };
      }
  
      default:
        return state;
    }
  }
  
  // ---------- Contexts ----------
  type PlaylistContextValue = { state: State; isHydrated: boolean };
  type PlaylistActions = {
    addSong: (title: string) => void;
    removeSong: (id: string) => void;
    clearSongs: () => void;
    undo: () => void;
    redo: () => void;
  };
  
  const StateCtx = createContext<PlaylistContextValue | undefined>(undefined);
  const ActionsCtx = createContext<PlaylistActions | undefined>(undefined);
  
  // ---------- Provider ----------
  export function PlaylistProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const hydratedRef = useRef(false);
  
    // hydrate once
    useEffect(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as State;
            if (parsed && typeof parsed === "object") {
              dispatch({ type: "HYDRATE", payload: parsed });
            }
          }
        } catch (e) {
          console.warn("Playlist hydrate failed:", e);
        } finally {
          hydratedRef.current = true;
        }
      })();
    }, []);
  
    // persist after hydration
    useEffect(() => {
      if (!hydratedRef.current) return;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
        console.warn("Playlist persist failed:", e)
      );
    }, [state]);
  
    const actions = useMemo<PlaylistActions>(
      () => ({
        addSong: (title) => dispatch({ type: "ADD_SONG", title }),
        removeSong: (id) => dispatch({ type: "REMOVE_SONG", id }),
        clearSongs: () => dispatch({ type: "CLEAR_SONGS" }),
        undo: () => dispatch({ type: "UNDO" }),
        redo: () => dispatch({ type: "REDO" }),
      }),
      []
    );
  
    const value = useMemo<PlaylistContextValue>(
      () => ({ state, isHydrated: hydratedRef.current }),
      [state]
    );
  
    return (
      <StateCtx.Provider value={value}>
        <ActionsCtx.Provider value={actions}>{children}</ActionsCtx.Provider>
      </StateCtx.Provider>
    );
  }
  
  // ---------- Hooks ----------
  export function usePlaylist() {
    const ctx = useContext(StateCtx);
    if (!ctx) throw new Error("usePlaylist must be used inside <PlaylistProvider>");
    return ctx;
  }
  export function usePlaylistActions() {
    const ctx = useContext(ActionsCtx);
    if (!ctx) throw new Error("usePlaylistActions must be used inside <PlaylistProvider>");
    return ctx;
  }
  