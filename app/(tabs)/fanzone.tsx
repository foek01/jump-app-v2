import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useVideos } from "@/providers/VideoProvider";
import { mockNews } from "@/mocks/news";
import { Play } from "lucide-react-native";

export default function FavoritesScreen() {
  const { likedVideos, likedShorts, likedNews } = useFavorites();
  const { videos, liveEvents, shorts } = useVideos();
  
  // Combine regular videos and live events for favorites (use current filtered data)
  const allVideos = [...videos, ...liveEvents];
  const favoriteVideos = allVideos.filter(video => likedVideos.has(video.id));
  const favoriteShorts = shorts.filter(short => likedShorts.has(short.id));
  const favoriteNews = mockNews.filter(article => likedNews.has(article.id));
  
  console.log('💜 Favorites Debug:', {
    likedVideoIds: Array.from(likedVideos),
    likedShortIds: Array.from(likedShorts),
    allVideosCount: allVideos.length,
    favoriteVideosCount: favoriteVideos.length,
    favoriteVideos: favoriteVideos.map(v => ({ id: v.id, title: v.title }))
  });
  
  const handleVideoPress = (videoId: string) => {
    console.log('🎥 Opening favorite video:', videoId);
    
    // Check if it's a live event (has streamUrl instead of videoUrl)
    const item = allVideos.find(v => v.id === videoId);
    const isLiveEvent = item && ('streamUrl' in item || 'startTime' in item);
    
    if (isLiveEvent) {
      console.log('🔴 Opening as live event');
      router.push(`/video-player?videoId=${videoId}&isLive=true` as any);
    } else {
      console.log('🎥 Opening as regular video');
      router.push(`/video-player?videoId=${videoId}` as any);
    }
  };
  
  const handleShortPress = (shortId: string) => {
    console.log('📱 Opening favorite short:', shortId);
    router.push(`/shorts-player?shortId=${shortId}` as any);
  };
  
  const handleNewsPress = (newsId: string) => {
    console.log('📰 Opening favorite news article:', newsId);
    router.push(`/news-article?id=${newsId}`);
  };
  
  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => handleVideoPress(item.id)}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
        <View style={styles.playOverlay}>
          <Play color="#FFF" size={20} fill="#FFF" />
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.videoDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderShortItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.shortItem}
      onPress={() => handleShortPress(item.id)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.shortThumbnail} />
      <View style={styles.shortOverlay}>
        <Play color="#FFF" size={16} fill="#FFF" />
      </View>
      <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
  
  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.newsItem}
      onPress={() => handleNewsPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.newsThumbnail} />
      <View style={styles.newsContent}>
        <Text style={styles.newsCategory}>{item.category}</Text>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Favorite Videos Section */}
        {favoriteVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favoriete Video&apos;s</Text>
            <FlatList
              data={favoriteVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {/* Favorite Shorts Section */}
        {favoriteShorts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favoriete Shorts</Text>
            <FlatList
              data={favoriteShorts}
              renderItem={renderShortItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.shortsRow}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {/* Favorite News Section */}
        {favoriteNews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favoriete Nieuws</Text>
            <FlatList
              data={favoriteNews}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {/* Empty State */}
        {favoriteVideos.length === 0 && favoriteShorts.length === 0 && favoriteNews.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nog geen favorieten</Text>
            <Text style={styles.emptySubtext}>
              Like video&apos;s, shorts en nieuws om ze hier te zien
            </Text>
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
    padding: 15,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  row: {
    justifyContent: "space-between",
  },
  shortsRow: {
    justifyContent: "space-between",
  },
  videoItem: {
    width: "48%",
    marginBottom: 15,
  },
  videoThumbnailContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -10,
    marginLeft: -10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#C4FF00",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  videoInfo: {
    marginTop: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  videoDate: {
    fontSize: 12,
    color: "#999",
  },
  shortItem: {
    width: "31%",
    marginBottom: 15,
  },
  shortThumbnail: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  shortOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -8,
    marginLeft: -8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    padding: 6,
  },
  shortTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  newsItem: {
    flexDirection: "row",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  newsThumbnail: {
    width: 100,
    height: 80,
    backgroundColor: "#333",
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  newsCategory: {
    fontSize: 10,
    color: "#C4FF00",
    fontWeight: "bold",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: "#999",
  },
});