// ApiService.ts (TESTABLE VERSION)
// Zet hieronder USE_TEST_CONFIG = true en vul TEST_BASE_URL + TEST_API_KEY in om direct te testen.

import { ApiAsset, ApiResponse, ApiUser, Video, LiveEvent, Club } from '@/types/club';

/** ====== API CONFIG ====== **/
// CORS issue: Browser blocks direct API calls, use mock data for now
const USE_TEST_CONFIG = false; // <- tijdelijk op false voor mock data
const USE_SSO_ONLY = true; // <- true = SSO only, false = per-club keys
const TEST_BASE_URL   = 'https://api.bytomorrow.nl'; // <- vul in
const TEST_API_KEY    = 'M2U5MjgwOGE3OTQ4OTc5YjBkOTBhZmMxMTIwNmMxZTQ4NDc3N2Q4YjJhMTliYzU4NmYzNWRhNzM5MWRiOTkyNQ=='; // <- vul in (zonder "Bearer ")
/** ========================= **/

interface ApiRequestParams {
  limit?: number;
  after?: number; // LET OP: volgens spec is 'after' een ID voor paginatie, geen offset
  sort?: 'id' | 'title' | 'duration';
  sort_type?: 'asc' | 'desc';
  search?: string;
  ids?: string;
  tags?: string;           // comma-delimited string
  email_address?: string;
}

type JumpArrayResponse<T> = T[];
type JumpWrappedResponse<T> = { data: T[]; meta?: any };

function parseJumpResponse<T>(json: any): { data: T[]; meta?: any } {
  if (Array.isArray(json)) return { data: json as T[] };
  if (json && Array.isArray(json.data)) return { data: json.data as T[], meta: json.meta };
  return { data: [], meta: undefined };
}

function toTagsArray(tags: any): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags.trim().length) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

export class ApiService {
  // Optionele runtime override i.p.v. consts bovenin:
  private static overrideBaseUrl?: string;
  private static overrideApiKey?: string;

  /** Programmatic configure (optioneel) */
  static configure(opts: { baseUrl?: string; apiKey?: string }) {
    this.overrideBaseUrl = opts.baseUrl ?? this.overrideBaseUrl;
    this.overrideApiKey  = opts.apiKey  ?? this.overrideApiKey;
  }

  /** Huidige baseUrl/apiKey resolver (neemt test-config als USE_TEST_CONFIG = true) */
  private static getBaseAndKey(club?: Club): { baseUrl: string; apiKey: string } {
    if (USE_TEST_CONFIG) {
      if (!/^https?:\/\//i.test(TEST_BASE_URL)) throw new Error(`Invalid TEST_BASE_URL "${TEST_BASE_URL}"`);
      if (!TEST_API_KEY) throw new Error('TEST_API_KEY is empty');
      return { baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY };
    }
    if (this.overrideBaseUrl && this.overrideApiKey) {
      return { baseUrl: this.overrideBaseUrl, apiKey: this.overrideApiKey };
    }
    if (!club?.baseUrl || !/^https?:\/\//i.test(club.baseUrl)) {
      throw new Error(`Invalid club.baseUrl "${club?.baseUrl}"`);
    }
    if (!club?.jumpKey) {
      throw new Error('club.jumpKey is empty');
    }
    return { baseUrl: club.baseUrl, apiKey: club.jumpKey };
  }

  private static async makeRequest<T>(
    baseUrl: string,
    endpoint: string,
    apiKey: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): Promise<T> {
    try {
      const url = new URL(`${baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, String(value));
          }
        });
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          // Belangrijk: GEEN 'Bearer '
          Authorization: apiKey,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }

      const json = await res.json();
      return json as T;
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('❌ API Service Error:', {
        endpoint,
        name: err?.name,
        message: msg,
        cause: err?.cause,
      });
      // TypeError: Failed to fetch = CORS/Netwerk/SSL
      throw new Error(`Failed to fetch from ${endpoint}: ${msg}`);
    }
  }

  // === Mapping helpers ===

  private static mapAssetToVideo(asset: any, clubLike: { logo?: string }): Video {
    const tagsArray = toTagsArray(asset.tags);
    const thumb =
      asset.thumbnail ||
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop';

    // Use embed_url if available, otherwise convert watch URL to embed URL
    let videoUrl = asset.embed_url || asset.url;
    
    // Convert watch URL to embed URL if needed
    if (videoUrl && videoUrl.includes('/watch/') && !videoUrl.includes('/watch-embed/')) {
      videoUrl = videoUrl.replace('/watch/', '/watch-embed/');
      // Add embed parameters with authentication token
      videoUrl += videoUrl.includes('?') ? '&' : '?';
      videoUrl += 'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1';
    }
    
    // Ensure existing embed URLs have et token
    if (videoUrl && videoUrl.includes('/watch-embed/') && !videoUrl.includes('et=')) {
      videoUrl += videoUrl.includes('?') ? '&' : '?';
      videoUrl += 'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D';
    }
    const dateObj = asset.creation_date ? new Date(asset.creation_date) : new Date();

    return {
      id: String(asset.id),
      title: asset.title || 'Untitled',
      description: asset.description || '',
      thumbnail: thumb,
      videoUrl,
      duration: typeof asset.duration === 'number' ? asset.duration : undefined,
      date: dateObj.toLocaleDateString('nl-NL'),
      category: tagsArray[0] || 'Video',
      clubLogo: clubLike.logo,
      tags: tagsArray,
      isLive: false,
    };
  }

  private static mapAssetToLiveEvent(asset: any, clubLike: { logo?: string }): LiveEvent {
    const tagsArray = toTagsArray(asset.tags);
    const thumb =
      asset.thumbnail ||
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop';

    // Use embed_url if available, otherwise convert watch URL to embed URL
    let streamUrl = asset.embed_url || asset.url;
    
    // Convert watch URL to embed URL if needed
    if (streamUrl && streamUrl.includes('/watch/') && !streamUrl.includes('/watch-embed/')) {
      streamUrl = streamUrl.replace('/watch/', '/watch-embed/');
      // Add embed parameters for live streams with authentication token
      streamUrl += streamUrl.includes('?') ? '&' : '?';
      streamUrl += 'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1&muted=0';
    }
    
    // Ensure existing embed URLs have et token
    if (streamUrl && streamUrl.includes('/watch-embed/') && !streamUrl.includes('et=')) {
      streamUrl += streamUrl.includes('?') ? '&' : '?';
      streamUrl += 'et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D';
    }

    const start = asset.visible_date || asset.creation_date;

    return {
      id: String(asset.id),
      title: asset.title || 'Live Event',
      description: asset.description || '',
      thumbnail: thumb,
      streamUrl, // embed-URL
      startTime: start,
      endTime: undefined, // niet in spec aanwezig
      isLive: Boolean(asset.is_live), // spec noemt dit niet expliciet; fallback
      category: tagsArray[0] || 'Live',
      clubLogo: clubLike.logo,
      tags: tagsArray,
    };
  }

  // === Endpoints (club-aware of test-config) ===

  static async getUser(
    club: Club | undefined,
    params: { email_address?: string; user_id?: string }
  ): Promise<ApiUser | null> {
    const { baseUrl, apiKey } = this.getBaseAndKey(club);
    const raw = await this.makeRequest<any>(baseUrl, '/v1/get-user', apiKey, params);

    if (raw && typeof raw === 'object' && ('id' in raw || 'email_verified' in raw)) {
      return raw as ApiUser;
    }
    if (raw && raw.user) return raw.user as ApiUser;
    return null;
  }

  static async getOnDemandVideos(
    club: Club | undefined,
    params?: ApiRequestParams
  ): Promise<{ videos: Video[]; meta: ApiResponse<ApiAsset>['meta'] }> {
    const { baseUrl, apiKey } = this.getBaseAndKey(club);
    const json = await this.makeRequest<JumpArrayResponse<any> | JumpWrappedResponse<any>>(
      baseUrl, '/v1/on-demand', apiKey, params
    );
    const { data, meta } = parseJumpResponse<any>(json);
    const videos: Video[] = data.map((asset) => this.mapAssetToVideo(asset, club ?? {}));
    return { videos, meta };
  }

  static async getLiveEvents(
    club: Club | undefined,
    params?: ApiRequestParams
  ): Promise<{ events: LiveEvent[]; meta: ApiResponse<ApiAsset>['meta'] }> {
    const { baseUrl, apiKey } = this.getBaseAndKey(club);
    const json = await this.makeRequest<JumpArrayResponse<any> | JumpWrappedResponse<any>>(
      baseUrl, '/v1/live-events', apiKey, params
    );
    const { data, meta } = parseJumpResponse<any>(json);
    const events: LiveEvent[] = data.map((asset) => this.mapAssetToLiveEvent(asset, club ?? {}));
    return { events, meta };
  }

  static async getShortVideos(
    club: Club | undefined,
    params?: Omit<ApiRequestParams, 'tags'>
  ): Promise<{ videos: Video[]; meta: ApiResponse<ApiAsset>['meta'] }> {
    const { baseUrl, apiKey } = this.getBaseAndKey(club);
    const json = await this.makeRequest<JumpArrayResponse<any> | JumpWrappedResponse<any>>(
      baseUrl, '/v1/on-demand', apiKey, { ...params, tags: 'short' }
    );
    const { data, meta } = parseJumpResponse<any>(json);
    const videos: Video[] = data.map((asset) => this.mapAssetToVideo(asset, club ?? {}));
    return { videos, meta };
  }

  static async getStandardVideos(
    club: Club | undefined,
    params?: Omit<ApiRequestParams, 'tags'>
  ): Promise<{ videos: Video[]; meta: ApiResponse<ApiAsset>['meta'] }> {
    const { baseUrl, apiKey } = this.getBaseAndKey(club);
    const json = await this.makeRequest<JumpArrayResponse<any> | JumpWrappedResponse<any>>(
      baseUrl, '/v1/on-demand', apiKey, { ...params, tags: 'h-video' }
    );
    const { data, meta } = parseJumpResponse<any>(json);
    const videos: Video[] = data.map((asset) => this.mapAssetToVideo(asset, club ?? {}));
    return { videos, meta };
  }

  static async getShortVideosAcrossClubs(
    clubs: Club[],
    limit: number = 20
  ): Promise<Video[]> {
    // In test-modus gebruikt hij TEST_BASE/KEY en negeert club-keys
    const validClubs = USE_TEST_CONFIG ? [{} as Club] : clubs.filter(c => c.baseUrl && c.jumpKey);
    const perClub = Math.max(1, Math.ceil(limit / Math.max(1, validClubs.length)));

    const fetches = validClubs.map(async (club) => {
      try {
        const { videos } = await this.getShortVideos(club, { limit: perClub });
        return videos;
      } catch (error) {
        console.error(`Failed to fetch short videos for club`, error);
        return [];
      }
    });

    const results = await Promise.all(fetches);
    const all = results.flat();

    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  static async getStandardVideosAcrossClubs(
    clubs: Club[],
    limit: number = 20
  ): Promise<Video[]> {
    const validClubs = USE_TEST_CONFIG ? [{} as Club] : clubs.filter(c => c.baseUrl && c.jumpKey);
    const perClub = Math.max(1, Math.ceil(limit / Math.max(1, validClubs.length)));

    const fetches = validClubs.map(async (club) => {
      try {
        const { videos } = await this.getStandardVideos(club, { limit: perClub });
        return videos;
      } catch (error) {
        console.error(`Failed to fetch standard videos for club`, error);
        return [];
      }
    });

    const results = await Promise.all(fetches);
    const all = results.flat();

    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  static async getClubContent(
    club: Club | undefined,
    params?: ApiRequestParams
  ): Promise<{ videos: Video[]; liveEvents: LiveEvent[] }> {
    const [videosResult, eventsResult] = await Promise.allSettled([
      this.getOnDemandVideos(club, params),
      this.getLiveEvents(club, params),
    ]);
    const videos =
      videosResult.status === 'fulfilled' ? videosResult.value.videos : [];
    const liveEvents =
      eventsResult.status === 'fulfilled' ? eventsResult.value.events : [];
    return { videos, liveEvents };
  }

  /** ====== SNELLE TESTHELPERS ======
   *  Deze kun je in je UI of in de browserconsole aanroepen.
   */

  // Eenvoudige ping: haalt 1 on-demand item op (zonder tagfilter)
  static async testPing() {
    const { baseUrl } = this.getBaseAndKey(undefined);
    console.log('🔎 testPing →', baseUrl);
    const out = await this.getOnDemandVideos(undefined, { limit: 1 });
    console.log('✅ testPing OK:', out);
    return out;
  }

  // Haal explicit "h-video" (standaard video) op
  static async getOnDemandVideosTest() {
    const { baseUrl } = this.getBaseAndKey(undefined);
    console.log('🎬 getOnDemandVideosTest →', baseUrl);
    const out = await this.getStandardVideos(undefined, { limit: 5 });
    console.log('✅ getOnDemandVideosTest OK:', out);
    return out;
  }

  // Haal explicit "short" op
  static async getShortVideosTest() {
    const { baseUrl } = this.getBaseAndKey(undefined);
    console.log('🎬 getShortVideosTest →', baseUrl);
    const out = await this.getShortVideos(undefined, { limit: 5 });
    console.log('✅ getShortVideosTest OK:', out);
    return out;
  }

  // Haal live events op
  static async getLiveEventsTest() {
    const { baseUrl } = this.getBaseAndKey(undefined);
    console.log('📺 getLiveEventsTest →', baseUrl);
    const out = await this.getLiveEvents(undefined, { limit: 5 });
    console.log('✅ getLiveEventsTest OK:', out);
    return out;
  }
}
