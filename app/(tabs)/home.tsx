import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { Play } from "lucide-react-native";
import { router } from "expo-router";
import { useVideos } from "@/providers/VideoProvider";
import { useClubs } from "@/providers/ClubProvider";
import { useAuth } from "@/providers/AuthProvider";
import { RefreshControl, ActivityIndicator } from "react-native";
import { AccessControlService } from "@/services/accessControlService";
import { VideoAccessOverlay } from "@/components/VideoAccessOverlay";
import { VideoCard } from "@/components/VideoCard";

export default function HomeTab() {
  const { width } = useWindowDimensions();
  const { videos, shorts, liveEvents, isLoading, error, refreshContent } = useVideos();
  const { selectedClubs, clubs } = useClubs();
  const { isAuthenticated, user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Log component mount
  React.useEffect(() => {
    console.log('🏠 HomeScreen mounted');
    console.log('📍 Current route:', router);
    console.log('📺 Videos loaded:', videos.length);
    console.log('🎬 Shorts loaded:', shorts.length);
    console.log('📡 Live events:', liveEvents.length);
    console.log('🏟️ Selected clubs:', selectedClubs.length);
    
    // Debug shorts content
    console.log('🎬 Shorts in home page:');
    shorts.forEach((short, index) => {
      console.log(`  ${index + 1}. ${short.title} (tags: ${short.tags?.join(', ') || 'none'})`);
    });
    
    return () => {
      console.log('🏠 HomeScreen unmounted');
    };
  }, [videos.length, shorts.length, liveEvents.length, selectedClubs.length]);
  
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshContent();
    } catch (error) {
      console.error('Error refreshing content:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshContent]);

  const renderShort = ({ item }: any) => {
    const handleShortPress = () => {
      console.log('\n========== SHORT CLICK DEBUG ==========');
      console.log('🎬 SHORT CLICKED!');
      console.log('📱 Short ID:', item.id);
      console.log('📝 Short Title:', item.title);
      console.log('🔗 Target URL:', `/shorts-player?shortId=${item.id}`);
      console.log('🚀 Attempting navigation...');
      
      try {
        router.push(`/shorts-player?shortId=${item.id}` as any);
        console.log('✅ Navigation command executed');
      } catch (error) {
        console.error('❌ Navigation error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
      
      console.log('========== END SHORT CLICK ==========\n');
    };

    return (
      <TouchableOpacity 
        style={[styles.shortCard, { width: width * 0.35 }]}
        onPress={handleShortPress}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.shortThumbnail} />
        <View style={styles.shortOverlay}>
          <Play color="#FFF" size={30} fill="#FFF" />
        </View>
        <View style={styles.shortInfo}>
          <Text style={styles.shortTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.shortDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVideo = ({ item }: any) => {
    return (
      <VideoCard
        item={item}
        type="video"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHORTS</Text>
        </View>
        {shorts.length > 0 ? (
          <FlatList
            horizontal
            data={shorts}
            renderItem={renderShort}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortsContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading shorts...' : 'No shorts available'}
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>VIDEO&apos;S</Text>
        </View>
        {videos.length > 0 ? (
          <FlatList
            data={videos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.videosContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#C4FF00" />
            ) : (
              <Text style={styles.emptyText}>
                {selectedClubs.length === 0 
                  ? 'Select clubs to see videos' 
                  : error 
                    ? `Error: ${error}` 
                    : 'No videos available'
                }
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },


  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFF",
  },
  shortsContainer: {
    paddingHorizontal: 20,
  },
  shortCard: {
    marginRight: 15,
  },
  shortThumbnail: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  shortOverlay: {
    position: "absolute",
    top: 90,
    left: "50%",
    marginLeft: -15,
  },
  shortInfo: {
    marginTop: 8,
  },
  shortTitle: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600" as const,
  },
  shortDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  videosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  videoCard: {
    marginBottom: 20,
  },
  videoThumbnail: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  videoOverlay: {
    position: "absolute",
    top: 80,
    left: "50%",
    marginLeft: -20,
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#C4FF00",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold" as const,
    color: "#000",
  },
  videoInfo: {
    marginTop: 10,
  },
  clubBadge: {
    position: "absolute",
    top: -30,
    left: 10,
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  videoDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: 60,
  },
  videoTitle: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600" as const,
    marginTop: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
  accessStatus: {
    color: "#FF6B6B",
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
});