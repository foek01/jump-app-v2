import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Calendar, Clock, Play, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useVideos } from "@/providers/VideoProvider";
import { useAuth } from "@/providers/AuthProvider";
import { LiveEvent } from "@/types/club";
import { AccessControlService } from "@/services/accessControlService";
import { VideoAccessOverlay } from "@/components/VideoAccessOverlay";
import { useFavorites } from "@/providers/FavoritesProvider";

const CARD_MARGIN = 10;

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

function LiveEventCard({ liveEvent, cardWidth, userInfo }: { liveEvent: LiveEvent; cardWidth: number; userInfo: any }) {
  const router = useRouter();
  const { isVideoLiked, toggleVideoLike } = useFavorites();
  
  // Check if live event is liked (treat as video)
  const isLiked = isVideoLiked(liveEvent.id);
  
  const handleLike = () => {
    toggleVideoLike(liveEvent.id);
  };
  
  // Check access control
  const videoInfo = {
    id: liveEvent.id,
    privacy: (liveEvent as any).privacy,
    is_free: (liveEvent as any).is_free,
    login_required: (liveEvent as any).login_required,
    clubId: (liveEvent as any).clubId,
    tags: liveEvent.tags,
  };
  
  const accessInfo = AccessControlService.checkVideoAccess(videoInfo, userInfo);
  const showLock = AccessControlService.shouldShowLock(videoInfo, userInfo);
  const lockType = AccessControlService.getLockType(videoInfo, userInfo);
  
  const handlePress = () => {
    console.log(`Opening live event: ${liveEvent.title} (${liveEvent.id})`);
    console.log('🔐 Access Info:', accessInfo);
    console.log('🔒 Show Lock:', showLock);
    
    // If no access, redirect to login
    if (!accessInfo.canAccess) {
      console.log('❌ Access denied, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Navigate to video player with the live event
    router.push(`/video-player?videoId=${liveEvent.id}&isLive=true`);
  };
  
  const handleLockPress = () => {
    console.log('🔒 Lock overlay pressed for:', liveEvent.title);
    router.push('/login');
  };
  
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      const dateStr = date.toLocaleDateString('nl-NL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return { date: dateStr, time: timeStr };
    } catch (error) {
      return { date: 'Datum onbekend', time: 'Tijd onbekend' };
    }
  };

  const { date, time } = formatDateTime(liveEvent.startTime);
  
  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]} 
      activeOpacity={0.9}
      onPress={handlePress}>
      <Image source={{ uri: liveEvent.thumbnail }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <View style={styles.playButton}>
          <Play color="#FFF" size={24} fill="#FFF" />
        </View>
        {liveEvent.isLive && (
          <View style={styles.liveIndicatorContainer}>
            <LiveIndicator />
          </View>
        )}
        {!liveEvent.isLive && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>BINNENKORT LIVE</Text>
          </View>
        )}
      </View>
      
      {/* Access Control Overlay */}
      <VideoAccessOverlay
        isVisible={showLock}
        accessType={lockType}
        onPress={handleLockPress}
      />
      
      {/* Like Button */}
      <TouchableOpacity
        style={styles.likeButton}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <Heart
          color={isLiked ? "#FF6B6B" : "#FFF"}
          size={20}
          fill={isLiked ? "#FF6B6B" : "transparent"}
        />
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <Text style={styles.competition}>{liveEvent.category}</Text>
        <Text style={styles.matchTitle}>{liveEvent.title}</Text>
        {liveEvent.description && (
          <Text style={styles.description} numberOfLines={2}>
            {liveEvent.description}
          </Text>
        )}
        <View style={styles.matchInfo}>
          <View style={styles.infoItem}>
            <Calendar size={14} color="#999" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color="#999" />
            <Text style={styles.infoText}>{time}</Text>
          </View>
        </View>
        {!accessInfo.canAccess && __DEV__ && (
          <Text style={styles.accessStatus}>🔒 {accessInfo.reason}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.85;
  
  const { liveEvents, isLoading, error, refreshContent } = useVideos();
  const { isAuthenticated, user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // User info for access control
  const userInfo = {
    isAuthenticated,
    email: user?.email,
    clubPermissions: user?.clubPermissions || [],
    pricePlans: [], // TODO: Add price plans from user
  };

  // Show ALL live events from /v1/live-events endpoint
  // Real API data often has no tags, so we show all live events
  const liveEventsWithLiveTag = liveEvents.filter(event => {
    // Accept all live events, but prioritize those with live indicators
    const hasLiveTag = event.tags?.some(tag => 
      tag.toLowerCase().includes('live')
    );
    const hasLiveCategory = event.category?.toLowerCase().includes('live');
    const hasLiveTitle = event.title?.toLowerCase().includes('live');
    const isFromLiveEndpoint = true; // All events from /v1/live-events are relevant
    
    // Show all events from live endpoint, but log which have live indicators
    if (hasLiveTag || hasLiveCategory || hasLiveTitle) {
      console.log(`🔴 Live indicator found for: ${event.title}`);
    }
    
    return isFromLiveEndpoint; // Show ALL live events
  });

  console.log('🔍 Live events filtering:', {
    totalLiveEvents: liveEvents.length,
    filteredWithLiveTag: liveEventsWithLiveTag.length,
    allEventTags: liveEvents.map(e => ({ id: e.id, tags: e.tags, category: e.category }))
  });

  const currentLiveEvents = liveEventsWithLiveTag.filter(event => event.isLive);
  const upcomingLiveEvents = liveEventsWithLiveTag.filter(event => !event.isLive);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshContent();
    } catch (error) {
      console.error('Error refreshing live events:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshContent]);

  if (isLoading && liveEvents.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C4FF00" />
        <Text style={styles.loadingText}>Live events laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C4FF00"
            colors={['#C4FF00']}
          />
        }
      >
        {currentLiveEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nu Live</Text>
            <View style={styles.verticalList}>
              {currentLiveEvents.map((liveEvent) => (
                <LiveEventCard key={liveEvent.id} liveEvent={liveEvent} cardWidth={screenWidth - 40} userInfo={userInfo} />
              ))}
            </View>
          </View>
        )}

        {upcomingLiveEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Binnenkort</Text>
            <View style={styles.verticalList}>
              {upcomingLiveEvents.map((liveEvent) => (
                <LiveEventCard key={liveEvent.id} liveEvent={liveEvent} cardWidth={screenWidth - 40} userInfo={userInfo} />
              ))}
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Opnieuw proberen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Debug Info (Development only) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>🔍 Debug Info:</Text>
            <Text style={styles.debugText}>Total live events: {liveEvents.length}</Text>
            <Text style={styles.debugText}>With 'live' tag: {liveEventsWithLiveTag.length}</Text>
            <Text style={styles.debugText}>Currently live: {currentLiveEvents.length}</Text>
            <Text style={styles.debugText}>Upcoming: {upcomingLiveEvents.length}</Text>
            {liveEvents.map(event => (
              <Text key={event.id} style={styles.debugText}>
                • {event.id}: {event.title} (tags: {event.tags?.join(', ')})
              </Text>
            ))}
          </View>
        )}

        {liveEventsWithLiveTag.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Geen live events beschikbaar</Text>
            <Text style={styles.emptySubtext}>Trek naar beneden om te vernieuwen</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },

  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
  },
  verticalList: {
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  liveIndicatorContainer: {
    alignSelf: "flex-start",
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    fontSize: 12,
    fontWeight: "bold",
  },
  upcomingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(196, 255, 0, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  upcomingText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 15,
  },
  competition: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  matchInfo: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#999",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  description: {
    fontSize: 12,
    color: "#ccc",
    marginBottom: 8,
    lineHeight: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#999",
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "#FF6B6B",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#FFF",
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  debugContainer: {
    backgroundColor: "#333",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C4FF00",
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: "#CCC",
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  accessStatus: {
    color: "#FF6B6B",
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic",
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 5,
  },
});