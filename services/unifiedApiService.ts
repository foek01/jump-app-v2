// Unified API Service - SSO + Price Plans Based
import { ApiAsset, ApiResponse, ApiUser, Video, LiveEvent, Club } from '@/types/club';

interface UnifiedApiConfig {
  useSSO: boolean; // true = SSO only, false = per-club keys
  centralApiKey?: string; // Voor SSO mode
  baseUrl: string;
}

export class UnifiedApiService {
  private static config: UnifiedApiConfig = {
    useSSO: true, // Aanbevolen: gebruik SSO
    centralApiKey: 'M2U5MjgwOGE3OTQ4OTc5YjBkOTBhZmMxMTIwNmMxZTQ4NDc3N2Q4YjJhMTliYzU4NmYzNWRhNzM5MWRiOTkyNQ==',
    baseUrl: 'https://api.bytomorrow.nl'
  };

  /**
   * Configure API service
   */
  static configure(config: Partial<UnifiedApiConfig>) {
    this.config = { ...this.config, ...config };
    console.log('🔧 API Service configured:', this.config);
  }

  /**
   * Get videos with user-based filtering
   */
  static async getVideosForUser(
    userEmail: string,
    userPricePlans: string[],
    type: 'short' | 'h-video' | 'live' = 'h-video',
    limit: number = 20
  ): Promise<{ videos: Video[]; meta?: any }> {
    
    if (this.config.useSSO) {
      // SSO Mode: Eén API call met user filtering
      return this.getVideosSSO(userEmail, userPricePlans, type, limit);
    } else {
      // Per-Club Mode: Meerdere API calls per club
      return this.getVideosPerClub(userPricePlans, type, limit);
    }
  }

  /**
   * SSO Mode: Eén API call met user-based filtering
   */
  private static async getVideosSSO(
    userEmail: string,
    userPricePlans: string[],
    type: string,
    limit: number
  ): Promise<{ videos: Video[]; meta?: any }> {
    try {
      console.log('🔐 SSO API call:', { userEmail, pricePlans: userPricePlans, type });

      const endpoint = type === 'live' ? '/v1/live-events' : '/v1/on-demand';
      const params = new URLSearchParams({
        limit: limit.toString(),
        email_address: userEmail, // User filtering
        tags: type === 'short' ? 'short' : type === 'live' ? 'live' : 'h-video'
      });

      const response = await fetch(`${this.config.baseUrl}${endpoint}?${params}`, {
        headers: {
          'Authorization': this.config.centralApiKey!,
          'Accept': 'application/json',
          'X-User-Email': userEmail,
          'X-Price-Plans': userPricePlans.join(',') // Voor server-side filtering
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const videos = this.mapApiDataToVideos(data);
      
      console.log(`✅ SSO API success: ${videos.length} ${type} videos`);
      return { videos, meta: data.meta };

    } catch (error) {
      console.error('❌ SSO API error:', error);
      return { videos: [] };
    }
  }

  /**
   * Per-Club Mode: Meerdere API calls per club
   */
  private static async getVideosPerClub(
    clubIds: string[],
    type: string,
    limit: number
  ): Promise<{ videos: Video[]; meta?: any }> {
    try {
      console.log('🏟️ Per-club API calls:', { clubs: clubIds, type });

      // Dit vereist dat elke club zijn eigen jumpKey heeft
      const promises = clubIds.map(async (clubId) => {
        // Hier zou je de club data ophalen en de club-specifieke API key gebruiken
        // Voor nu simuleren we dit
        return [];
      });

      const results = await Promise.all(promises);
      const allVideos = results.flat();
      
      console.log(`✅ Per-club API success: ${allVideos.length} ${type} videos`);
      return { videos: allVideos };

    } catch (error) {
      console.error('❌ Per-club API error:', error);
      return { videos: [] };
    }
  }

  /**
   * Map API response to Video objects
   */
  private static mapApiDataToVideos(apiData: any[]): Video[] {
    return apiData.map(asset => ({
      id: String(asset.id),
      title: asset.title || 'Untitled',
      description: asset.description || '',
      thumbnail: asset.thumbnail || asset.thumbnail_url || '',
      videoUrl: asset.url || asset.embed_url,
      duration: asset.duration,
      date: new Date(asset.creation_date || asset.created_at).toLocaleDateString('nl-NL'),
      category: asset.tags?.split(',')[0] || 'Video',
      tags: asset.tags?.split(',') || [],
      isLive: asset.is_live || false,
    }));
  }

  /**
   * Check user access to specific club content
   */
  static async checkUserAccess(
    userEmail: string,
    clubId: string
  ): Promise<boolean> {
    try {
      const user = await this.getUserData(userEmail);
      return user?.owned_price_plans?.includes(parseInt(clubId)) || false;
    } catch (error) {
      console.error('❌ Access check failed:', error);
      return false;
    }
  }

  /**
   * Get user data via SSO
   */
  static async getUserData(email: string): Promise<ApiUser | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/get-user?email_address=${email}`, {
        headers: {
          'Authorization': this.config.centralApiKey!,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('❌ Get user data failed:', error);
      return null;
    }
  }
}

// Export configuratie opties
export const API_MODES = {
  SSO_ONLY: { useSSO: true },
  PER_CLUB: { useSSO: false },
} as const;
