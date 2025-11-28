import axios from 'axios';
import { getCsrfToken } from './csrf';

let apiBaseUrl = '/api';

export function setApiBaseUrl(value) {
  if (typeof value === 'string' && value.trim()) {
    apiBaseUrl = value.trim().replace(/\/+$/, '');
    apiClient.defaults.baseURL = apiBaseUrl;
  }
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') {
    const token = getCsrfToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

export const apiEndpoints = {
  configHome: '/pages/home/',
  configLeaderboard: '/pages/leaderboard/',
  session: {
    login: '/session/login/',
    logout: '/session/logout/',
    current: '/session/'
  },
  players: '/players/',
  checkins: '/checkins/',
  charge: '/checkins/charge/',
  districts: {
    catalog: '/districts/catalog/',
    strategy: '/districts/strategy/',
    activity: (code) => `/districts/${encodeURIComponent(code)}/activity/`
  },
  friends: '/friends/',
  friendRequests: '/friend-requests/',
  party: {
    root: '/party/',
    namePreference: '/party/name-preference/',
    invite: '/party/invite/',
    invitationDetail: (id) => `/party/invitations/${id}/`,
    join: '/party/join/',
    joinRequestDetail: (id) => `/party/join-requests/${id}/`,
    profile: (code) => `/party/${encodeURIComponent(code)}/profile/`,
    highlights: (username) => `/players/${encodeURIComponent(username)}/party-highlights/`
  },
  leaderboard: '/leaderboard/'
};

export function normaliseError(error) {
  if (!error) {
    return { message: 'Unknown error' };
  }
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.detail || 'Request failed',
      data: error.response.data
    };
  }
  if (error.message) {
    return { message: error.message };
  }
  return { message: 'Request failed' };
}
