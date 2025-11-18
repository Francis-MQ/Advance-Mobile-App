// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "@/components/useColorScheme";

// 👉 Drawer + Tabs (main app)
import SidebarMenu from "@/components/SidebarMenu";

// 👉 Auth screens
import LoginScreen from "./(tabs)/login";
import SignUpScreen from "./signup";

// 👉 Playlist context provider (NEW)
import { PlaylistProvider } from "@/context/PlaylistContext";

const PERSISTENCE_KEY = "NAVIGATION_STATE_V1";
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [isReady, setIsReady] = useState(false);
  const [isSignedIn] = useState(false); // 👈 demo flag for auth flow; wire real auth later
  const colorScheme = useColorScheme();

  // (Optional) keep your existing restore just to mirror previous behavior
  useEffect(() => {
    const restoreState = async () => {
      try {
        await AsyncStorage.getItem(PERSISTENCE_KEY);
        // We aren't using the value directly since there's no NavigationContainer here.
      } catch (e) {
        console.log("Failed to load nav state", e);
      } finally {
        setIsReady(true);
      }
    };
    restoreState();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded || !isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* 🔻 Provide shared playlist state to the entire app */}
        <PlaylistProvider>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={isSignedIn ? "App" : "Login"}
          >
            {/* 🔐 Auth Flow */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignUpScreen} />

            {/* 🌍 Main App (drawer + tabs) */}
            <Stack.Screen name="App" component={SidebarMenu} />
          </Stack.Navigator>
        </PlaylistProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
