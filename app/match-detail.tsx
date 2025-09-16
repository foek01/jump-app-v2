import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Play, Calendar } from "lucide-react-native";
import { mockMatches } from "@/mocks/matches";
import { useLanguage } from "@/providers/LanguageProvider";

function CountdownTimer({ targetDate, isVisible }: { targetDate: Date; isVisible: boolean }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!isVisible) return;
    
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownTitle}>{t.startsIn}</Text>
      <View style={styles.countdownBoxes}>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t.days}</Text>
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t.hours}</Text>
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t.minutes}</Text>
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t.seconds}</Text>
        </View>
      </View>
    </View>
  );
}

function LiveIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.liveContainer}>
      <Animated.View
        style={[
          styles.liveDot,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const match = mockMatches.find((m) => m.id === id);

  // Parse the date and time for countdown
  const matchDateTime = new Date();
  if (match && match.status === "upcoming") {
    // Parse date (e.g., "16 Dec") and time (e.g., "14:30")
    const currentYear = new Date().getFullYear();
    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    
    const [day, monthStr] = match.date.split(' ');
    const [hours, minutes] = match.time.split(':');
    
    matchDateTime.setFullYear(currentYear);
    matchDateTime.setMonth(monthMap[monthStr] || 0);
    matchDateTime.setDate(parseInt(day));
    matchDateTime.setHours(parseInt(hours));
    matchDateTime.setMinutes(parseInt(minutes));
    matchDateTime.setSeconds(0);
  }

  const handleAddToCalendar = async () => {
    if (!match) return;
    
    try {
      const eventTitle = encodeURIComponent(match.title);
      const eventDetails = encodeURIComponent(`${match.competition} - ${match.title}`);
      
      // Format date for calendar (YYYYMMDDTHHmmss)
      const startDate = matchDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const endDate = new Date(matchDateTime.getTime() + 2 * 60 * 60 * 1000) // Add 2 hours
        .toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      
      // Google Calendar URL (works on all platforms)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${startDate}/${endDate}`;
      
      if (Platform.OS === 'ios') {
        // Try iOS native calendar first
        const iosCalendarUrl = `calshow:${Math.floor(matchDateTime.getTime() / 1000)}`;
        const canOpenNative = await Linking.canOpenURL(iosCalendarUrl);
        
        if (canOpenNative) {
          await Linking.openURL(iosCalendarUrl);
        } else {
          // Fallback to Google Calendar
          await Linking.openURL(googleCalendarUrl);
        }
      } else if (Platform.OS === 'android') {
        // Try Android calendar intent first
        const androidCalendarUrl = `content://com.android.calendar/time/${matchDateTime.getTime()}`;
        const canOpenNative = await Linking.canOpenURL(androidCalendarUrl);
        
        if (canOpenNative) {
          await Linking.openURL(androidCalendarUrl);
        } else {
          // Fallback to Google Calendar
          await Linking.openURL(googleCalendarUrl);
        }
      } else {
        // Web - always use Google Calendar
        await Linking.openURL(googleCalendarUrl);
      }
      
      // Show success message
      console.log('✅ Calendar event created successfully');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      console.error('❌ Failed to create calendar event');
    }
  };

  if (!match) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.match}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t.matchNotFound}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{match.competition}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: match.image }} style={styles.matchImage} />
          {match.status === "live" && (
            <View style={styles.liveOverlay}>
              <LiveIndicator />
            </View>
          )}
          {match.status === "live" && (
            <TouchableOpacity style={styles.playButton}>
              <Play size={40} color="#fff" fill="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.matchTitle}>{match.title}</Text>
          
          <View style={styles.matchMeta}>
            <Text style={styles.metaText}>{match.date}</Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>{match.time}</Text>
          </View>

          <CountdownTimer targetDate={matchDateTime} isVisible={match.status === "upcoming"} />
          {match.status === "upcoming" && (
            <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
              <Calendar size={20} color="#000" />
              <Text style={styles.calendarButtonText}>{t.addToCalendar}</Text>
            </TouchableOpacity>
          )}

          {match.status === "live" && (
            <View style={styles.liveInfoContainer}>
              <Text style={styles.liveInfoTitle}>{t.nowLive}</Text>
              <Text style={styles.liveInfoText}>{t.liveDescription}</Text>
            </View>
          )}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>{t.matchDetails}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.competition}:</Text>
              <Text style={styles.detailValue}>{match.competition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.status}:</Text>
              <Text style={styles.detailValue}>
                {match.status === "live" ? t.live : t.upcoming}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.date}:</Text>
              <Text style={styles.detailValue}>{match.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.time}:</Text>
              <Text style={styles.detailValue}>{match.time}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C4FF00",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  matchImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  liveOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  liveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  matchMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#999",
  },
  metaDivider: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 10,
  },
  countdownContainer: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  countdownTitle: {
    fontSize: 16,
    color: "#C4FF00",
    marginBottom: 15,
    textAlign: "center",
  },
  countdownBoxes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  countdownBox: {
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  countdownLabel: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
  },
  liveInfoContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff0000",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  liveInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff0000",
    marginBottom: 5,
  },
  liveInfoText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  detailsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C4FF00",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  detailLabel: {
    fontSize: 14,
    color: "#999",
  },
  detailValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4FF00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});