import { Tabs } from "expo-router";
import { Home, Calendar, Newspaper, Heart, MoreHorizontal } from "lucide-react-native";
import React, { useEffect } from "react";
import { useSettings } from "@/providers/SettingsProvider";

export default function TabLayout() {
  const { settings, isLoading } = useSettings();
  
  useEffect(() => {
    console.log("📱 TabLayout: Settings updated:", { 
      showNews: settings.showNews, 
      isLoading 
    });
  }, [settings.showNews, isLoading]);
  
  // Don't render tabs until settings are loaded
  if (isLoading) {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#1a1a1a",
          borderTopColor: "#333",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="nieuws"
        options={{
          title: "Nieuws",
          tabBarIcon: ({ color }) => <Newspaper color={color} size={24} />,
          href: settings.showNews ? "/nieuws" : null,
        }}
      />

      <Tabs.Screen
        name="fanzone"
        options={{
          title: "Favorieten",
          tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="meer"
        options={{
          title: "Meer",
          tabBarIcon: ({ color }) => <MoreHorizontal color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}