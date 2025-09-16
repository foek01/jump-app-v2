import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  likedVideos: Set<string>;
  likedShorts: Set<string>;
  likedNews: Set<string>;
  toggleVideoLike: (videoId: string) => void;
  toggleShortLike: (shortId: string) => void;
  toggleNewsLike: (newsId: string) => void;
  isVideoLiked: (videoId: string) => boolean;
  isShortLiked: (shortId: string) => boolean;
  isNewsLiked: (newsId: string) => boolean;
}

export const [FavoritesProvider, useFavorites] = createContextHook<FavoritesState>(() => {
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const [storedVideos, storedShorts, storedNews] = await Promise.all([
        AsyncStorage.getItem('likedVideos'),
        AsyncStorage.getItem('likedShorts'),
        AsyncStorage.getItem('likedNews')
      ]);
      
      if (storedVideos && storedVideos !== "undefined" && storedVideos !== "null") {
        try {
          const parsed = JSON.parse(storedVideos);
          if (Array.isArray(parsed)) {
            setLikedVideos(new Set(parsed));
          }
        } catch (e) {
          console.error('Error parsing likedVideos:', e);
          await AsyncStorage.removeItem('likedVideos');
        }
      }
      if (storedShorts && storedShorts !== "undefined" && storedShorts !== "null") {
        try {
          const parsed = JSON.parse(storedShorts);
          if (Array.isArray(parsed)) {
            setLikedShorts(new Set(parsed));
          }
        } catch (e) {
          console.error('Error parsing likedShorts:', e);
          await AsyncStorage.removeItem('likedShorts');
        }
      }
      if (storedNews && storedNews !== "undefined" && storedNews !== "null") {
        try {
          const parsed = JSON.parse(storedNews);
          if (Array.isArray(parsed)) {
            setLikedNews(new Set(parsed));
          }
        } catch (e) {
          console.error('Error parsing likedNews:', e);
          await AsyncStorage.removeItem('likedNews');
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const saveFavorites = useCallback(async (videos: Set<string>, shorts: Set<string>, news: Set<string>) => {
    if (!videos || !shorts || !news) return;
    try {
      await Promise.all([
        AsyncStorage.setItem('likedVideos', JSON.stringify(Array.from(videos))),
        AsyncStorage.setItem('likedShorts', JSON.stringify(Array.from(shorts))),
        AsyncStorage.setItem('likedNews', JSON.stringify(Array.from(news)))
      ]);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  const toggleVideoLike = useCallback((videoId: string) => {
    if (!videoId?.trim()) return;
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        console.log('💔 Unliked video:', videoId);
      } else {
        newSet.add(videoId);
        console.log('❤️ Liked video:', videoId);
      }
      saveFavorites(newSet, likedShorts, likedNews);
      return newSet;
    });
  }, [likedShorts, likedNews, saveFavorites]);

  const toggleShortLike = useCallback((shortId: string) => {
    if (!shortId?.trim()) return;
    setLikedShorts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shortId)) {
        newSet.delete(shortId);
        console.log('💔 Unliked short:', shortId);
      } else {
        newSet.add(shortId);
        console.log('❤️ Liked short:', shortId);
      }
      saveFavorites(likedVideos, newSet, likedNews);
      return newSet;
    });
  }, [likedVideos, likedNews, saveFavorites]);

  const isVideoLiked = useCallback((videoId: string) => {
    if (!videoId?.trim()) return false;
    return likedVideos.has(videoId);
  }, [likedVideos]);
  
  const isShortLiked = useCallback((shortId: string) => {
    if (!shortId?.trim()) return false;
    return likedShorts.has(shortId);
  }, [likedShorts]);

  const toggleNewsLike = useCallback((newsId: string) => {
    if (!newsId?.trim()) return;
    setLikedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
        console.log('💔 Unliked news:', newsId);
      } else {
        newSet.add(newsId);
        console.log('❤️ Liked news:', newsId);
      }
      saveFavorites(likedVideos, likedShorts, newSet);
      return newSet;
    });
  }, [likedVideos, likedShorts, saveFavorites]);

  const isNewsLiked = useCallback((newsId: string) => {
    if (!newsId?.trim()) return false;
    return likedNews.has(newsId);
  }, [likedNews]);

  return useMemo(() => ({
    likedVideos,
    likedShorts,
    likedNews,
    toggleVideoLike,
    toggleShortLike,
    toggleNewsLike,
    isVideoLiked,
    isShortLiked,
    isNewsLiked,
  }), [likedVideos, likedShorts, likedNews, toggleVideoLike, toggleShortLike, toggleNewsLike, isVideoLiked, isShortLiked, isNewsLiked]);
});