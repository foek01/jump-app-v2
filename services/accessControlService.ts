// Access Control Service
export interface VideoAccessInfo {
  canAccess: boolean;
  accessType: 'public' | 'login' | 'premium' | 'club';
  requiresLogin: boolean;
  isFree: boolean;
  reason: string;
  showLock: boolean;
}

export interface UserInfo {
  isAuthenticated: boolean;
  email?: string;
  clubPermissions: string[];
  pricePlans: number[];
}

export interface VideoInfo {
  id: string;
  privacy?: 'public' | 'private' | 'premium';
  is_free?: boolean;
  login_required?: boolean;
  clubId?: string;
  tags?: string[];
}

export class AccessControlService {
  /**
   * Check if user has access to a video
   */
  static checkVideoAccess(video: VideoInfo, user: UserInfo): VideoAccessInfo {
    // Premium content should never reach here (filtered out in VideoProvider)
    if (video.privacy === 'premium' || video.is_free === false) {
      if (__DEV__) {
        console.warn('⚠️ Premium content should be filtered out in VideoProvider:', video.id);
      }
      return {
        canAccess: false,
        accessType: 'premium',
        requiresLogin: true,
        isFree: false,
        reason: 'Premium content should be hidden',
        showLock: false, // Don't show lock, should be hidden completely
      };
    }
    
    // Default values - if no access control fields are specified, assume public
    const isPublic = video.privacy === 'public' || video.privacy === undefined;
    const isFree = video.is_free !== false; // Default to true if not specified
    const requiresLogin = video.login_required === true;
    
    if (__DEV__) {
      console.log('🔍 Access Control Debug:', {
        videoId: video.id,
        privacy: video.privacy,
        is_free: video.is_free,
        login_required: video.login_required,
        computed: { isPublic, isFree, requiresLogin },
        userAuthenticated: user.isAuthenticated
      });
    }
    
    // Public and free content - always accessible
    if (isPublic && isFree && !requiresLogin) {
      return {
        canAccess: true,
        accessType: 'public',
        requiresLogin: false,
        isFree: true,
        reason: 'Publieke content',
        showLock: false,
      };
    }

    // User not authenticated - show lock for protected content
    if (!user.isAuthenticated) {
      if (requiresLogin || !isFree || video.privacy === 'private') {
        return {
          canAccess: false,
          accessType: requiresLogin || video.privacy === 'private' ? 'login' : 'premium',
          requiresLogin: true,
          isFree,
          reason: 'Login vereist',
          showLock: true,
        };
      }
    }

    // User is authenticated
    if (user.isAuthenticated) {
      // Check club access
      if (video.clubId && user.clubPermissions.includes(video.clubId)) {
        return {
          canAccess: true,
          accessType: 'club',
          requiresLogin: true,
          isFree,
          reason: 'Club toegang',
          showLock: false,
        };
      }

      // Check premium content
      if (!isFree && user.pricePlans.length === 0) {
        return {
          canAccess: false,
          accessType: 'premium',
          requiresLogin: true,
          isFree: false,
          reason: 'Premium abonnement vereist',
          showLock: true,
        };
      }

      // Authenticated user with free content
      if (isFree) {
        return {
          canAccess: true,
          accessType: 'login',
          requiresLogin: true,
          isFree: true,
          reason: 'Ingelogde gebruiker',
          showLock: false,
        };
      }
    }

    // Default: if we get here and content is free, allow access
    if (isFree && isPublic) {
      return {
        canAccess: true,
        accessType: 'public',
        requiresLogin: false,
        isFree: true,
        reason: 'Publieke content',
        showLock: false,
      };
    }
    
    // Final fallback: no access
    return {
      canAccess: false,
      accessType: 'login',
      requiresLogin: true,
      isFree,
      reason: user.isAuthenticated ? 'Geen toegang tot dit content' : 'Login vereist',
      showLock: true,
    };
  }

  /**
   * Get access type for display purposes
   */
  static getAccessTypeDisplay(accessInfo: VideoAccessInfo): string {
    switch (accessInfo.accessType) {
      case 'public':
        return '🌍 Publiek';
      case 'login':
        return '🔐 Login vereist';
      case 'premium':
        return '👑 Premium';
      case 'club':
        return '🏆 Club';
      default:
        return '❓ Onbekend';
    }
  }

  /**
   * Check if video should show lock overlay
   */
  static shouldShowLock(video: VideoInfo, user: UserInfo): boolean {
    const access = this.checkVideoAccess(video, user);
    return access.showLock;
  }

  /**
   * Get lock type for overlay
   */
  static getLockType(video: VideoInfo, user: UserInfo): 'login' | 'premium' | 'club' {
    const access = this.checkVideoAccess(video, user);
    
    if (access.accessType === 'premium') return 'premium';
    if (access.accessType === 'club') return 'club';
    return 'login';
  }
}
