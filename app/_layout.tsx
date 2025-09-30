// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  NavigationState,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "@/components/useColorScheme";

// 👉 Import the Drawer + Tabs setup
import SidebarMenu from "@/components/SidebarMenu";

// 👉 Import Auth screens
import LoginScreen from "./(tabs)/login";
import SignUpScreen from "./signup";

const PERSISTENCE_KEY = "NAVIGATION_STATE_V1";
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<NavigationState | undefined>();
  const [isSignedIn, setIsSignedIn] = useState(false); // 👈 track auth state
  const colorScheme = useColorScheme();

  // Load persisted state
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (savedStateString) {
          setInitialState(JSON.parse(savedStateString));
        }
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
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
