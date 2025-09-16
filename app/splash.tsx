import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Animated, Image, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useClubs } from "@/providers/ClubProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { useAuth } from "@/providers/AuthProvider";

export default function SplashScreen() {
  const { selectedClubs, clubs, getCurrentClub } = useClubs();
  const { settings } = useSettings();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const appLogoOpacityAnim = useRef(new Animated.Value(0)).current;

  const getDisplayLogo = () => {
    // If startscreen club is set in settings, use that
    if (settings.startscreenClubId) {
      const settingsClub = clubs.find(club => club.id === settings.startscreenClubId);
      if (settingsClub) {
        return settingsClub.logo;
      }
    }
    
    // Otherwise use current club or first selected club
    const currentClub = getCurrentClub();
    if (currentClub) {
      return currentClub.logo;
    }
    
    // If no clubs selected, use first selected club
    if (selectedClubs && selectedClubs.length > 0) {
      const firstSelectedClub = clubs.find(club => club.id === selectedClubs[0]);
      if (firstSelectedClub) {
        return firstSelectedClub.logo;
      }
    }
    
    // Fallback to default JUMP logo
    return "https://jump.video/assets/uploads/ef8559e98866357502f16cab8430c63a3c4e9e755f39568a5a5e3074bc560428e99454c2e60a0825cdf029d1aa1da3aa0ea0e498d05e54752b67a20a439b8323.png";
  };

  useEffect(() => {
    // Check if clubs are already loaded
    const checkClubsAndNavigate = async () => {
      // Give ClubProvider time to load from AsyncStorage
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };

    // Simplified animation - directly show club logo with JUMP logo at bottom
    Animated.parallel([
      // Fade in and scale up club logo
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Fade in app logo at bottom simultaneously
      Animated.timing(appLogoOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    checkClubsAndNavigate();
    
    return () => {
      // Cleanup any pending animations or timers if needed
    };
  }, [opacityAnim, scaleAnim, appLogoOpacityAnim]);

  useEffect(() => {
    // Navigate after loading is complete and animation has played
    if (!isLoading && !authLoading) {
      const timer = setTimeout(() => {
        console.log("Splash navigation check:", { 
          isAuthenticated, 
          selectedClubs: selectedClubs?.length || 0 
        });

        if (!isAuthenticated) {
          console.log("User not authenticated - navigating to login");
          router.replace("/login");
        } else if (selectedClubs && selectedClubs.length > 0) {
          console.log("User authenticated with clubs - navigating to home");
          router.replace("/(tabs)/home" as any);
        } else {
          console.log("User authenticated but no clubs - navigating to club selection");
          router.replace("/club-selection");
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, authLoading, isAuthenticated, selectedClubs]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Main club logo in center */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={{
            uri: getDisplayLogo()
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* Small JUMP app logo at bottom */}
      <Animated.View
        style={[
          styles.appLogoContainer,
          {
            opacity: appLogoOpacityAnim,
          },
        ]}
      >
        <Image
          source={{
            uri: "https://jump.video/assets/uploads/ef8559e98866357502f16cab8430c63a3c4e9e755f39568a5a5e3074bc560428e99454c2e60a0825cdf029d1aa1da3aa0ea0e498d05e54752b67a20a439b8323.png"
          }}
          style={styles.appLogo}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 300,
  },
  appLogoContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  appLogo: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
});