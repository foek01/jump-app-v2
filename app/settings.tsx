import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Modal, Image, FlatList } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Moon, Sun, Newspaper, Globe, Smartphone, Check, Trash2, RefreshCw } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { useClubs } from "@/providers/ClubProvider";

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { t, language, changeLanguage } = useLanguage();
  const { selectedClubs, clubs, clearAllCache, refreshClubs } = useClubs();
  const [showStartscreenModal, setShowStartscreenModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSelectedClubsData = () => {
    return clubs.filter(club => selectedClubs.includes(club.id));
  };

  const getCurrentStartscreenClub = () => {
    if (settings.startscreenClubId) {
      return clubs.find(club => club.id === settings.startscreenClubId);
    }
    const selectedClubsData = getSelectedClubsData();
    return selectedClubsData.length > 0 ? selectedClubsData[0] : null;
  };

  const handleStartscreenClubSelect = (clubId: string | null) => {
    updateSetting('startscreenClubId', clubId);
    setShowStartscreenModal(false);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllCache();
      // Show success message
      console.log("✅ Cache cleared successfully! Please restart the app.");
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshClubs();
      console.log("✅ Data refreshed successfully!");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.display}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowStartscreenModal(true)}
            disabled={getSelectedClubsData().length === 0}
          >
            <View style={styles.settingLeft}>
              <Smartphone color="#999" size={20} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Startscherm</Text>
                <Text style={styles.settingDescription}>
                  {getCurrentStartscreenClub() 
                    ? `${getCurrentStartscreenClub()?.name} logo wordt getoond`
                    : "Kies welk club logo wordt getoond bij opstarten"
                  }
                </Text>
              </View>
            </View>
            {getCurrentStartscreenClub() && (
              <Image 
                source={{ uri: getCurrentStartscreenClub()?.logo }} 
                style={styles.clubPreviewLogo}
                resizeMode="contain"
              />
            )}
            <ChevronLeft 
              color="#666" 
              size={20} 
              style={styles.chevronRight}
            />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {isDark ? <Moon color="#999" size={20} /> : <Sun color="#999" size={20} />}
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.darkMode}</Text>
                <Text style={styles.settingDescription}>
                  {isDark ? t.darkModeEnabled : t.lightModeEnabled}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => changeLanguage(language === "nl" ? "en" : "nl")}
          >
            <View style={styles.settingLeft}>
              <Globe color="#999" size={20} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.language}</Text>
                <Text style={styles.settingDescription}>
                  {language === "nl" ? "Nederlands" : "English"}
                </Text>
              </View>
            </View>
            <View style={styles.languageToggle}>
              <Text style={[styles.languageOption, language === "nl" && styles.languageActive]}>NL</Text>
              <Text style={styles.languageDivider}>|</Text>
              <Text style={[styles.languageOption, language === "en" && styles.languageActive]}>EN</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Newspaper color="#999" size={20} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.showNews}</Text>
                <Text style={styles.settingDescription}>
                  {settings.showNews ? t.showNewsDescription : t.showNewsDescription.replace("zichtbaar", "verborgen").replace("visible", "hidden")}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showNews}
              onValueChange={(value) => updateSetting('showNews', value)}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
            />
          </View>


        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.pushNotifications}</Text>
                <Text style={styles.settingDescription}>{t.pushNotificationsDescription}</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.matchReminders}</Text>
                <Text style={styles.settingDescription}>{t.matchRemindersDescription}</Text>
              </View>
            </View>
            <Switch
              value={settings.matchReminders}
              onValueChange={(value) => updateSetting('matchReminders', value)}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
              disabled={!settings.pushNotifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.newsAlerts}</Text>
                <Text style={styles.settingDescription}>{t.newsAlertsDescription}</Text>
              </View>
            </View>
            <Switch
              value={settings.newsAlerts}
              onValueChange={(value) => updateSetting('newsAlerts', value)}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
              disabled={!settings.pushNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache & Data</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Cache Inschakelen</Text>
                <Text style={styles.settingDescription}>
                  Cache aan = sneller laden, cache uit = altijd verse data van API
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enableCache}
              onValueChange={(value) => updateSetting('enableCache', value)}
              trackColor={{ false: "#333", true: "#C4FF00" }}
              thumbColor="#FFF"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleRefreshData}
            disabled={isRefreshing}
          >
            <View style={styles.settingLeft}>
              <RefreshCw color={isRefreshing ? "#666" : "#999"} size={20} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Data Verversen</Text>
                <Text style={styles.settingDescription}>
                  {isRefreshing ? "Bezig met verversen..." : "Ververs clubs en andere data"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearCache}
            disabled={isClearing}
          >
            <View style={styles.settingLeft}>
              <Trash2 color={isClearing ? "#666" : "#ff4444"} size={20} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isClearing ? "#666" : "#ff4444" }]}>Cache Wissen</Text>
                <Text style={styles.settingDescription}>
                  {isClearing ? "Bezig met wissen..." : "Wis alle opgeslagen data en herstart de app"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.about}</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.appVersion}</Text>
              <Text style={styles.settingDescription}>1.0.0 (Test Build)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.termsOfService}</Text>
            </View>
            <ChevronLeft 
              color="#666" 
              size={20} 
              style={styles.chevronRight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.privacyPolicy}</Text>
            </View>
            <ChevronLeft 
              color="#666" 
              size={20} 
              style={styles.chevronRight}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showStartscreenModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStartscreenModal(false)}>
              <Text style={styles.modalCancel}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Startscherm Logo</Text>
            <View style={styles.placeholder} />
          </View>
          
          <FlatList
            data={[
              { id: null, name: "Standaard JUMP logo", logo: "https://jump.video/assets/uploads/ef8559e98866357502f16cab8430c63a3c4e9e755f39568a5a5e3074bc560428e99454c2e60a0825cdf029d1aa1da3aa0ea0e498d05e54752b67a20a439b8323.png" },
              ...getSelectedClubsData()
            ]}
            keyExtractor={(item) => item.id || "default"}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clubOption}
                onPress={() => handleStartscreenClubSelect(item.id)}
              >
                <Image 
                  source={{ uri: item.logo }} 
                  style={styles.clubOptionLogo}
                  resizeMode="contain"
                />
                <View style={styles.clubOptionInfo}>
                  <Text style={styles.clubOptionName}>{item.name}</Text>
                  {item.id === null && (
                    <Text style={styles.clubOptionDescription}>Standaard app logo</Text>
                  )}
                </View>
                {(settings.startscreenClubId === item.id || 
                  (!settings.startscreenClubId && item.id === null)) && (
                  <Check color="#C4FF00" size={24} />
                )}
              </TouchableOpacity>
            )}
            style={styles.clubList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#000",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C4FF00",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C4FF00",
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#222",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  chevronRight: {
    transform: [{ rotate: '180deg' }] as any,
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageOption: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 8,
  },
  languageActive: {
    color: "#C4FF00",
  },
  languageDivider: {
    color: "#555",
    fontSize: 14,
  },
  clubPreviewLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalCancel: {
    fontSize: 16,
    color: "#C4FF00",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  clubList: {
    flex: 1,
  },
  clubOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  clubOptionLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  clubOptionInfo: {
    flex: 1,
  },
  clubOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },
  clubOptionDescription: {
    fontSize: 13,
    color: "#666",
  },
});