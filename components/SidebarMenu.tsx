// components/SidebarMenu.tsx
import React, {
    createContext,
    useContext,
    useMemo,
    useRef,
    useState,
    useEffect,
    useCallback,
  } from 'react';
  import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    Platform,
    StatusBar,
    BackHandler,
  } from 'react-native';
  import { router, usePathname } from 'expo-router';
  import { FontAwesome } from '@expo/vector-icons';
  
  // --- Theme (match your app)
  const BG = '#121212';
  const CARD = '#181818';
  const WHITE = '#fff';
  const MUTED = '#b3b3b3';
  const SPOTIFY_GREEN = '#1DB954';
  
  // -------- Context
  type MenuCtx = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: boolean;
  };
  const MenuContext = createContext<MenuCtx | null>(null);
  
  export const useMenu = () => {
    const ctx = useContext(MenuContext);
    if (!ctx) throw new Error('useMenu must be used within <MenuProvider>');
    return ctx;
  };
  
  // -------- Provider + UI
  export const MenuProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { width: screenW } = useWindowDimensions();
    const drawerWidth = Math.min(320, Math.floor(screenW * 0.78));
    const pathname = usePathname();
  
    const [isOpen, setIsOpen] = useState(false);
    const slideX = useRef(new Animated.Value(-drawerWidth)).current;
    const fade = useRef(new Animated.Value(0)).current;
  
    // Animate when open state changes
    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: isOpen ? 0 : -drawerWidth,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: isOpen ? 1 : 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, [isOpen, slideX, fade, drawerWidth]);
  
    // Android back button should close the drawer if it's open
    useEffect(() => {
      if (!isOpen) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setIsOpen(false);
        return true; // handled
      });
      return () => sub.remove();
    }, [isOpen]);
  
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  
    const value = useMemo<MenuCtx>(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
  
    // Drawer items
    const items: Array<{
      label: string;
      route: string;
      icon: React.ComponentProps<typeof FontAwesome>['name'];
    }> = [
      { label: 'Home', route: '/(tabs)/index', icon: 'home' },
      { label: 'Explore', route: '/(tabs)/two', icon: 'paper-plane' },
      { label: 'Showcase', route: '/(tabs)/showcase', icon: 'th-large' },
      { label: 'Playlists', route: '/(tabs)/playlists', icon: 'music' },
      { label: 'Profile', route: '/(tabs)/profile', icon: 'user' },
      { label: 'Settings', route: '/(tabs)/settings', icon: 'cogs' },
      { label: 'Login', route: '/(tabs)/login', icon: 'sign-in' },
    ];
  
    const headerTopPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  
    return (
      <MenuContext.Provider value={value}>
        {/* Your app content */}
        {children}
  
        {/* Backdrop: only mounted when open to avoid intercepting touches */}
        {isOpen && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={close}
            style={StyleSheet.absoluteFill}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: '#000',
                  opacity: fade.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
                },
              ]}
            />
          </Pressable>
        )}
  
        {/* Drawer panel */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              transform: [{ translateX: slideX }],
              paddingTop: 48 + headerTopPad,
            },
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
          accessibilityRole="menu"
        >
          {/* Header — bigger Spotify logo + name */}
          <View style={styles.logoRow}>
            <FontAwesome name="spotify" size={36} color={SPOTIFY_GREEN} />
            <Text style={styles.logoText}>Spotify</Text>
          </View>
  
          {/* Items */}
          {items.map((it) => {
            const active =
              pathname?.startsWith(it.route.replace('/(tabs)', '')) || pathname === it.route;
            return (
              <Pressable
                key={it.route}
                onPress={() => {
                  close();
                  router.push(it.route as any);
                }}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.rowActive,
                  pressed && { backgroundColor: '#232323' },
                ]}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: !!active }}
              >
                <FontAwesome
                  name={it.icon}
                  size={18}
                  color={active ? SPOTIFY_GREEN : WHITE}
                />
                <Text style={[styles.rowText, active && { color: SPOTIFY_GREEN }]}>{it.label}</Text>
              </Pressable>
            );
          })}
  
          <View style={{ flex: 1 }} />
  
          {/* Close button */}
          <Pressable
            onPress={close}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Animated.View>
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
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },
    logoText: {
      color: WHITE,
      fontSize: 26,
      fontWeight: '900',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 10,
      marginBottom: 6,
    },
    rowActive: {
      backgroundColor: '#1b1b1b',
    },
    rowText: { color: WHITE, fontSize: 16, fontWeight: '600' },
    closeBtn: {
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 999,
      backgroundColor: SPOTIFY_GREEN,
      marginBottom: 24,
    },
    closeText: { color: BG, fontWeight: '800' },
  });
  