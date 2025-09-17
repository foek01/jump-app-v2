export interface Club {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  logo: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  jumpKey?: string;
  baseUrl?: string;
}

// API Types
export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiAsset {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
  video_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_live?: boolean;
  live_start_time?: string;
  live_end_time?: string;
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
  };
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl?: string;
  media_id?: string;
  duration?: number;
  date: string;
  category?: string;
  clubLogo?: string;
  tags?: string[];
  isLive?: boolean;
}

export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  streamUrl?: string;
  startTime: string;
  endTime?: string;
  isLive: boolean;
  category?: string;
  clubLogo?: string;
  tags?: string[];
}