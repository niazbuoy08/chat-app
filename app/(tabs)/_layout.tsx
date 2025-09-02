import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Simple icon component for tabBarIcon
function TabIcon({ name, color }: { name: string; color: string }) {
  return <IconSymbol size={28} name={name} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' }, // transparent background for blur
          default: {},
        }),
      }}
    >
      {/* Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <TabIcon name="message" color={color} />
          ),
        }}
      />
      
      {/* Login Tab */}
      <Tabs.Screen
        name="Login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => (
            <TabIcon name="person" color={color} />
          ),
        }}
      />
      
      {/* Register Tab */}
      <Tabs.Screen
        name="Register"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => (
            <TabIcon name="person.badge.plus" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}