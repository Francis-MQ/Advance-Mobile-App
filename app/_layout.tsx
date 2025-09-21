import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/components/useColorScheme';
import { MenuProvider, useMenu } from '@/components/SidebarMenu';
import { useRouter } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };
SplashScreen.preventAutoHideAsync();

// Hamburger menu button
function HeaderMenuButton() {
  const { toggle } = useMenu();
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      style={{ paddingHorizontal: 14 }}
    >
      <FontAwesome name="bars" size={20} color="#fff" />
    </Pressable>
  );
}

// Map route names to friendly screen titles
function getScreenTitle(routeName: string) {
  switch (routeName) {
    case 'index': return 'Home';
    case 'profile': return 'Profile';
    case 'settings': return 'Settings';
    case 'login': return 'Login';
    case 'signup': return 'Sign Up';
    case 'playlists': return 'Playlists';
    case 'showcase': return 'Showcase';
    case 'playlist/[id]': return 'Playlist';
    default: return '';
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  // Restore last visited screen on app launch
  useEffect(() => {
    const restore = async () => {
      try {
        const json = await AsyncStorage.getItem('@nav_state');
        if (json) {
          const state = JSON.parse(json);
          if (state.screen) router.replace(state.screen);
        }
      } catch (err) {
        console.log('Error restoring navigation state:', err);
      }
    };
    restore();
  }, [router]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <MenuProvider>
          <Stack
            screenOptions={({ route }) => ({
              headerShown: true,
              headerStyle: { backgroundColor: '#121212' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '800' },
              headerLeft: () => <HeaderMenuButton />,
              headerTitle: getScreenTitle(route.name),
            })}
          >
            {/* Home */}
            <Stack.Screen name="index" />
            {/* Profile */}
            <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
            {/* Settings */}
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            {/* Login */}
            <Stack.Screen name="login" options={{ headerShown: false }} />
            {/* Signup */}
            <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
            {/* Playlists */}
            <Stack.Screen name="playlists" />
            {/* Showcase */}
            <Stack.Screen name="showcase" />
            {/* Playlist Detail */}
            <Stack.Screen name="playlist/[id]" />
          </Stack>
        </MenuProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
