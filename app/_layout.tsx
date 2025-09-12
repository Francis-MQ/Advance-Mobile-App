// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { MenuProvider, useMenu } from '@/components/SidebarMenu';

export const unstable_settings = {
  // IMPORTANT: land inside the tabs group
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function HeaderMenuButton() {
  const { toggle } = useMenu();
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      style={({ pressed }) => ({ paddingHorizontal: 14, opacity: pressed ? 0.6 : 1 })}
    >
      <FontAwesome name="bars" size={20} color="#fff" />
    </Pressable>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MenuProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
          }}
        >
          {/* 👇 Show a header for (tabs) but clear the title so "(tabs)" never appears */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              headerTitle: '',
              headerLeft: () => <HeaderMenuButton />,
            }}
          />

          {/* Other top-level screens (you can still navigate to them) */}
          <Stack.Screen name="login"  options={{ headerShown: false, title: 'Login' }} />
          <Stack.Screen name="signup" options={{ headerShown: false, title: 'Sign Up' }} />
          <Stack.Screen name="playlist/[id]" options={{ title: 'Playlist' }} />
        </Stack>
      </MenuProvider>
    </ThemeProvider>
  );
}
