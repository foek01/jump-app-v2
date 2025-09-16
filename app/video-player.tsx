import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Share as RNShare,
  Platform,
} from 'react-native';
import { ArrowLeft, Play, Heart, Share, Eye } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { mockVideos, mockLiveEvents } from '@/mocks/videos';
import { useFavorites } from '@/providers/FavoritesProvider';
import { useVideos } from '@/providers/VideoProvider';
import { JumpVideoPlayer } from '@/components/JumpVideoPlayer';
import { OptimizedVideoPlayer } from '@/components/OptimizedVideoPlayer';

interface Video {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  category?: string;
  clubLogo: string;
}

export default function VideoPlayer() {
  const { videoId, isLive } = useLocalSearchParams<{ videoId: string; isLive?: string }>();
  const { isVideoLiked, toggleVideoLike } = useFavorites();
  const { videos, liveEvents } = useVideos();
  const navigation = useNavigation();
  
  // Search in both videos and live events
  const video = videos.find(v => v.id === videoId) || 
               liveEvents.find(v => v.id === videoId) ||
               mockVideos.find(v => v.id === videoId) ||
               mockLiveEvents.find(v => v.id === videoId);
               
  const isLiked = videoId ? isVideoLiked(videoId) : false;
  const isLiveEvent = isLive === 'true' || liveEvents.some(e => e.id === videoId);
  
  // Generate proper embed URL - try multiple approaches
  const getEmbedUrl = (video: any) => {
    if (!video) return '';
    
    let embedUrl = video.videoUrl || video.streamUrl;
    console.log('🔍 Original URL:', embedUrl);
    
    // Try direct embed URL first
    if (embedUrl && embedUrl.includes('/watch-embed/')) {
      console.log('✅ Using direct embed URL:', embedUrl);
      return embedUrl;
    }
    
    // If it's a watch URL, try different embed approaches
    if (embedUrl && embedUrl.includes('/watch/')) {
      // Method 1: Simple replacement with minimal parameters
      const simpleEmbed = embedUrl.replace('/watch/', '/watch-embed/') + '?autoplay=1&controls=1';
      console.log('🔄 Method 1 - Simple embed URL:', simpleEmbed);
      return simpleEmbed;
    }
    
    // Method 2: Fallback to a working test URL for debugging
    if (video.id === '21723') {
      const testUrl = 'https://vvterneuzen.bytomorrow.nl/watch-embed/test023~54be8cfaf2';
      console.log('🧪 Using test URL for debugging:', testUrl);
      return testUrl;
    }
    
    // Fallback to thumbnail
    console.log('⚠️ No valid video URL, using thumbnail');
    return video.thumbnail;
  };
  
  // Safe back navigation
  const handleBack = () => {
    console.log('🔙 Video Player: Back button pressed');
    if (navigation.canGoBack()) {
      console.log('✅ Can go back, using router.back()');
      router.back();
    } else {
      console.log('❌ Cannot go back, navigating to home');
      router.replace('/(tabs)/home');
    }
  };
  
  React.useEffect(() => {
    console.log('\n📹 === VIDEO PLAYER MOUNTED ===');
    console.log('🎥 Received videoId:', videoId);
    console.log('🔴 Is Live:', isLive);
    console.log('📊 Available videos:', videos.length);
    console.log('📡 Available live events:', liveEvents.length);
    console.log('📋 Mock videos:', mockVideos.length);
    console.log('📋 Mock live events:', mockLiveEvents.length);
    console.log('🔍 Searching for video with ID:', videoId);
    console.log('📍 Video found:', video ? 'Yes' : 'No');
    if (video) {
      console.log('📝 Video title:', video.title);
      console.log('🎬 Video URL:', video.videoUrl || video.streamUrl);
    } else {
      console.log('❌ Video not found in any source');
      console.log('🔍 Live events IDs:', liveEvents.map(e => e.id));
      console.log('🔍 Videos IDs:', videos.map(v => v.id));
      console.log('🔍 Mock live events IDs:', mockLiveEvents.map(e => e.id));
    }
    return () => {
      console.log('📹 === VIDEO PLAYER UNMOUNTED ===\n');
    };
  }, [video, videoId, isLive, videos, liveEvents]);
  
  const handleShare = async () => {
    if (!video) return;
    console.log('📤 Share pressed for video:', video.title);
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: video.title,
            text: `Check out this video: ${video.title}`,
            url: window.location.href,
          });
        } else {
          console.log('📤 Web share not supported');
        }
      } else {
        await RNShare.share({
          title: video.title,
          message: `Check out this video: ${video.title}`,
          url: video.thumbnail,
        });
      }
    } catch (error) {
      console.log('📤 Share cancelled or failed:', error);
    }
  };
  
  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Video niet gevonden</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isLiveEvent ? 'Live Event' : 'Video'}
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <OptimizedVideoPlayer
            videoUrl={video.videoUrl}
            streamUrl={video.streamUrl}
            style={{ width: '100%', height: '100%' }}
          />
          
          {video.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{video.category}</Text>
            </View>
          )}
          
          {isLiveEvent && video.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <View style={styles.clubInfo}>
            <Image source={{ uri: video.clubLogo }} style={styles.clubLogo} />
            <View style={styles.clubDetails}>
              <Text style={styles.clubName}>
                {isLiveEvent ? 'Live Event' : 'Video'}
              </Text>
              <Text style={styles.videoDate}>
                {isLiveEvent && video.startTime ? 
                  new Date(video.startTime).toLocaleDateString('nl-NL') : 
                  video.date
                }
              </Text>
            </View>
          </View>
          
          <Text style={styles.videoTitle}>{video.title}</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Eye color="#999" size={16} />
              <Text style={styles.statText}>12.3K weergaven</Text>
            </View>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>2 dagen geleden</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]}
            onPress={() => videoId && toggleVideoLike(videoId)}
          >
            <Heart 
              color={isLiked ? "#FF3040" : "#FFF"} 
              size={20} 
              fill={isLiked ? "#FF3040" : "transparent"}
            />
            <Text style={[styles.actionButtonText, isLiked && styles.likedText]}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare()}
          >
            <Share color="#FFF" size={20} />
            <Text style={styles.actionButtonText}>Delen</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Beschrijving</Text>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Text>
        </View>

        {/* Related Videos */}
        <View style={styles.relatedContainer}>
          <Text style={styles.relatedTitle}>Gerelateerde video&apos;s</Text>
          {mockVideos.filter(v => v.id !== videoId).slice(0, 3).map((relatedVideo) => (
            <TouchableOpacity 
              key={relatedVideo.id}
              style={styles.relatedVideo}
              onPress={() => router.push(`/video-player?videoId=${relatedVideo.id}` as any)}
            >
              <Image source={{ uri: relatedVideo.thumbnail }} style={styles.relatedThumbnail} />
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedVideoTitle} numberOfLines={2}>
                  {relatedVideo.title}
                </Text>
                <Text style={styles.relatedVideoDate}>{relatedVideo.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C4FF00',
  },
  spacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    padding: 15,
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#C4FF00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  liveBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  videoInfo: {
    padding: 20,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  clubLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  videoDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  statDivider: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 15,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: 'rgba(255, 48, 64, 0.1)',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  likedText: {
    color: '#FF3040',
  },
  descriptionContainer: {
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  relatedContainer: {
    padding: 20,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  relatedVideo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  relatedThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  relatedInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  relatedVideoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 5,
  },
  relatedVideoDate: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 50,
  },
});