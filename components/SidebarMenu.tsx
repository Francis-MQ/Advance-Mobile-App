import React, { createContext, useContext, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
  StatusBar,
  BackHandler,
  Pressable,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#121212';
const CARD = '#181818';
const WHITE = '#fff';
const SPOTIFY_GREEN = '#1DB954';

type MenuCtx = { open: () => void; close: () => void; toggle: () => void; isOpen: boolean };
const MenuContext = createContext<MenuCtx | null>(null);

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within <MenuProvider>');
  return ctx;
};

export const MenuProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { width: screenW } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.floor(screenW * 0.78));
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-drawerWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Persist drawer open/close state
  useEffect(() => {
    AsyncStorage.setItem('@drawer_state', JSON.stringify({ drawerOpen: isOpen }));
  }, [isOpen]);

  // Animate drawer
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: isOpen ? 0 : -drawerWidth, duration: 260, useNativeDriver: true }),
      Animated.timing(fade, { toValue: isOpen ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [isOpen, drawerWidth, slideX, fade]);

  // Android back closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setIsOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  // Separate gestures for open/close
  const openGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isOpen && e.translationX > 0) slideX.setValue(Math.min(e.translationX - drawerWidth, 0));
    })
    .onEnd((e) => {
      if (!isOpen && e.translationX > 50) open();
      else slideX.setValue(-drawerWidth);
    });

  const closeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isOpen && e.translationX < 0) slideX.setValue(Math.max(e.translationX, -drawerWidth));
    })
    .onEnd((e) => {
      if (isOpen && e.translationX < -50) close();
      else slideX.setValue(0);
    });

  const items: { label: string; route: string; icon: keyof typeof FontAwesome.glyphMap }[] = [
    { label: 'Home', route: '/(tabs)/index', icon: 'home' },
    { label: 'Explore', route: '/(tabs)/two', icon: 'paper-plane' },
    { label: 'Showcase', route: '/(tabs)/showcase', icon: 'th-large' },
    { label: 'Playlists', route: '/(tabs)/playlists', icon: 'music' },
    { label: 'Profile', route: '/(tabs)/profile', icon: 'user' },
    { label: 'Settings', route: '/(tabs)/settings', icon: 'cogs' },
    { label: 'Login', route: '/(tabs)/login', icon: 'sign-in' },
  ];

  const headerTopPad = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <MenuContext.Provider value={value}>
      {children}

      {/* Backdrop */}
      {isOpen && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: fade }]} />
      )}

      {/* Edge swipe zone */}
      {!isOpen && (
        <GestureDetector gesture={openGesture}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24 }} />
        </GestureDetector>
      )}

      {/* Drawer panel */}
      <GestureDetector gesture={closeGesture}>
        <Animated.View style={[styles.drawer, { width: drawerWidth, transform: [{ translateX: slideX }], paddingTop: 48 + headerTopPad }]}>
          <View style={styles.headerRow}>
            <View style={styles.logoCircle}>
              <FontAwesome name="spotify" size={24} color="#121212" />
            </View>
            <Text style={styles.logoText}>Spotify</Text>
          </View>

          {items.map((it) => {
            const active = pathname?.startsWith(it.route.replace('/(tabs)', '')) || pathname === it.route;
            return (
              <Pressable
                key={it.route}
                onPress={() => { close(); router.push(it.route as any); }}
                style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && { backgroundColor: '#232323' }]}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: !!active }}
              >
                <FontAwesome name={it.icon} size={18} color={active ? SPOTIFY_GREEN : WHITE} />
                <Text style={[styles.rowText, active && { color: SPOTIFY_GREEN }]}>{it.label}</Text>
              </Pressable>
            );
          })}

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={close}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </MenuContext.Provider>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: CARD,
    paddingHorizontal: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#2a2a2a',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: SPOTIFY_GREEN, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: WHITE, fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, marginBottom: 6 },
  rowActive: { backgroundColor: '#1b1b1b' },
  rowText: { color: WHITE, fontSize: 16, fontWeight: '600' },
  closeBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 999, backgroundColor: SPOTIFY_GREEN, marginBottom: 24 },
  closeText: { color: BG, fontWeight: '800' },
});
