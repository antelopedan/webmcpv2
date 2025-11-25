
// types.ts

export type View = 'Home' | 'Brands' | 'Analytics' | 'Reports' | 'Settings';

// START: Brands Page API Types
export type BrandStatus = 'updated' | 'syncing' | 'error' | 'pending';
export type SocialPlatform =
  | 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'website';

// The API returns this shape for a social profile
export interface SocialProfile { 
  id: string; 
  platform: SocialPlatform; 
  profile_url: string; 
  username?: string | null;
  created_at: string; 
  last_synced_at?: string | null 
}

// The API returns this shape for a brand
export interface ApiBrand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  social_profiles: SocialProfile[];
  status: BrandStatus;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

// App-specific brand type with UI state
export type Brand = ApiBrand & { isLoading?: boolean };

// Payloads for creating/updating brands
export interface SocialProfileCreate { platform: SocialPlatform; profile_url: string; username?: string | null }
export interface BrandCreate { name: string; logo_url?: string | null; social_profiles: SocialProfileCreate[] }
export interface BrandUpdate { name?: string; description?: string | null; logo_url?: string | null; social_profiles?: SocialProfileCreate[] }

type SPOpAdd = { op: 'add'; platform: SocialPlatform; profile_url: string; username?: string | null };
type SPOpUpdate = { op: 'update'; id: string; platform?: SocialPlatform; profile_url?: string; username?: string | null };
type SPOpRemove = { op: 'remove'; id: string };
export type SocialProfilePatchOperation = SPOpAdd | SPOpUpdate | SPOpRemove;
export interface BrandPatch { name?: string | null; description?: string | null; logo_url?: string | null; social_profiles?: SocialProfilePatchOperation[] }

export interface BrandListResponse {
  brands: ApiBrand[];
  total: number;
  skip: number;
  limit: number;
}

export interface BrandStats {
  total_brands: number;
  total_accounts: number;
  total_content: number;
  total_engagements: number;
  total_followers: number;
  total_views: number;
}
// END: Brands Page API Types

// Analytics Page Types
export interface AnalyticsPost {
  id: string;
  brand_name: string;
  content: string;
  engagement_count: number;
  views: number;
  engagement_rate: number;
  [key: string]: any; // for sorting
}

export interface AnalyticsMetrics {
  brands_analyzed: number;
  total_posts: number;
  engagements: number;
  total_views: number;
  avg_engagement_rate: number;
}

export interface PlatformEngagement {
  platform: string;
  engagement_count: number;
}

export interface PostTypeDistribution {
  post_type: string;
  count: number;
}

export interface BrandPostVolumeEngagement {
  brand_name: string;
  post_count: number;
  engagement_count: number;
}

export interface FollowerGrowthTrend {
  dates: string[];
  brands: {
    brand_name: string;
    data_points: number[];
  }[];
}

// Settings Page Types
export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: string;
}

export interface ConnectedAccount {
    platform: string;
    username: string;
}

export interface ConnectedAccountsResponse {
    connected: ConnectedAccount[];
    available: { platform: string }[];
}

export interface WorkspaceSettings {
  brand_name: string;
  industry: string;
  website_url: string;
  competitors: string[];
}

export interface McpServerSettings {
  server_url: string;
  api_key_masked: string;
}

export interface PrivacySettings {
  historical_data_days: number;
  refresh_frequency_hours: number;
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    response_time_ms: number | null;
}

export type OptionItem = { id: string; key: string; label: string };

export type SettingsOptionsResponse = {
  roles: OptionItem[];
  industries: OptionItem[];
};

// Reports Page Types

export interface BrandDisplayItem {
  id: number;
  type: 'logo' | 'separator';
  name: string;
  logo?: string; // Some API responses use 'logo'
  url?: string;  // Some API responses use 'url'
}

export interface ReportBrandsConfig {
  heading?: string;
  subheading?: string;
  display: BrandDisplayItem[];
}

export interface Report {
  id: number;
  component_category: string;
  headline: string | null;
  explanation: string | null;
  report_url: string;
  brands: ReportBrandsConfig | null;
}


// Home Page Types
export interface HomeStats {
  analyses_run_this_week: number;
  active_users: number;
  avg_rating: number;
}

export interface AnalysisTemplate {
  id: number;
  name: string;
  description: string;
  prompt: string;
  category: string;
  estimated_time_minutes: number;
}

export interface SampleReport {
  id: number;
  component_category: string;
  headline: string | null;
  explanation: string | null;
  report_url: string;
  brands: ReportBrandsConfig | null;
}

export interface TemplatesResponse {
  templates: AnalysisTemplate[];
  sample_reports: SampleReport[];
}

// User type from /users/me
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  first_name: string;
  last_name: string;
}
