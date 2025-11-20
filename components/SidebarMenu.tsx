// components/SidebarMenu.tsx
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  createDrawerNavigator,
  useDrawerProgress,
  DrawerContentScrollView,
  DrawerItemList,
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
import CameraFiltersScreen from "../app/(tabs)/cameraFilters";

// Week 4 Activity 1
import PlaylistBuilderScreen from "../app/(tabs)/playlistBuilder";
// Week 5 Activity 1
import ThemeSettings from "@/app/(tabs)/themeSettings";


const BG = "#121212";
const CARD = "#181818";
const WHITE = "#fff";
const SPOTIFY_GREEN = "#1DB954";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Simple fake profile data for the drawer header
const USER_NAME = "Francis Austria";
const USER_TAG = "Premium listener";

// 👉 Wrapper for consistent background
function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: BG }}>{children}</View>;
}

// 👉 Bottom Tabs (polished)
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopColor: "#000",
          height: 60,
        },
        tabBarActiveTintColor: SPOTIFY_GREEN,
        tabBarInactiveTintColor: "#9b9b9b",
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="home" size={focused ? 22 : 18} color={color} />
          ),
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
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="th-large" size={focused ? 22 : 18} color={color} />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="music" size={focused ? 22 : 18} color={color} />
          ),
        }}
      >
        {() => (
          <ScreenWrapper>
            <PlaylistsScreen />
          </ScreenWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Camera"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="camera" size={18} color={color} />
          ),
        }}
      >
        {() => (
          <ScreenWrapper>
            <CameraFiltersScreen />
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
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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

// 👉 Custom drawer content with profile header
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0, backgroundColor: CARD }}
    >
      {/* Profile header */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>F</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.drawerName} numberOfLines={1}>
            {USER_NAME}
          </Text>
          <Text style={styles.drawerTag} numberOfLines={1}>
            {USER_TAG}
          </Text>
        </View>
      </View>

      <View style={styles.drawerDivider} />

      {/* Default list of drawer items */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

// 👉 Main Drawer
export default function SidebarMenu() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: CARD },
        drawerActiveTintColor: SPOTIFY_GREEN,
        drawerInactiveTintColor: WHITE,
        drawerActiveBackgroundColor: "#1f1f1f",
        drawerInactiveBackgroundColor: "transparent",
        drawerItemStyle: {
          borderRadius: 999,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        drawerLabelStyle: { fontWeight: "600", fontSize: 14 },
        swipeMinDistance: 20,
        drawerType: "slide",
        overlayColor: "transparent",
      }}
    >
      {/* Tabs inside animated wrapper */}
      <Drawer.Screen
        name="Main"
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="home" size={18} color={color} />,
          drawerLabel: "Main Tabs",
        }}
      >
        {() => (
          <AnimatedDrawerWrapper>
            <TabsNavigator />
          </AnimatedDrawerWrapper>
        )}
      </Drawer.Screen>

      {/* Week 4 playlist builder entry straight from drawer */}
      <Drawer.Screen
        name="PlaylistBuilder"
        options={{
          drawerIcon: ({ color }) => <FontAwesome name="list" size={18} color={color} />,
          drawerLabel: "Playlist Builder",
        }}
      >
        {() => (
          <AnimatedDrawerWrapper>
            <ScreenWrapper>
              <PlaylistBuilderScreen />
            </ScreenWrapper>
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
      <Drawer.Screen
        name="ThemeSettings"
        component={ThemeSettings}
        options={{
          drawerLabel: "Theme",
          drawerIcon: ({ color }) => (
            <FontAwesome name="sun-o" size={18} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2b2b2b",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: WHITE,
    fontWeight: "800",
    fontSize: 22,
  },
  drawerName: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
  },
  drawerTag: {
    color: "#8a8a8a",
    fontSize: 12,
    marginTop: 2,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#323232",
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
