import React from "react";
import { Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { User, Settings, LogOut, Users, Bell, HelpCircle } from "lucide-react-native";
import { router } from "expo-router";
import { useClubs } from "@/providers/ClubProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useVideos } from "@/providers/VideoProvider";
import { Platform } from "react-native";

export default function MeerScreen() {
  const { clearAllCache } = useClubs();
  const { logout } = useAuth();
  const { clearCache: clearVideoCache } = useVideos();

  const handleLogout = async () => {
    try {
      console.log('😪 Meer tab: Logout button pressed');
      console.log('🔄 Starting complete logout process...');
      
      // Step 1: Clear authentication data
      await logout();
      console.log('✅ Authentication cleared');
      
      // Step 2: Clear all club data and cache
      await clearAllCache();
      console.log('✅ Club data and cache cleared');
      
      // Step 3: Clear video cache
      await clearVideoCache();
      console.log('✅ Video cache cleared');
      
      // Step 4: Navigate to login immediately
      console.log('🚀 Navigating to login screen...');
      router.replace('/login');
      
      // Step 5: Force reload for web to ensure clean state
      if (Platform.OS === 'web') {
        console.log('🔄 Forcing page reload for clean state...');
        setTimeout(() => {
          window.location.href = window.location.origin + '/login';
        }, 50);
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      router.replace('/login');
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.href = window.location.origin + '/login';
        }, 50);
      }
    }
  };

  const menuItems = [
    {
      icon: User,
      title: "Profiel",
      onPress: () => router.push("/profile"),
    },
    {
      icon: Users,
      title: "Clubs beheren",
      onPress: () => router.push("/clubs-manage"),
    },
    {
      icon: Bell,
      title: "Notificaties",
      onPress: () => router.push("/notifications"),
    },
    {
      icon: Settings,
      title: "Instellingen",
      onPress: () => router.push("/settings"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      onPress: () => router.push("/help-support"),
    },
    {
      icon: LogOut,
      title: "Uitloggen",
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.onPress}>
            <item.icon color="#FFF" size={24} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },

  content: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  menuText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 15,
  },
});