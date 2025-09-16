import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { Play } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnail: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  style?: any;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if the URL is a JW Player embed
  const isJWPlayer = videoUrl?.includes('bytomorrow.nl') || videoUrl?.includes('jump.video');
  
  // Create JW Player HTML with autoplay and loop
  const createJWPlayerHTML = (url: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: #000; 
            overflow: hidden;
          }
          iframe { 
            width: 100vw; 
            height: 100vh; 
            border: none; 
          }
        </style>
      </head>
      <body>
        <iframe 
          src="${url}${url.includes('?') ? '&' : '?'}autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}"
          allow="autoplay; fullscreen; encrypted-media"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  const handlePlay = () => {
    console.log('🎬 Playing video:', videoUrl);
    setIsPlaying(true);
  };

  if (Platform.OS === 'web') {
    if (videoUrl && isJWPlayer) {
      // Use iframe for JW Player on web
      return (
        <div style={{ width: '100%', height: '100%', ...style }}>
          <iframe
            src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      );
    } else if (videoUrl) {
      // Use video element for other video URLs
      return (
        <video
          src={videoUrl}
          style={{ width: '100%', height: '100%', ...style }}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          poster={thumbnail}
        />
      );
    }
  } else {
    // React Native - use WebView for video playback
    if (videoUrl && isPlaying) {
      return (
        <WebView
          source={{ html: createJWPlayerHTML(videoUrl) }}
          style={[styles.webView, style]}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={!autoplay}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      );
    }
  }

  // Fallback: Show thumbnail with play button
  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      {!isPlaying && (
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Play color="#FFF" size={50} fill="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
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
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
});
