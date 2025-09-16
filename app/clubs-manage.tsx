import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, Check, X, Trash2, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useClubs } from "@/providers/ClubProvider";

export default function ClubsManageScreen() {
  const { 
    selectedClubs, 
    currentClubId, 
    clubs,
    isLoading,
    error,
    setCurrentClubId, 
    toggleClubSelection, 
    clearSelectedClubs,
    refreshClubs 
  } = useClubs();

  const userClubs = clubs.filter((club) => selectedClubs.includes(club.id));
  const availableClubs = clubs.filter((club) => !selectedClubs.includes(club.id));

  useEffect(() => {
    console.log('ClubsManageScreen - Current state:', {
      selectedClubs,
      currentClubId,
      totalClubs: clubs.length,
      userClubs: userClubs.length,
      availableClubs: availableClubs.length
    });
  }, [selectedClubs, currentClubId, clubs]);

  const handleClearAll = () => {
    Alert.alert(
      "Alle clubs verwijderen",
      "Weet je zeker dat je alle geselecteerde clubs wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            await clearSelectedClubs();
            router.replace("/club-selection");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/home");
          }
        }}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clubs Beheren</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshClubs}
          disabled={isLoading}
        >
          <RefreshCw color={isLoading ? "#666" : "#FFF"} size={20} />
        </TouchableOpacity>
      </View>

      {isLoading && clubs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4FF00" />
          <Text style={styles.loadingText}>Clubs laden...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mijn Clubs</Text>
            {userClubs.length > 0 && (
              <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
                <Trash2 color="#FF4444" size={18} />
                <Text style={styles.clearAllText}>Alles wissen</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {userClubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Je hebt nog geen clubs geselecteerd</Text>
            </View>
          ) : (
            userClubs.map((club) => (
          <View key={club.id} style={styles.clubItem}>
            <TouchableOpacity
              style={styles.clubContent}
              onPress={() => setCurrentClubId(club.id)}
            >
              <Image source={{ uri: club.logo }} style={styles.clubLogo} />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubType}>{club.type}</Text>
              </View>
              {currentClubId === club.id && (
                <View style={styles.activeIndicator}>
                  <Check color="#4CAF50" size={20} />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => toggleClubSelection(club.id)}
            >
              <X color="#FF4444" size={18} />
            </TouchableOpacity>
          </View>
        ))
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Beschikbare Clubs</Text>
          </View>
          
          {availableClubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Alle clubs zijn al toegevoegd</Text>
            </View>
          ) : (
            availableClubs.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.availableClubItem}
            onPress={() => toggleClubSelection(club.id)}
          >
            <Image source={{ uri: club.logo }} style={styles.clubLogo} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.clubType}>{club.type}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => toggleClubSelection(club.id)}
            >
              <Text style={styles.addButtonText}>Toevoegen</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
          )}
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C4FF00",
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearAllText: {
    color: "#FF4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 10,
  },
  clubContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  clubLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  clubInfo: {
    flex: 1,
    marginLeft: 15,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  clubType: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  activeIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  addButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  spacer: {
    width: 28,
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "#999",
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "#FF444420",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FF444440",
  },
  errorText: {
    color: "#FF6666",
    fontSize: 12,
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#2a2a2a",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  availableClubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});