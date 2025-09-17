import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

interface SettingsState {
  showNews: boolean;
  pushNotifications: boolean;
  matchReminders: boolean;
  newsAlerts: boolean;
  startscreenClubId: string | null;
  enableCache: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  showNews: true,
  pushNotifications: true,
  matchReminders: true,
  newsAlerts: false,
  startscreenClubId: null,
  enableCache: false, // Cache disabled by default for development
};

const SETTINGS_STORAGE_KEY = "@app_settings";

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = useCallback(async <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      console.log(`✅ Setting ${key} updated to:`, value);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettings(settings);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  }, []);

  return useMemo(() => ({
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  }), [settings, updateSetting, resetSettings, isLoading]);
});