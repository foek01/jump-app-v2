import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode } from 'expo-av';

interface OptimizedVideoPlayerProps {
  videoUrl?: string;
  streamUrl?: string;
  media_id?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  isShort?: boolean;
  style?: any;
}

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  videoUrl,
  streamUrl,
  media_id,
  autoplay = true,
  loop = false,
  muted = false,
  controls = true,
  isShort = false,
  style,
}) => {
  const url = videoUrl || streamUrl;
  
  // Create direct JW Player media URLs from media_id if available
  const getJWPlayerUrl = (mediaId: string, format: 'hls' | 'mp4' = 'hls') => {
    if (format === 'mp4') {
      return `https://cdn.jwplayer.com/videos/${mediaId}.mp4`;
    }
    return `https://cdn.jwplayer.com/manifests/${mediaId}.m3u8`;
  };

  // For now, disable direct media and use original URLs to avoid white screen
  // TODO: Re-enable when JW Player direct URLs are confirmed working
  const finalUrl = url; // Use original URL for now
  const fallbackUrl = media_id ? getJWPlayerUrl(media_id, 'hls') : null; // Keep for future use
  const useDirectMedia = false; // Temporarily disabled
  
  if (__DEV__) {
    console.log('🎬 OptimizedVideoPlayer:', {
      media_id,
      useDirectMedia,
      originalUrl: url,
      finalUrl,
      fallbackUrl,
    });
  }
  
  if (!finalUrl) return null;

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
      
      // Set video parameters based on props
      if (autoplay) optimizedParams.set('autoplay', '1');
      if (controls) optimizedParams.set('controls', '1');
      if (loop) optimizedParams.set('loop', '1');
      if (muted) optimizedParams.set('muted', '1');
      
      // Add parameters to show only the video player, not the full website
      optimizedParams.set('minimal', '1');        // Minimal UI
      optimizedParams.set('noshare', '1');        // No share button
      optimizedParams.set('nocomments', '1');     // No comments
      optimizedParams.set('norelated', '1');      // No related videos
      optimizedParams.set('nologo', '1');         // No logo overlay
      optimizedParams.set('playeronly', '1');     // Player only mode
      optimizedParams.set('embed', '1');          // Embed mode
      optimizedParams.set('casting', '1');        // Enable casting/AirPlay
      optimizedParams.set('airplay', '1');        // Enable AirPlay
      optimizedParams.set('chromecast', '1');     // Enable Chromecast
      
      // Add media_id for JW Player custom design
      if (media_id) {
        optimizedParams.set('media_id', media_id);
        optimizedParams.set('player_id', media_id);  // Alternative parameter name
      }
      
      // For shorts, add specific parameters
      if (isShort) {
        optimizedParams.set('loop', '1');
        optimizedParams.set('muted', '1');
        optimizedParams.set('controls', '0');
        optimizedParams.set('fit', 'cover');
        optimizedParams.set('autostart', '1');    // Auto start for shorts
      }
      
      // Preserve specific existing parameters if not overridden
      if (params.has('fit') && !isShort) optimizedParams.set('fit', params.get('fit')!);
      
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
    // Use HTML5 video for direct media files (MP4/HLS)
    if (useDirectMedia) {
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
          <video
            src={finalUrl}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'contain',
            }}
            onError={(e) => {
              if (__DEV__) {
                console.error('❌ Direct media error:', e);
                if (fallbackUrl) {
                  console.log('🔄 Could try HLS fallback:', fallbackUrl);
                }
              }
            }}
            onLoadStart={() => {
              if (__DEV__) console.log('🔄 Direct media loading started');
            }}
            onLoadedData={() => {
              if (__DEV__) console.log('✅ Direct media loaded successfully');
            }}
          />
        </div>
      );
    }

    // Fallback to iframe for embed URLs
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
          src={getOptimizedUrl(finalUrl)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '8px',
            objectFit: 'cover',
          }}
          allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope; picture-in-picture; web-share; display-capture; camera; microphone"
          allowFullScreen
          title="JW Video Player"
          frameBorder="0"
          scrolling="no"
          seamless
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        />
      </div>
    );
  }

  // For React Native, use expo-av Video for direct media files, WebView for embed URLs
  if (useDirectMedia) {
    return (
      <View style={[styles.container, style]}>
        <Video
          style={{ flex: 1 }}
          source={{ uri: finalUrl }}
          useNativeControls={controls}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoplay}
          isLooping={loop}
          isMuted={muted}
          onError={(error) => {
            if (__DEV__) {
              console.error('❌ Direct media error:', error);
              if (fallbackUrl) {
                console.log('🔄 Trying HLS fallback:', fallbackUrl);
                // Could implement fallback logic here
              }
            }
          }}
          onLoad={() => {
            if (__DEV__) console.log('✅ Direct media loaded successfully');
          }}
          onLoadStart={() => {
            if (__DEV__) console.log('🔄 Direct media loading started');
          }}
        />
      </View>
    );
  }

  // Fallback to WebView for embed URLs
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: getOptimizedUrl(finalUrl) }}
        style={{ flex: 1 }}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Enhanced settings for video playback
        allowsLinkPreview={false}
        allowsBackForwardNavigationGestures={false}
        // Inject JavaScript for better video control and hide website elements
        injectedJavaScript={isShort ? `
          // Enhanced message listener for better video control
          window.addEventListener('message', function(event) {
            const videos = document.querySelectorAll('video');
            const jwPlayer = document.querySelector('.jw-wrapper, .jw-media, .jwplayer, [id*="jwplayer"]');
            
            switch(event.data.action) {
              case 'play':
                videos.forEach(video => {
                  video.play().catch(e => console.log('Play prevented:', e));
                });
                if (jwPlayer && jwPlayer.play) jwPlayer.play();
                break;
              case 'pause':
                videos.forEach(video => {
                  video.pause();
                });
                if (jwPlayer && jwPlayer.pause) jwPlayer.pause();
                break;
              case 'mute':
                videos.forEach(video => {
                  video.muted = true;
                });
                if (jwPlayer && jwPlayer.mute) jwPlayer.mute();
                break;
              case 'unmute':
                videos.forEach(video => {
                  video.muted = false;
                });
                if (jwPlayer && jwPlayer.unmute) jwPlayer.unmute();
                break;
              case 'stop':
                videos.forEach(video => {
                  video.pause();
                  video.currentTime = 0;
                  video.muted = true;
                });
                if (jwPlayer && jwPlayer.stop) jwPlayer.stop();
                break;
              case 'loop':
                videos.forEach(video => {
                  video.loop = true;
                });
                break;
            }
          });
          
          // Hide website elements and show only JW Player for shorts
          setTimeout(() => {
            // Remove TEST div and other unwanted elements
            const elementsToHide = [
              'nav', 'header', 'footer', '.navbar', '.menu', '.sidebar', 
              '.comments', '.related', '.css-view-g5y9jx', 
              '[class*="css-view"]', '[class*="TEST"]',
              'div:contains("TEST")', '.test-element'
            ];
            elementsToHide.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => el.style.display = 'none');
            });
            
            // Remove TEST divs specifically
            const testDivs = document.querySelectorAll('div');
            testDivs.forEach(div => {
              if (div.textContent && div.textContent.trim() === 'TEST') {
                div.style.display = 'none';
                console.log('🗑️ Removed TEST div:', div);
              }
            });
            
            // Focus on JW Player container
            const jwPlayer = document.querySelector('.jw-wrapper, .jw-media, .jwplayer, [id*="jwplayer"]');
            if (jwPlayer) {
              jwPlayer.style.position = 'fixed';
              jwPlayer.style.top = '0';
              jwPlayer.style.left = '0';
              jwPlayer.style.width = '100vw';
              jwPlayer.style.height = '100vh';
              jwPlayer.style.zIndex = '9999';
              jwPlayer.style.backgroundColor = '#000';
            }
            
            // Auto-loop and mute for shorts + Enable casting
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
              video.loop = true;
              video.muted = true;
              video.autoplay = true;
              video.playsInline = true;
              // Enable casting/AirPlay
              video.setAttribute('x-webkit-airplay', 'allow');
              video.setAttribute('webkit-playsinline', 'false');
              video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play();
              });
            });
            
            // Enable JW Player casting if available
            if (window.jwplayer && window.jwplayer.getPlayers) {
              const players = window.jwplayer.getPlayers();
              players.forEach(player => {
                if (player.setCasting) {
                  player.setCasting(true);
                  console.log('📺 Casting enabled for JW Player');
                }
              });
            }
          }, 1000);
          true;
        ` : `
          // Enhanced message listener for regular videos
          window.addEventListener('message', function(event) {
            const videos = document.querySelectorAll('video');
            const jwPlayer = document.querySelector('.jw-wrapper, .jw-media, .jwplayer, [id*="jwplayer"]');
            
            switch(event.data.action) {
              case 'play':
                videos.forEach(video => {
                  video.play().catch(e => console.log('Play prevented:', e));
                });
                if (jwPlayer && jwPlayer.play) jwPlayer.play();
                break;
              case 'pause':
                videos.forEach(video => {
                  video.pause();
                });
                if (jwPlayer && jwPlayer.pause) jwPlayer.pause();
                break;
              case 'mute':
                videos.forEach(video => {
                  video.muted = true;
                });
                if (jwPlayer && jwPlayer.mute) jwPlayer.mute();
                break;
              case 'unmute':
                videos.forEach(video => {
                  video.muted = false;
                });
                if (jwPlayer && jwPlayer.unmute) jwPlayer.unmute();
                break;
              case 'stop':
                videos.forEach(video => {
                  video.pause();
                  video.currentTime = 0;
                });
                if (jwPlayer && jwPlayer.stop) jwPlayer.stop();
                break;
            }
          });
          
          // Hide website elements and show only JW Player for regular videos
          setTimeout(() => {
            // Remove TEST div and other unwanted elements
            const elementsToHide = [
              'nav', 'header', 'footer', '.navbar', '.menu', '.sidebar', 
              '.comments', '.related', '.css-view-g5y9jx',
              '[class*="css-view"]', '[class*="TEST"]',
              'div:contains("TEST")', '.test-element'
            ];
            elementsToHide.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => el.style.display = 'none');
            });
            
            // Remove TEST divs specifically
            const testDivs = document.querySelectorAll('div');
            testDivs.forEach(div => {
              if (div.textContent && div.textContent.trim() === 'TEST') {
                div.style.display = 'none';
                console.log('🗑️ Removed TEST div:', div);
              }
            });
            
            // Focus on JW Player container
            const jwPlayer = document.querySelector('.jw-wrapper, .jw-media, .jwplayer, [id*="jwplayer"]');
            if (jwPlayer) {
              jwPlayer.style.position = 'fixed';
              jwPlayer.style.top = '0';
              jwPlayer.style.left = '0';
              jwPlayer.style.width = '100vw';
              jwPlayer.style.height = '100vh';
              jwPlayer.style.zIndex = '9999';
              jwPlayer.style.backgroundColor = '#000';
            }
            
            // Standard video settings + Enable casting
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
              video.autoplay = ${autoplay};
              video.loop = ${loop};
              video.muted = ${muted};
              video.playsInline = true;
              // Enable casting/AirPlay
              video.setAttribute('x-webkit-airplay', 'allow');
              video.setAttribute('webkit-playsinline', 'false');
            });
            
            // Enable JW Player casting if available
            if (window.jwplayer && window.jwplayer.getPlayers) {
              const players = window.jwplayer.getPlayers();
              players.forEach(player => {
                if (player.setCasting) {
                  player.setCasting(true);
                  console.log('📺 Casting enabled for JW Player');
                }
              });
            }
          }, 1000);
          true;
        `}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        onLoadStart={() => {
          if (__DEV__) console.log('📱 WebView loading started');
        }}
        onLoadEnd={() => {
          if (__DEV__) console.log('📱 WebView loading completed');
        }}
      />
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
