import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { AccessControlService } from '@/services/accessControlService';
import { VideoAccessOverlay } from '@/components/VideoAccessOverlay';
import { useAuth } from '@/providers/AuthProvider';
import { useFavorites } from '@/providers/FavoritesProvider';

interface VideoCardProps {
  item: any;
  type: 'video' | 'short' | 'live';
  style?: any;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item, type, style }) => {
  const { isAuthenticated, user } = useAuth();
  const { isVideoLiked, toggleVideoLike, isShortLiked, toggleShortLike } = useFavorites();

  // Check access control
  const userInfo = {
    isAuthenticated,
    email: user?.email,
    clubPermissions: user?.clubPermissions || [],
    pricePlans: [], // TODO: Add price plans from user
  };
  
  const videoInfo = {
    id: item.id,
    privacy: item.privacy,
    is_free: item.is_free,
    login_required: item.login_required,
    clubId: item.clubId,
    tags: item.tags,
  };
  
  const accessInfo = AccessControlService.checkVideoAccess(videoInfo, userInfo);
  const showLock = AccessControlService.shouldShowLock(videoInfo, userInfo);
  const lockType = AccessControlService.getLockType(videoInfo, userInfo);
  
  // Check if item is liked based on type
  const isLiked = type === 'short' ? isShortLiked(item.id) : isVideoLiked(item.id);
  
  const handleLike = () => {
    if (type === 'short') {
      toggleShortLike(item.id);
    } else {
      toggleVideoLike(item.id);
    }
  };

  const handlePress = () => {
    console.log(`\n========== ${type.toUpperCase()} CLICK DEBUG ==========`);
    console.log(`🎬 ${type.toUpperCase()} CLICKED!`);
    console.log('📱 ID:', item.id);
    console.log('📝 Title:', item.title);
    console.log('🔐 Access Info:', accessInfo);
    console.log('🔒 Show Lock:', showLock);
    
    // If no access, redirect to login
    if (!accessInfo.canAccess) {
      console.log('❌ Access denied, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Navigate based on type
    let targetUrl = '';
    switch (type) {
      case 'short':
        targetUrl = `/shorts-player?shortId=${item.id}`;
        break;
      case 'live':
        targetUrl = `/video-player?videoId=${item.id}&isLive=true`;
        break;
      default:
        targetUrl = `/video-player?videoId=${item.id}`;
    }
    
    console.log('🔗 Target URL:', targetUrl);
    console.log('🚀 Attempting navigation...');
    
    try {
      router.push(targetUrl as any);
      console.log('✅ Navigation command executed');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
    
    console.log(`========== END ${type.toUpperCase()} CLICK ==========\n`);
  };

  const handleLockPress = () => {
    console.log('🔒 Lock overlay pressed for:', item.title);
    console.log('🔐 Access type:', lockType);
    router.push('/login');
  };

  return (
    <TouchableOpacity 
      style={[
        type === 'short' ? styles.shortCard : styles.videoCard,
        style
      ]}
      onPress={handlePress}
    >
      <Image source={{ uri: item.thumbnail }} style={
        type === 'short' ? styles.shortThumbnail : styles.videoThumbnail
      } />
      
      {/* Play Button Overlay */}
      <View style={styles.playOverlay}>
        <Play color="#FFF" size={type === 'short' ? 30 : 40} fill="#FFF" />
      </View>

      {/* Category Badge */}
      {item.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
      
      {/* Access Control Overlay */}
      <VideoAccessOverlay
        isVisible={showLock}
        accessType={lockType}
        onPress={handleLockPress}
      />
      
      {/* Like Button */}
      {type !== 'short' && (
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
      )}
      
      {/* Video Info */}
      <View style={styles.videoInfo}>
        {item.clubLogo && type !== 'short' && (
          <View style={styles.clubBadge}>
            <Image source={{ uri: item.clubLogo }} style={styles.clubLogo} />
          </View>
        )}
        <Text style={styles.videoDate}>{item.date}</Text>
        <Text style={styles.videoTitle} numberOfLines={type === 'short' ? 2 : 3}>
          {item.title}
        </Text>
        {!accessInfo.canAccess && __DEV__ && (
          <Text style={styles.accessStatus}>🔒 {accessInfo.reason}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  shortCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#2C2C2E',
  },
  shortThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#2C2C2E',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 12,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  videoDate: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  accessStatus: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 5,
  },
});
