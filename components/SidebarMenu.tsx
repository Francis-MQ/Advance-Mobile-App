// SidebarMenu.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  createDrawerNavigator,
  useDrawerProgress,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";

// Import screens
import HomeScreen from "../app/(tabs)/index";
import ShowcaseScreen from "../app/(tabs)/showcase";
import PlaylistsScreen from "../app/(tabs)/playlists";
import ProfileScreen from "../app/(tabs)/profile";
import SettingsScreen from "../app/(tabs)/settings";
import LoginScreen from "../app/(tabs)/login";
import SignUpScreen from "../app/signup";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#fff";
const SPOTIFY_GREEN = "#1DB954";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 👉 Wrapper for consistent background
function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: BG }}>{children}</View>;
}

// 👉 Bottom Tabs
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: CARD },
        tabBarActiveTintColor: SPOTIFY_GREEN,
        tabBarInactiveTintColor: WHITE,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={18} color={color} />,
        }}
      >
        {() => (
          <ScreenWrapper>
            <HomeScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Showcase"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="th-large" size={18} color={color} />,
        }}
      >
        {() => (
          <ScreenWrapper>
            <ShowcaseScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Playlists"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="music" size={18} color={color} />,
        }}
      >
        {() => (
          <ScreenWrapper>
            <PlaylistsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// 👉 Stack for Login ↔ Signup
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // smooth slide
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// 👉 Animated wrapper for drawer scaling
function AnimatedDrawerWrapper({ children }: { children: React.ReactNode }) {
  const progress = useDrawerProgress();
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.9]);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 20]);
    return { transform: [{ scale }], borderRadius, overflow: "hidden" };
  });
  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}

// 👉 Main Drawer
export default function SidebarMenu() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: CARD },
        drawerActiveTintColor: SPOTIFY_GREEN,
        drawerInactiveTintColor: WHITE,
        drawerLabelStyle: { fontWeight: "600" },
        swipeMinDistance: 20,
        drawerType: "slide",
        overlayColor: "transparent",
      }}
    >
      {/* Tabs inside animated wrapper */}
      <Drawer.Screen
        name="Main"
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="bars" size={18} color={color} />,
          drawerLabel: "Main Tabs",
        }}
      >
        {() => (
          <AnimatedDrawerWrapper>
            <TabsNavigator />
          </AnimatedDrawerWrapper>
        )}
      </Drawer.Screen>

      {/* Auth Stack: Login ↔ Signup */}
      <Drawer.Screen
        name="Auth"
        component={AuthStack}
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="sign-in" size={18} color={color} />,
          drawerLabel: "Login / Signup",
        }}
      />

      {/* Other routes */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="user" size={18} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="cogs" size={18} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({});
