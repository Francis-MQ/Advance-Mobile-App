// app/(tabs)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: { display: 'none' }, // hide bottom tab bar
        headerShown: false,               // root header handles the title + hamburger
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Home',      tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} /> }} />
      <Tabs.Screen name="two"       options={{ title: 'Explore',    tabBarIcon: ({ color }) => <TabBarIcon name="paper-plane" color={color} /> }} />
      <Tabs.Screen name="showcase"  options={{ title: 'Showcase',   tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} /> }} />
      <Tabs.Screen name="login"     options={{ title: 'Login',      tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" color={color} /> }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile',    tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }} />
      <Tabs.Screen name="settings"  options={{ title: 'Settings',   tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} /> }} />
      <Tabs.Screen name="playlists" options={{ title: 'Playlists',  tabBarIcon: ({ color }) => <FontAwesome name="music" size={28} color={color} /> }} />
    </Tabs>
  );
}
