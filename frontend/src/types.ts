export interface Player {
  id?: number;
  username: string;
  display_name?: string;
  profile_image_url?: string;
  map_marker_color?: string;
  score?: number;
  checkins?: number;
  home_district?: string;
  home_district_code?: string;
  home_district_name?: string;
  attack_points?: number;
  defend_points?: number;
  attack_ratio?: number;
  defend_ratio?: number;
  is_active?: boolean;
}

export interface District {
  code: string;
  name: string;
  is_active?: boolean;
  strength?: number;
  defended?: number;
  attacked?: number;
  checkins?: number;
}

export interface PartyMember {
  username: string;
  display_name?: string;
  is_leader?: boolean;
  is_self?: boolean;
}

export interface Party {
  code: string;
  name?: string;
  leader?: string;
  members?: PartyMember[];
  size?: number;
  attack_multiplier?: number;
  contribution_multiplier?: number;
  attack_points?: number;
  contribution_points?: number;
  score?: number;
  active_district_code?: string;
  active_district_name?: string;
  active_district_count?: number;
  boost_ready?: boolean;
  expires_at?: string | number | null;
  seconds_remaining?: number | null;
}

export interface LeaderboardEntry {
  username?: string;
  display_name?: string;
  score?: number;
  attack_points?: number;
  defend_points?: number;
  checkins?: number;
  home_district_code?: string;
  home_district_name?: string;
  rank?: number;
}

export interface LeaderboardDistrictEntry {
  id?: string;
  name?: string;
  strength?: number;
  defended?: number;
  attacked?: number;
  checkins?: number;
  rank?: number;
}

export interface LeaderboardPayload {
  players: LeaderboardEntry[];
  districts: LeaderboardDistrictEntry[];
}

export interface ApiConfig {
  appVersion?: string;
  appSnapshot?: string;
  apiBaseUrl?: string;
  staticUrl?: string;
  links?: {
    home?: string;
    leaderboard?: string;
    create_account?: string;
  };
}
