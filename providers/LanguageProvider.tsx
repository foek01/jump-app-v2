import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

export type Language = "nl" | "en";

interface Translations {
  // Common
  back: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  loading: string;
  error: string;
  success: string;
  addedToCalendar: string;
  calendarError: string;
  
  // Settings
  settings: string;
  display: string;
  darkMode: string;
  darkModeEnabled: string;
  lightModeEnabled: string;
  showNews: string;
  showNewsDescription: string;

  notifications: string;
  pushNotifications: string;
  pushNotificationsDescription: string;
  newsAlerts: string;
  newsAlertsDescription: string;
  language: string;
  languageDescription: string;
  about: string;
  appVersion: string;
  termsOfService: string;
  privacyPolicy: string;
  
  // Match
  match: string;
  matches: string;
  upcoming: string;
  live: string;
  addToCalendar: string;
  startsIn: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  nowLive: string;
  liveDescription: string;
  matchDetails: string;
  competition: string;
  status: string;
  date: string;
  time: string;
  matchNotFound: string;
  
  // Tabs
  home: string;
  fanzone: string;
  more: string;
  news: string;

}

const translations: Record<Language, Translations> = {
  nl: {
    // Common
    back: "Terug",
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    edit: "Bewerken",
    add: "Toevoegen",
    search: "Zoeken",
    loading: "Laden...",
    error: "Fout",
    success: "Succes",
    addedToCalendar: "Wedstrijd toegevoegd aan agenda",
    calendarError: "Kon wedstrijd niet toevoegen aan agenda. Probeer het opnieuw.",
    
    // Settings
    settings: "Instellingen",
    display: "Weergave",
    darkMode: "Dark Mode",
    darkModeEnabled: "Dark mode is ingeschakeld",
    lightModeEnabled: "Light mode is ingeschakeld",
    showNews: "Nieuws Weergeven",
    showNewsDescription: "Nieuws tab is zichtbaar",

    notifications: "Notificaties",
    pushNotifications: "Push Notificaties",
    pushNotificationsDescription: "Ontvang meldingen op je apparaat",
    newsAlerts: "Nieuws Alerts",
    newsAlertsDescription: "Bij belangrijk nieuws",
    language: "Taal",
    languageDescription: "Nederlands",
    about: "Over",
    appVersion: "App Versie",
    termsOfService: "Gebruiksvoorwaarden",
    privacyPolicy: "Privacybeleid",
    
    // Match
    match: "Wedstrijd",
    matches: "Wedstrijden",
    upcoming: "Binnenkort",
    live: "Live",
    addToCalendar: "Zet in agenda",
    startsIn: "Begint over:",
    days: "Dagen",
    hours: "Uren",
    minutes: "Min",
    seconds: "Sec",
    nowLive: "Nu Live!",
    liveDescription: "De wedstrijd is momenteel bezig. Klik op de play knop om de livestream te bekijken.",
    matchDetails: "Wedstrijd Details",
    competition: "Competitie",
    status: "Status",
    date: "Datum",
    time: "Tijd",
    matchNotFound: "Wedstrijd niet gevonden",
    
    // Tabs
    home: "Home",
    fanzone: "Fanzone",
    more: "Meer",
    news: "Nieuws",

  },
  en: {
    // Common
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    addedToCalendar: "Match added to calendar",
    calendarError: "Could not add match to calendar. Please try again.",
    
    // Settings
    settings: "Settings",
    display: "Display",
    darkMode: "Dark Mode",
    darkModeEnabled: "Dark mode is enabled",
    lightModeEnabled: "Light mode is enabled",
    showNews: "Show News",
    showNewsDescription: "News tab is visible",

    notifications: "Notifications",
    pushNotifications: "Push Notifications",
    pushNotificationsDescription: "Receive notifications on your device",
    newsAlerts: "News Alerts",
    newsAlertsDescription: "For important news",
    language: "Language",
    languageDescription: "English",
    about: "About",
    appVersion: "App Version",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    
    // Match
    match: "Match",
    matches: "Matches",
    upcoming: "Upcoming",
    live: "Live",
    addToCalendar: "Add to Calendar",
    startsIn: "Starts in:",
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
    nowLive: "Now Live!",
    liveDescription: "The match is currently in progress. Click the play button to watch the livestream.",
    matchDetails: "Match Details",
    competition: "Competition",
    status: "Status",
    date: "Date",
    time: "Time",
    matchNotFound: "Match not found",
    
    // Tabs
    home: "Home",
    fanzone: "Fanzone",
    more: "More",
    news: "News",

  },
};

const LANGUAGE_STORAGE_KEY = "@app_language";

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>("nl");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === "nl" || savedLanguage === "en")) {
        setLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      console.log(`✅ Language changed to: ${newLanguage}`);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  }, []);

  const t = useMemo(() => translations[language], [language]);

  return useMemo(() => ({
    language,
    changeLanguage,
    t,
    isLoading,
  }), [language, changeLanguage, t, isLoading]);
});