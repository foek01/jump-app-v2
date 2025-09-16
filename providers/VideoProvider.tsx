import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiService } from '@/services/apiService';
import { useClubs } from '@/providers/ClubProvider';
import { Video, LiveEvent } from '@/types/club';
import { mockVideos, mockShorts, mockLiveEvents } from '@/mocks/videos';

// Filter function to hide premium content
const filterOutPremiumContent = (items: any[]) => {
  return items.filter(item => {
    // Hide premium content completely
    if (item.privacy === 'premium' || item.is_free === false) {
      console.log(`🚫 Hiding premium content: ${item.title}`);
      return false;
    }
    return true;
  });
};
import CacheService from '@/services/cacheService';

interface VideoState {
  videos: Video[];
  liveEvents: LiveEvent[];
  shorts: Video[];
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  searchVideos: (searchTerm: string) => Promise<Video[]>;
  getClubVideos: (clubId: string) => Video[];
  getClubLiveEvents: (clubId: string) => LiveEvent[];
  loadMoreVideos: () => Promise<void>;
  hasMoreVideos: boolean;
  clearCache: () => Promise<void>;
  getCacheStats: () => { memorySize: number; keys: string[] };
}

export const [VideoProvider, useVideos] = createContextHook<VideoState>(() => {
  const { clubs, selectedClubs } = useClubs();
  const [videos, setVideos] = useState<Video[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Get selected clubs with API configuration
  const apiEnabledClubs = useMemo(() => {
    return clubs.filter(club => 
      selectedClubs.includes(club.id) && 
      club.baseUrl && 
      club.jumpKey
    );
  }, [clubs, selectedClubs]);

  // Load content for selected clubs
  const loadContent = useCallback(async (isRefresh: boolean = false) => {
    // TEMPORARY: Always use mock data due to CORS issues
    console.log('📺 Using mock data due to CORS issues with API');
    
    // Try to get from cache first (unless it's a refresh)
    if (!isRefresh && selectedClubs.length > 0) {
      try {
        console.log('🔍 Checking cache for video content...');
        
        const [cachedVideos, cachedShorts, cachedLiveEvents] = await Promise.all([
          CacheService.getCachedVideos(selectedClubs, 'videos'),
          CacheService.getCachedVideos(selectedClubs, 'shorts'),
          CacheService.getCachedLiveEvents(selectedClubs),
        ]);

        if (cachedVideos && cachedShorts && cachedLiveEvents) {
          console.log('✅ Using cached data');
          setVideos(cachedVideos);
          setShorts(cachedShorts);
          setLiveEvents(cachedLiveEvents);
          setIsLoading(false);
          setError(null);
          return;
        }
      } catch (error) {
        console.log('⚠️ Cache error, falling back to fresh data:', error);
      }
    }

    console.log('🔄 Loading fresh mock data...');
    
    // Filter out premium content
    const filteredVideos = filterOutPremiumContent(mockVideos);
    const filteredShorts = filterOutPremiumContent(mockShorts);
    const filteredLiveEvents = filterOutPremiumContent(mockLiveEvents);
    
    console.log(`📊 Content after premium filtering:`);
    console.log(`📹 Videos: ${mockVideos.length} → ${filteredVideos.length}`);
    console.log(`🎬 Shorts: ${mockShorts.length} → ${filteredShorts.length}`);
    console.log(`🔴 Live Events: ${mockLiveEvents.length} → ${filteredLiveEvents.length}`);
    
    setVideos(filteredVideos);
    setShorts(filteredShorts);
    setLiveEvents(filteredLiveEvents);
    setIsLoading(false);
    setError(null);

    // Cache the mock data for future use
    if (selectedClubs.length > 0) {
      try {
        await Promise.all([
          CacheService.cacheVideos(selectedClubs, mockVideos, 'videos'),
          CacheService.cacheVideos(selectedClubs, mockShorts, 'shorts'),
          CacheService.cacheLiveEvents(selectedClubs, mockLiveEvents),
        ]);
        console.log('💾 Cached mock data');
      } catch (error) {
        console.log('⚠️ Error caching data:', error);
      }
    }
    return;
    
    // Original API logic (disabled due to CORS)
    if (apiEnabledClubs.length === 0) {
      console.log('📺 No API-enabled clubs selected, using mock data');
      
      // Filter out premium content
      const filteredVideos = filterOutPremiumContent(mockVideos);
      const filteredShorts = filterOutPremiumContent(mockShorts);
      const filteredLiveEvents = filterOutPremiumContent(mockLiveEvents);
      
      setVideos(filteredVideos);
      setShorts(filteredShorts);
      setLiveEvents(filteredLiveEvents);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (isRefresh) {
        setCurrentPage(0);
        setHasMoreVideos(true);
      }

      console.log(`🔄 Loading content for ${apiEnabledClubs.length} clubs...`);

      // Load different types of content in parallel
      const [standardVideosResults, shortVideosResults, liveEventsResults] = await Promise.allSettled([
        // Standard videos (h-video tag)
        Promise.all(apiEnabledClubs.map(async (club) => {
          try {
            const { videos } = await ApiService.getStandardVideos(club, {
              limit: Math.ceil(20 / apiEnabledClubs.length),
              after: isRefresh ? 0 : currentPage * 20,
            });
            return videos;
          } catch (error) {
            console.error(`Failed to load standard videos for ${club.name}:`, error);
            return [];
          }
        })),
        // Short videos (short tag)
        Promise.all(apiEnabledClubs.map(async (club) => {
          try {
            const { videos } = await ApiService.getShortVideos(club, {
              limit: Math.ceil(20 / apiEnabledClubs.length),
              after: isRefresh ? 0 : currentPage * 20,
            });
            return videos;
          } catch (error) {
            console.error(`Failed to load short videos for ${club.name}:`, error);
            return [];
          }
        })),
        // Live events
        Promise.all(apiEnabledClubs.map(async (club) => {
          try {
            const { events } = await ApiService.getLiveEvents(club, {
              limit: Math.ceil(10 / apiEnabledClubs.length),
              after: isRefresh ? 0 : currentPage * 10,
            });
            return events;
          } catch (error) {
            console.error(`Failed to load live events for ${club.name}:`, error);
            return [];
          }
        }))
      ]);

      // Process standard videos
      const allStandardVideos: Video[] = [];
      if (standardVideosResults.status === 'fulfilled') {
        standardVideosResults.value.forEach(clubVideos => {
          allStandardVideos.push(...clubVideos);
        });
      }

      // Process short videos
      const allShortVideos: Video[] = [];
      if (shortVideosResults.status === 'fulfilled') {
        shortVideosResults.value.forEach(clubVideos => {
          allShortVideos.push(...clubVideos);
        });
      }

      // Process live events
      const allLiveEvents: LiveEvent[] = [];
      if (liveEventsResults.status === 'fulfilled') {
        liveEventsResults.value.forEach(clubEvents => {
          allLiveEvents.push(...clubEvents);
        });
      }

      // Sort videos by date (newest first)
      const sortedStandardVideos = allStandardVideos.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const sortedShortVideos = allShortVideos.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Sort live events by start time
      const sortedLiveEvents = allLiveEvents.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      if (isRefresh) {
        setVideos(sortedStandardVideos);
        setShorts(sortedShortVideos);
        setLiveEvents(sortedLiveEvents);
      } else {
        setVideos(prev => [...prev, ...sortedStandardVideos]);
        setShorts(prev => [...prev, ...sortedShortVideos]);
        setLiveEvents(prev => [...prev, ...sortedLiveEvents]);
      }

      // Check if there are more videos to load
      setHasMoreVideos(sortedStandardVideos.length >= 20 || sortedShortVideos.length >= 20);
      
      console.log(`✅ Loaded content: ${sortedStandardVideos.length} standard videos, ${sortedShortVideos.length} short videos, ${sortedLiveEvents.length} live events`);
      
    } catch (err: any) {
      console.error('❌ Error loading video content:', err);
      setError(`Failed to load content: ${err.message}`);
      
      // Fallback to mock data on error
      if (isRefresh || videos.length === 0) {
        console.log('🔄 Using mock data as fallback');
        
        // Filter out premium content
        const filteredVideos = filterOutPremiumContent(mockVideos);
        const filteredShorts = filterOutPremiumContent(mockShorts);
        
        setVideos(filteredVideos);
        setShorts(filteredShorts);
        setLiveEvents([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiEnabledClubs, currentPage, videos.length]);

  // Initial load
  useEffect(() => {
    loadContent(true);
  }, [selectedClubs, clubs, loadContent]);

  const refreshContent = useCallback(async () => {
    console.log('🔄 Refreshing video content...');
    await loadContent(true);
  }, [loadContent]);

  const loadMoreVideos = useCallback(async () => {
    if (!hasMoreVideos || isLoading) return;
    
    console.log('📄 Loading more videos...');
    setCurrentPage(prev => prev + 1);
    await loadContent(false);
  }, [hasMoreVideos, isLoading, loadContent]);

  const searchVideos = useCallback(async (searchTerm: string): Promise<Video[]> => {
    if (!searchTerm.trim()) return videos;
    
    console.log(`🔍 Searching videos for: "${searchTerm}"`);
    
    try {
      if (apiEnabledClubs.length > 0) {
        const searchResults = await ApiService.searchVideosAcrossClubs(
          apiEnabledClubs,
          searchTerm,
          50
        );
        return searchResults;
      } else {
        // Fallback to local search in mock data
        return mockVideos.filter(video =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      // Fallback to local search
      return videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [videos, apiEnabledClubs]);

  const getClubVideos = useCallback((clubId: string): Video[] => {
    return videos.filter(video => {
      const club = clubs.find(c => c.id === clubId);
      return club && video.clubLogo === club.logo;
    });
  }, [videos, clubs]);

  const getClubLiveEvents = useCallback((clubId: string): LiveEvent[] => {
    return liveEvents.filter(event => {
      const club = clubs.find(c => c.id === clubId);
      return club && event.clubLogo === club.logo;
    });
  }, [liveEvents, clubs]);

  // Cache management functions
  const clearCache = useCallback(async () => {
    console.log('🧹 Clearing video cache...');
    await CacheService.clear();
    console.log('✅ Cache cleared');
  }, []);

  const getCacheStats = useCallback(() => {
    return CacheService.getCacheStats();
  }, []);

  return useMemo(() => ({
    videos,
    liveEvents,
    shorts,
    isLoading,
    error,
    refreshContent,
    searchVideos,
    getClubVideos,
    getClubLiveEvents,
    loadMoreVideos,
    hasMoreVideos,
    clearCache,
    getCacheStats,
  }), [
    videos,
    liveEvents,
    shorts,
    isLoading,
    error,
    refreshContent,
    searchVideos,
    getClubVideos,
    getClubLiveEvents,
    loadMoreVideos,
    hasMoreVideos,
    clearCache,
    getCacheStats,
  ]);
});