import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Share as RNShare,
  Platform,
} from 'react-native';
import { ArrowLeft, Heart, Share } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mockShorts } from '@/mocks/videos';
import { useFavorites } from '@/providers/FavoritesProvider';
import { OptimizedVideoPlayer } from '@/components/OptimizedVideoPlayer';

const { width, height } = Dimensions.get('window');

interface Short {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  videoUrl?: string;
  media_id?: string;
}

export default function ShortsPlayer() {
  const { shortId } = useLocalSearchParams<{ shortId: string }>();
  const { isShortLiked, toggleShortLike } = useFavorites();
  const flatListRef = useRef<FlatList>(null);
  
  const initialIndex = mockShorts.findIndex(short => short.id === shortId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  React.useEffect(() => {
    console.log('\n🎬 === SHORTS PLAYER MOUNTED ===');
    console.log('📱 Received shortId:', shortId);
    console.log('📍 Initial index:', initialIndex);
    console.log('📋 Total shorts:', mockShorts.length);
    return () => {
      console.log('🎬 === SHORTS PLAYER UNMOUNTED ===\n');
    };
  }, []);

  const handleLike = (shortId: string) => {
    console.log('❤️ Like pressed for short:', shortId);
    toggleShortLike(shortId);
  };

  const handleShare = async (short: Short) => {
    console.log('📤 Share pressed for short:', short.title);
    
    // App download links
    const appStoreUrl = 'https://apps.apple.com/app/sport-club-video-platform'; // TODO: Add real App Store URL
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.sportclub.video'; // TODO: Add real Play Store URL
    const webAppUrl = 'https://sportclub.app'; // TODO: Add real web app URL
    
    const shareContent = {
      title: `🏆 Sport Club Video Platform`,
      message: `🎬 Bekijk "${short.title}" en meer content in onze app!\n\n📱 Download de app:\niOS: ${appStoreUrl}\nAndroid: ${playStoreUrl}\nWeb: ${webAppUrl}`,
    };
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: shareContent.title,
            text: shareContent.message,
            url: webAppUrl,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${shareContent.title}\n${shareContent.message}`);
          console.log('📋 App download info copied to clipboard');
        }
      } else {
        await RNShare.share({
          title: shareContent.title,
          message: shareContent.message,
          // Add app store URLs for mobile
          urls: Platform.OS === 'ios' ? [appStoreUrl] : [playStoreUrl],
        });
      }
    } catch (error) {
      console.log('📤 Share cancelled or failed:', error);
    }
  };

  const handleBackPress = () => {
    console.log('🔙 Back button pressed');
    router.back();
  };

  // Generate proper embed URL for shorts with authentication token
  const getShortEmbedUrl = (short: Short) => {
    if (!short) return '';
    
    let embedUrl = short.videoUrl;
    
    // If it's already an embed URL, ensure it has the et token
    if (embedUrl && embedUrl.includes('/watch-embed/')) {
      // Add et token if missing (required for authentication)
      if (!embedUrl.includes('et=')) {
        embedUrl += embedUrl.includes('?') ? '&' : '?';
        embedUrl += 'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D';
      }
      // Ensure shorts have autoplay, loop, and muted
      if (!embedUrl.includes('autoplay=')) {
        embedUrl += embedUrl.includes('?') ? '&' : '?';
        embedUrl += 'autoplay=1&loop=1&muted=1&controls=0';
      }
      console.log('✅ Shorts: Using embed URL with et token:', embedUrl);
      return embedUrl;
    }
    
    // If it's a watch URL, convert to embed with et token
    if (embedUrl && embedUrl.includes('/watch/')) {
      const convertedUrl = embedUrl.replace('/watch/', '/watch-embed/');
      const finalUrl = convertedUrl + 
        (convertedUrl.includes('?') ? '&' : '?') + 
        'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&loop=1&muted=1&controls=0';
      console.log('🔄 Shorts: Converted watch URL to embed with et token:', finalUrl);
      return finalUrl;
    }
    
    // Fallback to thumbnail
    console.log('⚠️ Shorts: No valid video URL, using thumbnail');
    return short.thumbnail;
  };

  const renderShort = ({ item, index }: { item: Short; index: number }) => (
    <View style={styles.shortContainer}>
      <OptimizedVideoPlayer
        videoUrl={item.videoUrl}
        media_id={item.media_id}
        autoplay={true}
        loop={true}
        muted={true}
        controls={false}
        isShort={true}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      
      {/* Video overlay gradient */}
      <View style={styles.overlay} />
      
      {/* Side actions */}
      <View style={styles.sideActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Heart 
            color={isShortLiked(item.id) ? "#FF3040" : "#FFF"} 
            fill={isShortLiked(item.id) ? "#FF3040" : "transparent"}
            size={28} 
          />
          <Text style={styles.actionText}>12.3K</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Share color="#FFF" size={28} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      const currentItem = viewableItems[0].item;
      setCurrentIndex(newIndex);
      
      // Auto-play when swiping to new video
      console.log('🎬 Swiped to short:', newIndex, currentItem?.title);
      
      // Pause all videos first, then play the current one
      setTimeout(() => {
        if (Platform.OS === 'web') {
          // Find all video elements in iframes and direct videos
          const videos = document.querySelectorAll('video');
          const iframes = document.querySelectorAll('iframe');
          
          console.log(`🎬 Found ${videos.length} videos and ${iframes.length} iframes`);
          
          // Handle direct video elements
          videos.forEach((video, index) => {
            if (index === newIndex) {
              video.currentTime = 0;
              video.muted = true;
              video.loop = true;
              video.play().catch(e => console.log('Autoplay prevented:', e));
              console.log('▶️ Playing direct video at index:', index);
            } else {
              video.pause();
              console.log('⏸️ Paused direct video at index:', index);
            }
          });
          
          // Handle iframe videos (JW Player)
          iframes.forEach((iframe, index) => {
            try {
              const iframeWindow = iframe.contentWindow;
              if (iframeWindow) {
                if (index === newIndex) {
                  // Send play command to iframe
                  iframeWindow.postMessage({action: 'play'}, '*');
                  console.log('▶️ Playing iframe video at index:', index);
                } else {
                  // Send pause command to iframe
                  iframeWindow.postMessage({action: 'pause'}, '*');
                  console.log('⏸️ Paused iframe video at index:', index);
                }
              }
            } catch (e) {
              console.log('Cannot control iframe video:', e);
            }
          });
        }
      }, 200);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shorts</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        ref={flatListRef}
        data={mockShorts}
        renderItem={renderShort}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    padding: 8,
    marginTop: Platform.OS === 'ios' ? 0 : 5,
    marginLeft: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  spacer: {
    width: 34,
  },
  shortContainer: {
    width,
    height: height,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sideActions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 25,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 80,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    color: '#CCC',
    fontSize: 14,
  },
});