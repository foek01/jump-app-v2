import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface JumpVideoPlayerProps {
  videoUrl?: string;
  streamUrl?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  style?: any;
}

export const JumpVideoPlayer: React.FC<JumpVideoPlayerProps> = ({
  videoUrl,
  streamUrl,
  autoplay = true,
  controls = true,
  loop = false,
  muted = false,
  style,
}) => {
  const url = videoUrl || streamUrl;
  
  if (!url) return null;

  // Create proper embed URL with authentication token
  const getCleanEmbedUrl = (originalUrl: string) => {
    let cleanUrl = originalUrl;
    console.log('🔍 Original URL:', originalUrl);
    
    // If it's already an embed URL, use it as-is
    if (cleanUrl.includes('/watch-embed/')) {
      console.log('✅ Already embed URL, using as-is');
      return cleanUrl;
    }
    
    // Convert watch URL to embed URL
    if (cleanUrl.includes('/watch/')) {
      cleanUrl = cleanUrl.replace('/watch/', '/watch-embed/');
      console.log('🔄 Converted to embed URL:', cleanUrl);
    }
    
    // Parse existing parameters to preserve important ones like 'et' token
    const [baseUrl, queryString] = cleanUrl.split('?');
    const existingParams = new URLSearchParams(queryString || '');
    
    // Preserve authentication token and other important parameters
    const finalParams = new URLSearchParams();
    
    // Keep existing 'et' token if present (essential for authentication)
    if (existingParams.has('et')) {
      finalParams.set('et', existingParams.get('et')!);
    }
    
    // Set video parameters
    if (autoplay) finalParams.set('autoplay', '1');
    if (controls) finalParams.set('controls', '1');
    if (loop) finalParams.set('loop', '1');
    if (muted) finalParams.set('muted', '1');
    
    const finalUrl = `${baseUrl}?${finalParams.toString()}`;
    console.log('🎬 Final embed URL:', finalUrl);
    return finalUrl;
  };

  if (Platform.OS === 'web') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
        <iframe
          src={getCleanEmbedUrl(url)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#000',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          allow="autoplay; fullscreen; encrypted-media; camera; microphone"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Jump Video Player"
          frameBorder="0"
          scrolling="no"
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
