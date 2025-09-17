import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, LiveEvent } from '@/types/club';

interface CacheData {
  data: any;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private static readonly CACHE_PREFIX = '@cache_';
  private static readonly DEFAULT_EXPIRY = 1 * 60 * 1000; // 1 minute for faster updates

  // Memory cache for faster access
  private static memoryCache = new Map<string, CacheData>();

  /**
   * Store data in both memory and AsyncStorage
   */
  static async set(key: string, data: any, expiryMs: number = this.DEFAULT_EXPIRY): Promise<void> {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs,
    };

    // Store in memory
    this.memoryCache.set(key, cacheData);

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheData)
      );
      console.log(`💾 Cached data for key: ${key}`);
    } catch (error) {
      console.error('❌ Error storing cache:', error);
    }
  }

  /**
   * Get data from memory first, then AsyncStorage
   */
  static async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && this.isValid(memoryCached)) {
      console.log(`🚀 Memory cache hit for: ${key}`);
      return memoryCached.data as T;
    }

    // Try AsyncStorage
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (cached) {
        const cacheData: CacheData = JSON.parse(cached);
        
        if (this.isValid(cacheData)) {
          // Store back in memory for faster access
          this.memoryCache.set(key, cacheData);
          console.log(`💿 AsyncStorage cache hit for: ${key}`);
          return cacheData.data as T;
        } else {
          // Expired, remove from storage
          await this.remove(key);
          console.log(`⏰ Cache expired for: ${key}`);
        }
      }
    } catch (error) {
      console.error('❌ Error reading cache:', error);
    }

    console.log(`❌ Cache miss for: ${key}`);
    return null;
  }

  /**
   * Remove data from both caches
   */
  static async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
      console.log(`🗑️ Removed cache for: ${key}`);
    } catch (error) {
      console.error('❌ Error removing cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🧹 Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Check if cached data is still valid
   */
  private static isValid(cacheData: CacheData): boolean {
    const now = Date.now();
    return (now - cacheData.timestamp) < cacheData.expiry;
  }

  /**
   * Generate cache key for videos
   */
  static getVideoCacheKey(clubIds: string[], type: 'shorts' | 'videos' | 'live'): string {
    const sortedIds = clubIds.sort().join(',');
    return `${type}_${sortedIds}`;
  }

  /**
   * Cache videos with smart expiry
   */
  static async cacheVideos(
    clubIds: string[], 
    videos: Video[], 
    type: 'shorts' | 'videos' = 'videos'
  ): Promise<void> {
    const key = this.getVideoCacheKey(clubIds, type);
    // Videos cache for 1 minute for faster updates
    await this.set(key, videos, 1 * 60 * 1000);
  }

  /**
   * Get cached videos
   */
  static async getCachedVideos(
    clubIds: string[], 
    type: 'shorts' | 'videos' = 'videos'
  ): Promise<Video[] | null> {
    const key = this.getVideoCacheKey(clubIds, type);
    return await this.get<Video[]>(key);
  }

  /**
   * Cache live events with shorter expiry
   */
  static async cacheLiveEvents(clubIds: string[], events: LiveEvent[]): Promise<void> {
    const key = this.getVideoCacheKey(clubIds, 'live');
    // Live events cache for 30 seconds (more dynamic)
    await this.set(key, events, 30 * 1000);
  }

  /**
   * Get cached live events
   */
  static async getCachedLiveEvents(clubIds: string[]): Promise<LiveEvent[] | null> {
    const key = this.getVideoCacheKey(clubIds, 'live');
    return await this.get<LiveEvent[]>(key);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { memorySize: number; keys: string[] } {
    return {
      memorySize: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };
  }
}

export default CacheService;
