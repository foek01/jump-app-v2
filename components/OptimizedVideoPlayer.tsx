import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface OptimizedVideoPlayerProps {
  videoUrl?: string;
  streamUrl?: string;
  style?: any;
}

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  videoUrl,
  streamUrl,
  style,
}) => {
  const url = videoUrl || streamUrl;
  
  if (!url) return null;

  // Optimize URL for video-only display
  const getOptimizedUrl = (originalUrl: string) => {
    if (__DEV__) {
      console.log('🔧 Optimizing URL:', originalUrl);
    }
    
    // If it's already an embed URL, use it as-is if it has et token
    if (originalUrl.includes('/watch-embed/')) {
      const [baseUrl, queryString] = originalUrl.split('?');
      const params = new URLSearchParams(queryString || '');
      
      // If it already has et token and basic params, use as-is
      if (params.has('et') && (params.has('autoplay') || params.has('controls'))) {
        if (__DEV__) {
          console.log('✅ Using original embed URL as-is:', originalUrl);
        }
        return originalUrl;
      }
      
      // Otherwise, rebuild with essential parameters
      const optimizedParams = new URLSearchParams();
      
      // Keep authentication token (essential!)
      if (params.has('et')) {
        optimizedParams.set('et', params.get('et')!);
      }
      
      // Set only essential video parameters
      optimizedParams.set('autoplay', '1');
      optimizedParams.set('controls', '1');
      
      // Preserve specific existing parameters
      if (params.has('loop')) optimizedParams.set('loop', params.get('loop')!);
      if (params.has('muted')) optimizedParams.set('muted', params.get('muted')!);
      if (params.has('fit')) optimizedParams.set('fit', params.get('fit')!);
      
      const optimizedUrl = `${baseUrl}?${optimizedParams.toString()}`;
      if (__DEV__) {
        console.log('✅ Rebuilt embed URL:', optimizedUrl);
      }
      return optimizedUrl;
    }
    
    // Convert watch URL to embed if needed
    if (originalUrl.includes('/watch/')) {
      const embedUrl = originalUrl.replace('/watch/', '/watch-embed/');
      return getOptimizedUrl(embedUrl);
    }
    
    return originalUrl;
  };

  if (Platform.OS === 'web') {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style 
      }}>
        <iframe
          src={getOptimizedUrl(url)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '8px',
          }}
          allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Player"
          frameBorder="0"
          scrolling="no"
          seamless
        />
      </div>
    );
  }

  // For React Native, you would use WebView here
  return (
    <View style={[styles.container, style]}>
      {/* WebView implementation for React Native */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
