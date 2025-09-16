import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Search, ChevronLeft, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useClubs } from "@/providers/ClubProvider";

export default function ClubSelectionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    selectedClubs, 
    toggleClubSelection, 
    clubs, 
    isLoading, 
    error, 
    refreshClubs,
    searchClubs 
  } = useClubs();
  const [refreshing, setRefreshing] = useState(false);

  const filteredClubs = searchClubs(searchQuery);

  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinue = async () => {
    if (selectedClubs.length === 0) {
      Alert.alert("Selecteer een club", "Kies minimaal één club om door te gaan");
      return;
    }
    
    setIsContinuing(true);
    console.log("Continuing with selected clubs:", selectedClubs);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshClubs();
    } catch (err) {
      console.error('Error refreshing clubs:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && clubs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Selecteer</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#35BC6F" />
          <Text style={styles.loadingText}>Clubs laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecteer</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw color="#999" size={20} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredClubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#35BC6F"
            colors={['#35BC6F']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Geen clubs gevonden' : 'Geen clubs beschikbaar'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedClubs.includes(item.id);
          return (
            <View style={styles.clubItem}>
              <Image source={{ uri: item.logo }} style={styles.clubLogo} />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{item.name}</Text>
                <Text style={styles.clubSubtitle}>{item.subtitle}</Text>
                <Text style={styles.clubType}>{item.type}</Text>
              </View>
              <TouchableOpacity
                style={[styles.button, isSelected && styles.buttonSelected]}
                onPress={() => toggleClubSelection(item.id)}
              >
                <Text style={styles.buttonText}>
                  {isSelected ? "Geselecteerd" : "Aanmelden"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {selectedClubs.length > 0 && (
        <TouchableOpacity 
          style={[styles.continueButton, isContinuing && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isContinuing}
        >
          {isContinuing ? (
            <View style={styles.continueButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.continueButtonSpinner} />
              <Text style={styles.continueButtonText}>Bezig...</Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>
              Doorgaan ({selectedClubs.length} geselecteerd)
            </Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  clubLogo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  clubInfo: {
    flex: 1,
    marginLeft: 15,
  },
  clubName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  clubSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  clubType: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
    fontStyle: "italic",
    marginTop: 2,
  },
  button: {
    backgroundColor: "#35BC6F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonSelected: {
    backgroundColor: "#35BC6F",
  },
  buttonText: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: 14,
  },
  continueButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#35BC6F",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonSpinner: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },
  refreshButton: {
    padding: 5,
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: "#FF6B6B",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.7,
  },
});