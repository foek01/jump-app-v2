import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockClubs } from "@/mocks/clubs";
import { ClubService } from "@/services/clubService";
import { Club } from "@/types/club";

interface ClubState {
  selectedClubs: string[];
  currentClubId: string | null;
  clubs: Club[];
  isLoading: boolean;
  error: string | null;
  toggleClubSelection: (clubId: string) => void;
  setCurrentClubId: (clubId: string) => void;
  clearSelectedClubs: () => void;
  getCurrentClub: () => Club | null;
  refreshClubs: () => Promise<void>;
  searchClubs: (searchTerm: string) => Club[];
  clearAllCache: () => Promise<void>;
}

export const [ClubProvider, useClubs] = createContextHook<ClubState>(() => {
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [currentClubId, setCurrentClubId] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      // Load from AsyncStorage first
      try {
        const storedClubs = await AsyncStorage.getItem("selectedClubs");
        const storedCurrentClub = await AsyncStorage.getItem("currentClubId");
        
        console.log("Loading clubs from storage:", { storedClubs, storedCurrentClub });
        
        if (storedClubs && storedClubs !== "undefined" && storedClubs !== "null" && storedClubs !== "[object Object]") {
          try {
            let clubs;
            if (storedClubs.startsWith("[") && storedClubs.endsWith("]")) {
              clubs = JSON.parse(storedClubs);
            } else {
              console.error("Invalid clubs format, clearing storage");
              await AsyncStorage.removeItem("selectedClubs");
              await AsyncStorage.removeItem("currentClubId");
              return;
            }
            
            if (Array.isArray(clubs)) {
              setSelectedClubs(clubs);
              
              if (storedCurrentClub && storedCurrentClub !== "undefined" && storedCurrentClub !== "null" && storedCurrentClub !== "[object Object]") {
                setCurrentClubId(storedCurrentClub);
              } else if (clubs.length > 0) {
                setCurrentClubId(clubs[0]);
                await AsyncStorage.setItem("currentClubId", clubs[0]);
              }
            }
          } catch (parseError) {
            console.error("Error parsing stored clubs:", parseError);
            await AsyncStorage.removeItem("selectedClubs");
            await AsyncStorage.removeItem("currentClubId");
          }
        }
      } catch (error) {
        console.error("Error loading clubs:", error);
      }

      // Fetch from Firebase with timeout
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 ClubProvider: Starting Firebase fetch...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase request timeout after 10 seconds')), 10000);
        });
        
        const firebaseClubs = await Promise.race([
          ClubService.getAllClubs(),
          timeoutPromise
        ]);
        
        console.log('🔄 ClubProvider: Firebase fetch completed:', {
          clubCount: firebaseClubs.length,
          clubs: firebaseClubs.map(c => ({ id: c.id, name: c.name }))
        });
        
        setClubs(firebaseClubs);
        
        if (firebaseClubs.length === 0) {
          console.log('⚠️ ClubProvider: No clubs found in Firebase, using mock data');
          setClubs(mockClubs);
          setError('No clubs found in Firebase. Using mock data.');
        } else {
          console.log(`✅ ClubProvider: Successfully loaded ${firebaseClubs.length} clubs from Firebase`);
        }
      } catch (err: any) {
        console.error('❌ ClubProvider: Error fetching clubs from Firebase:', err);
        const errorMessage = err?.message || 'Unknown error occurred';
        setError(`Firebase error: ${errorMessage}`);
        setClubs(mockClubs);
        console.log('🔄 ClubProvider: Using mock data as fallback due to error');
      } finally {
        setIsLoading(false);
        console.log('🏁 ClubProvider: Firebase fetch process completed');
      }
    };

    initializeData();
  }, []);

  const toggleClubSelection = useCallback(async (clubId: string) => {
    setSelectedClubs(prevClubs => {
      const newClubs = prevClubs.includes(clubId)
        ? prevClubs.filter((id) => id !== clubId)
        : [...prevClubs, clubId];
      
      // Update AsyncStorage
      AsyncStorage.setItem("selectedClubs", JSON.stringify(newClubs));
      
      // Update current club if needed
      if (prevClubs.includes(clubId) && currentClubId === clubId) {
        if (newClubs.length > 0) {
          setCurrentClubId(newClubs[0]);
          AsyncStorage.setItem("currentClubId", newClubs[0]);
        } else {
          setCurrentClubId(null);
          AsyncStorage.removeItem("currentClubId");
        }
      } else if (!prevClubs.includes(clubId) && !currentClubId) {
        setCurrentClubId(clubId);
        AsyncStorage.setItem("currentClubId", clubId);
      }
      
      console.log("Clubs updated:", newClubs);
      return newClubs;
    });
  }, [currentClubId]);

  const updateCurrentClubId = useCallback(async (clubId: string) => {
    setCurrentClubId(clubId);
    await AsyncStorage.setItem("currentClubId", clubId);
  }, []);

  const clearSelectedClubs = useCallback(async () => {
    try {
      setSelectedClubs([]);
      setCurrentClubId(null);
      await AsyncStorage.removeItem("selectedClubs");
      await AsyncStorage.removeItem("currentClubId");
      console.log("Clubs cleared successfully");
    } catch (error) {
      console.error("Error clearing clubs:", error);
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    try {
      console.log("🧹 Clearing all cache...");
      
      // Clear all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      
      // Reset all state
      setSelectedClubs([]);
      setCurrentClubId(null);
      setClubs([]);
      setIsLoading(false);
      setError(null);
      
      console.log("✅ All cache cleared successfully");
      console.log("🔄 Please restart the app to see changes");
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
    }
  }, []);

  const refreshClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Refreshing clubs from Firebase...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Firebase refresh timeout after 10 seconds')), 10000);
      });
      
      const firebaseClubs = await Promise.race([
        ClubService.getAllClubs(),
        timeoutPromise
      ]);
      
      setClubs(firebaseClubs);
      
      console.log(`Successfully refreshed ${firebaseClubs.length} clubs from Firebase`);
    } catch (err: any) {
      console.error('Error refreshing clubs from Firebase:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Refresh failed: ${errorMessage}`);
      // Don't replace clubs with mock data on refresh failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchClubs = useCallback((searchTerm: string): Club[] => {
    if (!searchTerm.trim()) return clubs;
    
    return clubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clubs]);

  const getCurrentClub = useCallback((): Club | null => {
    if (!currentClubId) return null;
    return clubs.find((club) => club.id === currentClubId) || null;
  }, [currentClubId, clubs]);

  return useMemo(() => ({
    selectedClubs,
    currentClubId,
    clubs,
    isLoading,
    error,
    toggleClubSelection,
    setCurrentClubId: updateCurrentClubId,
    clearSelectedClubs,
    getCurrentClub,
    refreshClubs,
    searchClubs,
    clearAllCache,
  }), [
    selectedClubs,
    currentClubId,
    clubs,
    isLoading,
    error,
    toggleClubSelection,
    updateCurrentClubId,
    clearSelectedClubs,
    getCurrentClub,
    refreshClubs,
    searchClubs,
    clearAllCache,
  ]);
});