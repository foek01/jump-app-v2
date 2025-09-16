import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

export type ThemeMode = "light" | "dark";

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

export const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  primary: "#C4FF00",
  text: "#000000",
  textSecondary: "#666666",
  border: "#E0E0E0",
  error: "#FF3B30",
  success: "#4CAF50",
};

export const darkTheme: ThemeColors = {
  background: "#1a1a1a",
  surface: "#2a2a2a",
  primary: "#C4FF00",
  text: "#FFFFFF",
  textSecondary: "#999999",
  border: "#333333",
  error: "#FF6B6B",
  success: "#4CAF50",
};

const THEME_STORAGE_KEY = "@app_theme";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = themeMode === "dark" ? darkTheme : lightTheme;
  const isDark = themeMode === "dark";

  return {
    themeMode,
    colors,
    isDark,
    toggleTheme,
    setTheme,
    isLoading,
  };
});