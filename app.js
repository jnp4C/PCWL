'use strict';

let players = {};
let currentUser = null;

const findMeButton = document.getElementById('find-me-button');
const districtsToggle = document.getElementById('districts-toggle');
const parksToggle = document.getElementById('parks-toggle');
const urbanToggle = document.getElementById('urban-toggle');
const cyclingToggle = document.getElementById('cycling-toggle');
const basemapSlider = document.getElementById('basemap-slider');

const mapContainer = document.getElementById('map');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const rememberPasswordInput = document.getElementById('remember-password-input');
const passwordInput = document.getElementById('password-input');
const knownPlayersSection = document.getElementById('known-players');
const knownPlayersList = document.getElementById('known-players-list');
const checkInButton = document.getElementById('check-in-button');
const clearHistoryButton = document.getElementById('clear-history-button');
const playerUsernameLabel = document.getElementById('player-username');
const playerPointsLabel = document.getElementById('player-points');
const playerCheckinsLabel = document.getElementById('player-checkins-count');
const checkinList = document.getElementById('checkin-list');
const setHomeDistrictButton = document.getElementById('set-home-district-button');
const homeDistrictValue = document.getElementById('home-district-value');
const homePresenceIndicator = document.getElementById('home-presence-indicator');
const attackDefendRatioLabel = document.getElementById('player-ad-ratio');
const chargeAttackButton = document.getElementById('charge-attack-button');
const devOptionsContainer = document.getElementById('dev-options');
const devSkipCooldownCheckbox = document.getElementById('dev-skip-cooldown');
const devChangeUserButton = document.getElementById('dev-change-user');
const devClearUsersButton = document.getElementById('dev-clear-users');
const cooldownStrip = document.getElementById('cooldown-strip');
const homeDistrictModal = document.getElementById('home-district-modal');
const homeDistrictModalOverlay = document.getElementById('home-district-modal-overlay');
const homeDistrictModalCloseButton = document.getElementById('home-district-modal-close');
const homeDistrictSearchInput = document.getElementById('home-district-search');
const homeDistrictListElement = document.getElementById('home-district-list');
const homeDistrictConfirmButton = document.getElementById('home-district-confirm');
const homeDistrictCancelButton = document.getElementById('home-district-cancel');
const drawerToggleButton = document.getElementById('drawer-toggle');
const drawerCloseButton = document.getElementById('drawer-close');
const drawerOverlay = document.getElementById('drawer-overlay');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerHomeSelect = document.getElementById('drawer-home-select');
const drawerHomeSaveButton = document.getElementById('drawer-home-save');
const drawerPlayerUsernameSummary = document.getElementById('drawer-player-username');
const drawerAdRatioSummary = document.getElementById('drawer-ad-ratio-summary');
const drawerHomeStrengthSummary = document.getElementById('drawer-home-strength');
const drawerHomeSummary = document.getElementById('drawer-home-summary');
const drawerLocationSummary = document.getElementById('drawer-location-summary');
const recentCheckinsDrawer = document.getElementById('recent-checkins-drawer');
const recentCheckinsContent = document.getElementById('recent-checkins-content');
const recentCheckinsOverlay = document.getElementById('recent-checkins-overlay');
const recentCheckinsCloseButton = document.getElementById('recent-checkins-close');
const recentCheckinsList = document.getElementById('recent-checkins-list');
const recentCheckinsToggleButton = document.getElementById('recent-checkins-toggle');
const recentCheckinsEmptyState = document.getElementById('recent-checkins-empty');
const mobileFindMeButton = document.getElementById('mobile-find-me-button');
const mobileCheckInButton = document.getElementById('mobile-checkin-button');
const drawerCheckinButton = document.getElementById('drawer-checkin-button');
const drawerLogoutButton = document.getElementById('drawer-logout-button');
const drawerThemeToggleButton = document.getElementById('drawer-theme-toggle');
const drawerLeaderboardLink = document.getElementById('drawer-leaderboard');
const profileImageUrlInput = document.getElementById('profile-image-url-input');
const profileImagePreview = document.getElementById('profile-image-preview');
const profileImageSaveButton = document.getElementById('profile-image-save');
const profileImageClearButton = document.getElementById('profile-image-clear');
const profileImageFeedback = document.getElementById('profile-image-feedback');
const markerColorInput = document.getElementById('marker-color-input');
const markerColorResetButton = document.getElementById('marker-color-reset');
const markerColorFeedback = document.getElementById('marker-color-feedback');
const recentCheckinTagPrimary = document.getElementById('recent-checkin-1');
const currentUserTag = document.getElementById('current-user-tag');
const settingsButton = document.getElementById('settings-button');
const friendsButton = document.getElementById('friends-button');
const districtButton = document.getElementById('district-button');
const characterDrawer = document.getElementById('character-drawer');
const characterOverlay = document.getElementById('character-overlay');
const characterCloseButton = document.getElementById('character-close');
const characterContent = document.getElementById('character-content');
const characterAvatarInitial = document.getElementById('character-avatar-initial');
const characterNameLabel = document.getElementById('character-name');
const characterTagline = document.getElementById('character-tagline');
const characterPointsValue = document.getElementById('character-points');
const characterLevelValue = document.getElementById('character-level');
const characterCheckinsValue = document.getElementById('character-checkins');
const characterAttackDefendValue = document.getElementById('character-ad');
const characterChargeValue = document.getElementById('character-charge');
const characterCooldownValue = document.getElementById('character-cooldown');
const characterInteractionsList = document.getElementById('character-interactions-list');
const characterInteractionsEmpty = document.getElementById('character-interactions-empty');
const friendsDrawer = document.getElementById('friends-drawer');
const friendsOverlay = document.getElementById('friends-overlay');
const friendsCloseButton = document.getElementById('friends-close');
const friendsContent = document.getElementById('friends-content');
const friendsListContainer = document.getElementById('friends-list');
const friendsEmptyState = document.getElementById('friends-empty');
const friendsInviteButton = document.getElementById('friends-invite-button');
const friendsManageButton = document.getElementById('friends-manage-button');
const friendsManagePanel = document.getElementById('friends-manage-panel');
const friendSearchForm = document.getElementById('friend-search-form');
const friendSearchInput = document.getElementById('friend-search-input');
const friendSearchButton = document.getElementById('friend-search-button');
const friendSearchResults = document.getElementById('friend-search-results');
const friendSearchFeedback = document.getElementById('friend-search-feedback');
const friendManageList = document.getElementById('friend-manage-list');
const friendManageCloseButton = document.getElementById('friend-manage-close');
const friendSearchDirect = document.getElementById('friend-search-direct');
const friendSearchAddDirectButton = document.getElementById('friend-search-add-direct');
const friendRequestsPanel = document.getElementById('friend-requests-panel');
const friendRequestsFeedback = document.getElementById('friend-requests-feedback');
const friendRequestsIncomingList = document.getElementById('friend-requests-incoming');
const friendRequestsOutgoingList = document.getElementById('friend-requests-outgoing');
const friendRequestsIncomingEmpty = document.getElementById('friend-requests-incoming-empty');
const friendRequestsOutgoingEmpty = document.getElementById('friend-requests-outgoing-empty');
const districtDrawer = document.getElementById('district-drawer');
const districtOverlay = document.getElementById('district-overlay');
const districtCloseButton = document.getElementById('district-close');
const districtContent = document.getElementById('district-content');
const districtHomeNameValue = document.getElementById('district-home-name');
const districtContributionValue = document.getElementById('district-contribution');
const districtRecentActivityValue = document.getElementById('district-recent-activity');
const districtPerformanceBlurb = document.getElementById('district-performance-blurb');
const districtCheckinsCountValue = document.getElementById('district-checkins-count');
const districtLastContestedValue = document.getElementById('district-last-contested');
const districtControlStatusValue = document.getElementById('district-control-status');
const districtLeaderboardContainer = document.getElementById('district-leaderboard');
const districtLeaderboardEmpty = document.getElementById('district-leaderboard-empty');
const districtLeaderboardAggressive = document.getElementById('district-leaderboard-aggressive');
const districtLeaderboardSupport = document.getElementById('district-leaderboard-support');
const districtTargetValue = document.getElementById('district-target-value');
const districtThreatValue = document.getElementById('district-threat-value');
if (currentUserTag) {
  updateCurrentUserTag(null);
}
updateCharacterDrawerContent(null);

const APP_VERSION =
  typeof window !== 'undefined' && window.__APP_VERSION__
    ? String(window.__APP_VERSION__).trim()
    : 'dev';
const APP_SNAPSHOT =
  typeof window !== 'undefined' && window.__APP_SNAPSHOT__
    ? String(window.__APP_SNAPSHOT__).trim()
    : 'app.js';

if (typeof document !== 'undefined' && document.body) {
  document.body.classList.add('welcome-active');
  document.body.classList.remove('game-active');
}

const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const statusBox = document.getElementById('status');
const poiList = document.getElementById('poi-list');

const MAP_CENTER = [14.4205, 50.0875];
const MAP_STYLE = {
  version: 8,
  name: 'Prague 3D',
  sources: {},
  layers: [],
};

const STATIC_PREFIX =
  typeof window !== 'undefined' && window.__STATIC_URL__
    ? window.__STATIC_URL__
    : '';
const DATA_PREFIX = `${STATIC_PREFIX}data/`;
const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };
const STATIC_DATASETS = {
  'prague-boundary': { topo: 'prague-boundary.topo.json', object: 'boundary', fallback: 'prague-boundary.geojson' },
  'prague-building-polygons': {
    topo: 'prague-building-polygons.topo.json',
    object: 'buildings',
    fallback: 'prague-building-polygons.geojson',
  },
  'prague-districts': { topo: 'prague-districts.topo.json', object: 'districts', fallback: 'prague-districts.geojson' },
  'prague-parks': { topo: 'prague-parks.topo.json', object: 'parks', fallback: 'prague-parks.geojson' },
  'urban-planning': { topo: 'urban-planning.topo.json', object: 'urban', fallback: 'urban-planning.geojson' },
  'prague-streets': { topo: 'prague-streets.topo.json', object: 'streets', fallback: 'prague-streets.geojson' },
  'prague-cycling-routes': {
    topo: 'prague-cycling-routes.topo.json',
    object: 'cycling',
    fallback: 'prague-cycling-routes.geojson',
  },
};
const STATIC_DATA_CACHE = {};
const DISTRICT_GLOW_DEFAULT_COLOR = '#8f76e6';
const DISTRICT_GLOW_HOME_COLOR_LIGHT = '#176f3c';
const DISTRICT_GLOW_HOME_COLOR_DARK = '#c7ff5a';
const DISTRICT_GLOW_ENEMY_COLOR_LIGHT = '#d12e5d';
const DISTRICT_GLOW_ENEMY_COLOR_DARK = '#ff4d6d';
const DISTRICT_GLOW_LINE_WIDTH = 4.5;
const DISTRICT_GLOW_GLOW_WIDTH = 22;
const DISTRICT_GLOW_GLOW_BLUR = 14;
const DISTRICT_GLOW_GLOW_OPACITY = 0.86;
const DISTRICT_FILTER_NONE = ['==', ['literal', 0], 1];
const DISTRICT_ID_FIELDS = ['kod_mc', 'KOD_MC', 'kod_uzohmp', 'KOD_UZOHMP', 'objectid', 'OBJECTID'];
const MAP_THEME_SETTINGS = {
  light: {
    background: '#f3f4fb',
    maskFill: '#f9f9fd',
    maskOpacity: 0.5,
    districtFill: '#9f9be9',
    districtOpacity: 0.18,
    buildingColor: '#d6cbff',
    buildingOutline: '#8f76e6',
  },
  dark: {
    background: '#0f0620',
    maskFill: '#140a2d',
    maskOpacity: 0.72,
    districtFill: '#2f1b4a',
    districtOpacity: 0.32,
    buildingColor: '#8b6cff',
    buildingOutline: '#6557b8',
  },
};

const DISTRICT_BASE_SCORE = 2000;
const DISTRICT_SCORES_STORAGE_KEY = 'pragueExplorerDistrictScores';
const POINTS_PER_CHECKIN = 10;
const MAX_HISTORY_ITEMS = 15;

const TREE_GIF_URL = resolveDataUrl('tree.gif?v=2');
const HITMARKER_GIF_URL = resolveDataUrl('attack_hitmarker.gif?v=1');
const DEFEND_HITMARKER_GIF_URL = resolveDataUrl('defend_hitmarker.gif?v=1');
const MOBILE_CONTEXT_MENU_LONG_PRESS_MS = 650;
const MOBILE_CONTEXT_MENU_MOVE_THRESHOLD = 18;
const DEFAULT_MARKER_COLOR = '#6366f1';
const MARKER_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6})$/;
const FRIEND_LOCATIONS_SOURCE_ID = 'friend-locations';
const FRIEND_LOCATIONS_LAYER_ID = 'friend-locations';
const FRIEND_LOCATIONS_GLOW_LAYER_ID = 'friend-locations-glow';
const API_BASE_URL = '/api';
const CSRF_HEADER_NAME = 'X-CSRFToken';
let friendLocationsGeoJson = { type: 'FeatureCollection', features: [] };

function buildApiUrl(path) {
  if (!path) {
    return API_BASE_URL;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${trimmed}`;
}

function getCookie(name) {
  if (typeof document === 'undefined' || !name) {
    return null;
  }
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed) {
      continue;
    }
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

function getCsrfToken() {
  return getCookie('csrftoken');
}

async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body = undefined,
    headers = {},
    credentials = 'same-origin',
    signal,
  } = options;

  if (isFileOrigin()) {
    const error = new Error('API calls are unavailable when the app is opened from the file:// protocol. Please start a local server (e.g., python3 -m http.server) and open via http://localhost.');
    error.code = 'UNSUPPORTED_PROTOCOL';
    throw error;
  }

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  const requestInit = {
    method,
    headers: requestHeaders,
    credentials,
    signal,
  };

  if (body !== undefined) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    if (!requestHeaders[CSRF_HEADER_NAME]) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        requestHeaders[CSRF_HEADER_NAME] = csrfToken;
      }
    }
  }

  let response;
  try {
    response = await fetch(buildApiUrl(path), requestInit);
  } catch (networkError) {
    const error = new Error('Network request failed.');
    error.cause = networkError;
    throw error;
  }

  const contentType = response.headers.get('Content-Type') || '';
  let parsedBody = null;
  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      try {
        parsedBody = await response.json();
      } catch (parseError) {
        parsedBody = null;
      }
    } else {
      parsedBody = await response.text();
    }
  }

  if (!response.ok) {
    const detail =
      parsedBody && typeof parsedBody === 'object' && parsedBody.detail
        ? parsedBody.detail
        : `Request failed with status ${response.status}`;
    const error = new Error(detail);
    error.status = response.status;
    error.data = parsedBody;
    throw error;
  }

  return parsedBody;
}

let activeTheme = 'light';
if (typeof window !== 'undefined') {
  if (window.__pragueExplorerTheme === 'dark') {
    activeTheme = 'dark';
  } else if (document.body && document.body.getAttribute('data-theme') === 'dark') {
    activeTheme = 'dark';
  }
}

function resolveDataUrl(filename) {
  return `${DATA_PREFIX}${filename}`;
}

function loadStaticDataset(datasetKey) {
  if (STATIC_DATA_CACHE[datasetKey]) {
    return STATIC_DATA_CACHE[datasetKey];
  }

  if (typeof fetch !== 'function') {
    STATIC_DATA_CACHE[datasetKey] = Promise.resolve(null);
    return STATIC_DATA_CACHE[datasetKey];
  }

  const config = STATIC_DATASETS[datasetKey] || {};
  if (config.topo && typeof topojson !== 'undefined') {
    STATIC_DATA_CACHE[datasetKey] = fetch(resolveDataUrl(config.topo))
      .then((response) => (response.ok ? response.json() : null))
      .then((topology) => {
        if (!topology || !topology.objects) {
          return null;
        }
        const topoClient = typeof topojson !== 'undefined' ? topojson : null;
        if (!topoClient || typeof topoClient.feature !== 'function') {
          console.error('topojson-client is required to decode topology data.');
          return null;
        }
        const objectName =
          config.object && topology.objects[config.object]
            ? config.object
            : Object.keys(topology.objects)[0];
        if (!objectName) {
          return null;
        }
        const geojson = topoClient.feature(topology, topology.objects[objectName]);
        return geojson && geojson.type ? geojson : null;
      })
      .catch((error) => {
        console.error(`Failed to load topo dataset "${datasetKey}"`, error);
        return null;
      });
  } else {
    const fallbackFile = config.fallback || `${datasetKey}.geojson`;
    STATIC_DATA_CACHE[datasetKey] = fetch(resolveDataUrl(fallbackFile))
      .then((response) => (response.ok ? response.json() : null))
      .catch((error) => {
        console.error(`Failed to load GeoJSON dataset "${datasetKey}"`, error);
        return null;
      });
  }

  return STATIC_DATA_CACHE[datasetKey];
}

function addStaticGeoSource(mapInstance, sourceId, datasetKey, options = {}, onData, lazyOptions = null) {
  const sourceOptions = Object.assign({ type: 'geojson', data: EMPTY_GEOJSON }, options || {});
  mapInstance.addSource(sourceId, sourceOptions);

  const setSourceData = (geojson) => {
    if (!geojson) {
      return;
    }
    const source = typeof mapInstance.getSource === 'function' ? mapInstance.getSource(sourceId) : null;
    if (source && typeof source.setData === 'function') {
      source.setData(geojson);
      if (typeof onData === 'function') {
        onData(geojson);
      }
    }
  };

  const loadData = () => loadStaticDataset(datasetKey).then(setSourceData);

  if (lazyOptions && typeof mapInstance.getZoom === 'function' && typeof mapInstance.on === 'function') {
    const minZoom = Number(lazyOptions.minZoom) || 0;
    const unloadBelow =
      lazyOptions.unloadBelowMinZoom === undefined ? false : Boolean(lazyOptions.unloadBelowMinZoom);
    let loaded = false;
    let pending = null;

    const ensureState = () => {
      const zoom = mapInstance.getZoom();
      if (zoom >= minZoom) {
        if (!loaded) {
          loaded = true;
          if (!pending) {
            pending = loadData().finally(() => {
              pending = null;
            });
          }
        }
      } else if (loaded && unloadBelow) {
        loaded = false;
        const source = typeof mapInstance.getSource === 'function' ? mapInstance.getSource(sourceId) : null;
        if (source && typeof source.setData === 'function') {
          source.setData(EMPTY_GEOJSON);
        }
      }
    };

    mapInstance.on('zoomend', ensureState);
    ensureState();
  } else {
    loadData();
  }
}

const GEOLOCATION_SECURE_CONTEXT_MESSAGE =
  'Geolocation is blocked on insecure connections. Open the app via https:// or http://localhost to enable location.';
const LIVE_LOCATION_WATCH_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 30000,
};
const LIVE_LOCATION_MIN_UPDATE_MS = 5000;

function isSecureOrigin() {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  if (window.isSecureContext) {
    return true;
  }
  const { protocol, hostname } = window.location;
  if (protocol === 'https:') {
    return true;
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  return false;
}

// Returns true when the page is served over http(s) (including http://localhost),
// and false when opened via file:// or other unsupported schemes.
// Be robust to blob:/data:/about:blank wrappers by inspecting referrers/baseURI.
function isHttpLikeOrigin() {
  if (typeof window === 'undefined') return false;
  try {
    const loc = window.location || {};
    const { protocol, hostname } = loc;
    if (protocol === 'http:' || protocol === 'https:') return true;

    // If the document is a blob/data/about:blank created from an http(s) page,
    // consider it http-like based on the referrer or baseURI.
    const base = (typeof document !== 'undefined' && (document.baseURI || document.referrer)) || '';
    if (typeof base === 'string' && (base.startsWith('http://') || base.startsWith('https://'))) {
      return true;
    }

    // As a last resort, treat localhost/127.0.0.1 as http-like in dev.
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  } catch (e) {
    // ignore and fall through
  }
  return false;
}

function isFileOrigin() {
  try {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
  } catch (_) {
    return false;
  }
}

function setGeolocationUiState(isAvailable) {
  if (findMeButton) {
    findMeButton.disabled = !isAvailable;
    findMeButton.title = isAvailable ? '' : GEOLOCATION_SECURE_CONTEXT_MESSAGE;
  }
  if (mobileFindMeButton) {
    if (isAvailable) {
      mobileFindMeButton.removeAttribute('disabled');
      mobileFindMeButton.title = '';
    } else {
      mobileFindMeButton.setAttribute('disabled', 'disabled');
      mobileFindMeButton.title = GEOLOCATION_SECURE_CONTEXT_MESSAGE;
    }
  }
}

function formatCooldownTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatCooldownLabel(actionKey, mode = null) {
  if (actionKey === COOLDOWN_KEYS.DEFEND) {
    return mode === 'remote' ? 'Defend (Remote)' : 'Defend';
  }
  if (actionKey === COOLDOWN_KEYS.CHARGE) {
    return 'Charge';
  }
  return 'Attack';
}

function resolveCooldownColors(actionKey, mode = null) {
  if (actionKey === COOLDOWN_KEYS.DEFEND) {
    if (mode === 'remote') {
      return {
        fill: 'linear-gradient(135deg, rgba(40, 90, 220, 0.65), rgba(90, 140, 255, 0.45))',
        track: 'rgba(40, 90, 220, 0.16)',
        text: 'rgba(230, 240, 255, 0.92)',
      };
    }
    return {
      fill: 'linear-gradient(135deg, rgba(70, 130, 255, 0.68), rgba(120, 170, 255, 0.46))',
      track: 'rgba(70, 130, 255, 0.18)',
      text: 'rgba(226, 237, 255, 0.94)',
    };
  }
  if (actionKey === COOLDOWN_KEYS.CHARGE) {
    return {
      fill: 'linear-gradient(135deg, rgba(155, 105, 255, 0.68), rgba(205, 155, 255, 0.42))',
      track: 'rgba(155, 105, 255, 0.16)',
      text: 'rgba(246, 240, 255, 0.94)',
    };
  }
  return {
    fill: 'linear-gradient(135deg, rgba(236, 35, 74, 0.68), rgba(255, 125, 145, 0.42))',
    track: 'rgba(236, 35, 74, 0.18)',
    text: 'rgba(255, 240, 244, 0.94)',
  };
}

const VALID_COOLDOWN_ACTIONS = new Set(['attack', 'defend', 'charge']);
const VALID_COOLDOWN_MODES = new Set(['local', 'remote', 'ranged']);

function ensureProfileCooldownState(profile) {
  if (!profile || typeof profile !== 'object') {
    return;
  }
  if (!profile.cooldowns || typeof profile.cooldowns !== 'object') {
    profile.cooldowns = {};
  }
  if (!profile.cooldownDetails || typeof profile.cooldownDetails !== 'object') {
    profile.cooldownDetails = {};
  }
  const now = Date.now();
  Object.keys(profile.cooldowns).forEach((key) => {
    const parsed = Number(profile.cooldowns[key]);
    if (!Number.isFinite(parsed) || parsed <= now) {
      delete profile.cooldowns[key];
      delete profile.cooldownDetails[key];
    } else {
      profile.cooldowns[key] = parsed;
      const details = profile.cooldownDetails[key];
      if (!details || typeof details !== 'object') {
        profile.cooldownDetails[key] = {
          mode: null,
          duration: parsed - now,
          startedAt: now,
        };
      } else {
        const durationValue = Number(details.duration);
        const startedAtValue = Number(details.startedAt);
        profile.cooldownDetails[key] = {
          mode: typeof details.mode === 'string' ? details.mode : null,
          duration: Number.isFinite(durationValue) && durationValue > 0 ? durationValue : parsed - now,
          startedAt: Number.isFinite(startedAtValue) ? startedAtValue : now,
        };
      }
    }
  });
  if (typeof profile.cooldownUntil === 'number' && profile.cooldownUntil > now) {
    const legacyDuration = profile.cooldownUntil - now;
    profile.cooldowns[COOLDOWN_KEYS.ATTACK] = profile.cooldownUntil;
    profile.cooldowns[COOLDOWN_KEYS.DEFEND] = profile.cooldownUntil;
    profile.cooldowns[COOLDOWN_KEYS.CHARGE] = profile.cooldownUntil;
    profile.cooldownDetails[COOLDOWN_KEYS.ATTACK] = {
      mode: null,
      duration: legacyDuration,
      startedAt: now,
    };
    profile.cooldownDetails[COOLDOWN_KEYS.DEFEND] = {
      mode: null,
      duration: legacyDuration,
      startedAt: now,
    };
    profile.cooldownDetails[COOLDOWN_KEYS.CHARGE] = {
      mode: null,
      duration: legacyDuration,
      startedAt: now,
    };
  }
  delete profile.cooldownUntil;
}

function normaliseApiCooldowns(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const sanitized = {};
  Object.keys(value).forEach((key) => {
    if (!key && key !== 0) {
      return;
    }
    const normalizedKey = typeof key === 'string' ? key.trim().toLowerCase() : String(key);
    if (!VALID_COOLDOWN_ACTIONS.has(normalizedKey)) {
      return;
    }
    const deadline = Number(value[key]);
    if (Number.isFinite(deadline) && deadline > 0) {
      sanitized[normalizedKey] = deadline;
    }
  });
  return sanitized;
}

function normaliseApiCooldownDetails(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const sanitized = {};
  Object.keys(value).forEach((key) => {
    if (!key && key !== 0) {
      return;
    }
    const normalizedKey = typeof key === 'string' ? key.trim().toLowerCase() : String(key);
    if (!VALID_COOLDOWN_ACTIONS.has(normalizedKey)) {
      return;
    }
    const rawDetail = value[key];
    if (!rawDetail || typeof rawDetail !== 'object') {
      return;
    }
    const detail = {};
    const mode = typeof rawDetail.mode === 'string' ? rawDetail.mode.trim().toLowerCase() : '';
    if (VALID_COOLDOWN_MODES.has(mode)) {
      detail.mode = mode;
    }
    const duration = Number(rawDetail.duration);
    if (Number.isFinite(duration) && duration > 0) {
      detail.duration = duration;
    }
    const startedAt = Number(rawDetail.startedAt);
    if (Number.isFinite(startedAt) && startedAt > 0) {
      detail.startedAt = startedAt;
    }
    if (Object.keys(detail).length) {
      sanitized[normalizedKey] = detail;
    }
  });
  return sanitized;
}

function buildCooldownStatePayload(profile) {
  if (!profile) {
    return { cooldowns: {}, details: {} };
  }
  ensureProfileCooldownState(profile);
  const cooldowns = {};
  const details = {};
  Object.keys(profile.cooldowns || {}).forEach((key) => {
    const normalizedKey = typeof key === 'string' ? key.trim().toLowerCase() : key;
    const deadline = Number(profile.cooldowns[key]);
    if (VALID_COOLDOWN_ACTIONS.has(normalizedKey) && Number.isFinite(deadline) && deadline > 0) {
      cooldowns[normalizedKey] = deadline;
    }
  });
  Object.keys(profile.cooldownDetails || {}).forEach((key) => {
    const normalizedKey = typeof key === 'string' ? key.trim().toLowerCase() : key;
    if (!VALID_COOLDOWN_ACTIONS.has(normalizedKey)) {
      return;
    }
    const rawDetail = profile.cooldownDetails[key];
    if (!rawDetail || typeof rawDetail !== 'object') {
      return;
    }
    const detail = {};
    const mode = typeof rawDetail.mode === 'string' ? rawDetail.mode.trim().toLowerCase() : '';
    if (VALID_COOLDOWN_MODES.has(mode)) {
      detail.mode = mode;
    }
    const duration = Number(rawDetail.duration);
    if (Number.isFinite(duration) && duration > 0) {
      detail.duration = Math.round(duration);
    }
    const startedAt = Number(rawDetail.startedAt);
    if (Number.isFinite(startedAt) && startedAt > 0) {
      detail.startedAt = Math.round(startedAt);
    }
    if (Object.keys(detail).length) {
      details[normalizedKey] = detail;
    }
  });
  return { cooldowns, details };
}

function isActionOnCooldown(profile, actionKey, now = Date.now()) {
  if (!profile || profile.skipCooldown) {
    return false;
  }
  ensureProfileCooldownState(profile);
  const deadline = profile.cooldowns && typeof profile.cooldowns[actionKey] === 'number' ? profile.cooldowns[actionKey] : null;
  return Boolean(deadline && deadline > now);
}

function setProfileCooldown(profile, actionKey, duration, details = {}) {
  if (!profile || profile.skipCooldown) {
    clearProfileCooldown(profile, actionKey);
    return null;
  }
  const safeDuration = Math.max(0, Number(duration) || 0);
  if (!safeDuration) {
    clearProfileCooldown(profile, actionKey);
    return null;
  }
  ensureProfileCooldownState(profile);
  const now = Date.now();
  const deadline = now + safeDuration;
  if (!profile.cooldowns) {
    profile.cooldowns = {};
  }
  profile.cooldowns[actionKey] = deadline;
  if (!profile.cooldownDetails) {
    profile.cooldownDetails = {};
  }
  profile.cooldownDetails[actionKey] = {
    mode: typeof details.mode === 'string' ? details.mode : null,
    duration: safeDuration,
    startedAt: now,
  };
  activeCooldowns.set(actionKey, {
    deadline,
    duration: safeDuration,
    mode: typeof details.mode === 'string' ? details.mode : null,
  });
  startCooldownTicker();
  renderCooldownStrip(now);
  return deadline;
}

function clearProfileCooldown(profile, actionKey) {
  if (profile && profile.cooldowns) {
    delete profile.cooldowns[actionKey];
  }
  if (profile && profile.cooldownDetails) {
    delete profile.cooldownDetails[actionKey];
  }
  if (activeCooldowns.has(actionKey)) {
    activeCooldowns.delete(actionKey);
    if (!activeCooldowns.size) {
      stopCooldownTicker();
    }
    renderCooldownStrip();
  }
}

function syncCooldownsFromProfile(profile) {
  activeCooldowns.clear();
  if (!profile) {
    stopCooldownTicker();
    renderCooldownStrip();
    return;
  }
  ensureProfileCooldownState(profile);
  const now = Date.now();
  Object.keys(profile.cooldowns || {}).forEach((key) => {
    const deadline = profile.cooldowns[key];
    if (typeof deadline === 'number' && deadline > now) {
      const details = profile.cooldownDetails ? profile.cooldownDetails[key] : null;
      activeCooldowns.set(key, {
        deadline,
        duration:
          details && Number.isFinite(Number(details.duration)) && Number(details.duration) > 0
            ? Number(details.duration)
            : deadline - now,
        mode: details && typeof details.mode === 'string' ? details.mode : null,
      });
    }
  });
  if (activeCooldowns.size) {
    startCooldownTicker();
  } else {
    stopCooldownTicker();
  }
  renderCooldownStrip(now);
}

function startCooldownTicker() {
  if (cooldownTickerId !== null) {
    return;
  }
  cooldownTickerId = window.setInterval(tickCooldowns, 1000);
}

function stopCooldownTicker() {
  if (cooldownTickerId !== null) {
    window.clearInterval(cooldownTickerId);
    cooldownTickerId = null;
  }
}

function tickCooldowns() {
  const now = Date.now();
  let removedAny = false;
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;

  activeCooldowns.forEach((info, key) => {
    if (!info || typeof info.deadline !== 'number' || info.deadline <= now) {
      activeCooldowns.delete(key);
      removedAny = true;
      if (profile) {
        ensureProfileCooldownState(profile);
        if (profile.cooldowns) {
          delete profile.cooldowns[key];
        }
        if (profile.cooldownDetails) {
          delete profile.cooldownDetails[key];
        }
      }
    }
  });

  if (!activeCooldowns.size) {
    stopCooldownTicker();
  }

  renderCooldownStrip(now);
  updateRecentCheckinCooldownBadges(now, profile);

  if (removedAny) {
    if (profile) {
      savePlayers();
      if (profile.nextCheckinMultiplier > 1 && !isActionOnCooldown(profile, COOLDOWN_KEYS.CHARGE, now)) {
        updateStatus(`Charge complete! Next check-in pays x${profile.nextCheckinMultiplier} points.`);
      }
      scheduleProfileStatsSync(profile);
    }
    if (
      typeof document !== 'undefined' &&
      document.body &&
      document.body.classList.contains('recent-checkins-open')
    ) {
      updateRecentCheckinsDrawerContent(profile);
    }
    renderPlayerState();
  }
}

function renderCooldownStrip(now = Date.now()) {
  if (!cooldownStrip) {
    return;
  }
  if (!activeCooldowns.size) {
    cooldownStrip.classList.add('hidden');
    cooldownStrip.innerHTML = '';
    return;
  }
  cooldownStrip.classList.remove('hidden');
  const fragment = document.createDocumentFragment();
  const sortedEntries = Array.from(activeCooldowns.entries()).sort((a, b) => {
    const deadlineA = a[1] && typeof a[1].deadline === 'number' ? a[1].deadline : Number.POSITIVE_INFINITY;
    const deadlineB = b[1] && typeof b[1].deadline === 'number' ? b[1].deadline : Number.POSITIVE_INFINITY;
    return deadlineA - deadlineB;
  });
  sortedEntries.forEach(([key, info]) => {
    if (!info || typeof info.deadline !== 'number') {
      return;
    }
    const remaining = Math.max(0, info.deadline - now);
    const duration = Math.max(1, Number(info.duration) || remaining || 1);
    const ratio = Math.max(0, Math.min(1, remaining / duration));
    const colors = resolveCooldownColors(key, info.mode);
    const item = document.createElement('div');
    item.className = 'cooldown-item';
    item.dataset.cooldownAction = key;
    item.style.setProperty('--cooldown-track-color', colors.track);
    item.style.setProperty('--cooldown-fill-color', colors.fill);
    item.style.setProperty('--cooldown-text-color', colors.text);
    item.setAttribute('aria-label', `${formatCooldownLabel(key, info.mode)} cooldown ${formatCooldownTime(remaining)}`);

    const track = document.createElement('div');
    track.className = 'cooldown-track';
    const fill = document.createElement('div');
    fill.className = 'cooldown-fill';
    fill.style.transform = `scaleX(${ratio})`;
    track.appendChild(fill);

    const timeLabel = document.createElement('span');
    timeLabel.className = 'cooldown-time';
    timeLabel.textContent = formatCooldownTime(remaining);

    item.appendChild(track);
    item.appendChild(timeLabel);
    fragment.appendChild(item);
  });
  cooldownStrip.innerHTML = '';
  cooldownStrip.appendChild(fragment);
}

function resolveCheckInAction(profile, options = {}) {
  if (!profile) {
    return {
      key: COOLDOWN_KEYS.ATTACK,
      mode: 'attack',
      label: formatCooldownLabel(COOLDOWN_KEYS.ATTACK),
      info: null,
      preciseInfo: null,
      fallbackInfo: null,
    };
  }
  const preciseInfo =
    Object.prototype.hasOwnProperty.call(options, 'preciseInfo') && options.preciseInfo !== undefined
      ? options.preciseInfo
      : getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  const fallbackInfo =
    Object.prototype.hasOwnProperty.call(options, 'fallbackInfo') && options.fallbackInfo !== undefined
      ? options.fallbackInfo
      : preciseInfo
      ? null
      : getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  const selectedInfo = preciseInfo || fallbackInfo;
  const homeId = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const matchesHome =
    homeId && selectedInfo && selectedInfo.id ? safeId(selectedInfo.id) === homeId : false;
  const actionKey = matchesHome ? COOLDOWN_KEYS.DEFEND : COOLDOWN_KEYS.ATTACK;
  const mode =
    actionKey === COOLDOWN_KEYS.DEFEND && (!preciseInfo || (selectedInfo && selectedInfo.source === 'home-fallback'))
      ? 'remote'
      : 'local';
  return {
    key: actionKey,
    mode,
    label: formatCooldownLabel(actionKey, mode === 'remote' ? 'remote' : null),
    info: selectedInfo,
    preciseInfo,
    fallbackInfo,
  };
}

function resolveEntryCooldownKey(entry) {
  if (!entry) {
    return null;
  }
  const rawType =
    typeof entry.cooldownType === 'string' ? entry.cooldownType.trim().toLowerCase() : null;
  if (rawType && VALID_COOLDOWN_ACTIONS.has(rawType)) {
    return rawType;
  }
  const fallbackType = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : '';
  if (fallbackType === 'attack') {
    return COOLDOWN_KEYS.ATTACK;
  }
  if (fallbackType === 'defend') {
    return COOLDOWN_KEYS.DEFEND;
  }
  return null;
}

function getEntryCooldownInfo(profile, entry, now = Date.now()) {
  if (!profile || !entry) {
    return null;
  }
  ensureProfileCooldownState(profile);
  const actionKey = resolveEntryCooldownKey(entry);
  if (!actionKey) {
    return null;
  }
  const deadline =
    profile.cooldowns && typeof profile.cooldowns[actionKey] === 'number'
      ? profile.cooldowns[actionKey]
      : null;
  if (!deadline || deadline <= now) {
    return null;
  }
  const entryTimestampRaw = Number(entry.timestamp);
  const entryTimestamp = Number.isFinite(entryTimestampRaw) ? entryTimestampRaw : null;
  const entryModeRaw =
    typeof entry.cooldownMode === 'string' ? entry.cooldownMode.trim().toLowerCase() : null;
  const details = profile.cooldownDetails ? profile.cooldownDetails[actionKey] : null;
  const startedAtRaw = details && details.startedAt !== undefined ? Number(details.startedAt) : null;
  const startedAt = Number.isFinite(startedAtRaw) ? startedAtRaw : null;
  if (startedAt && entryTimestamp) {
    const drift = Math.abs(entryTimestamp - startedAt);
    if (drift > 5000) {
      return null;
    }
  }
  const mode =
    entryModeRaw === 'remote' || entryModeRaw === 'local'
      ? entryModeRaw
      : details && typeof details.mode === 'string'
      ? details.mode
      : null;
  const startedReference = startedAt || entryTimestamp || null;
  return {
    key: actionKey,
    mode,
    remaining: deadline - now,
    label: formatCooldownLabel(actionKey, mode === 'remote' ? 'remote' : null),
    startedAt: startedReference,
  };
}

function ensureDistrictDataLoaded() {
  if (districtGeoJson || districtGeoJsonPromise || typeof fetch !== 'function') {
    return districtGeoJsonPromise || Promise.resolve(districtGeoJson);
  }
  if (isFileOrigin()) {
    console.warn('Skipping district data preload on file:// origin. Start a local server (e.g., python3 -m http.server) to enable data loading.');
    return Promise.resolve(null);
  }
  districtGeoJsonPromise = loadStaticDataset('prague-districts')
    .then((data) => {
      if (data && data.type === 'FeatureCollection') {
        districtGeoJson = data;
        return districtGeoJson;
      }
      return null;
    })
    .catch((error) => {
      console.warn('Failed to preload district polygons', error);
      return null;
    });
  return districtGeoJsonPromise;
}

function ringContainsPoint(ring, lng, lat) {
  if (!ring || ring.length < 4) {
    return false;
  }
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContainsPoint(rings, lng, lat) {
  if (!rings || !rings.length) {
    return false;
  }
  if (!ringContainsPoint(rings[0], lng, lat)) {
    return false;
  }
  for (let i = 1; i < rings.length; i += 1) {
    if (ringContainsPoint(rings[i], lng, lat)) {
      return false;
    }
  }
  return true;
}

function geometryContainsPoint(geometry, lng, lat) {
  if (!geometry) {
    return false;
  }
  if (geometry.type === 'Polygon') {
    return polygonContainsPoint(geometry.coordinates, lng, lat);
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContainsPoint(polygon, lng, lat));
  }
  return false;
}

function findDistrictFeatureByPoint(lng, lat) {
  if (!districtGeoJson || !Array.isArray(districtGeoJson.features)) {
    return null;
  }
  for (const feature of districtGeoJson.features) {
    if (feature && geometryContainsPoint(feature.geometry, lng, lat)) {
      return feature;
    }
  }
  return null;
}

function ensurePlayerProfile(username) {
  if (!username) {
    return null;
  }
  if (!players[username] || typeof players[username] !== 'object') {
    players[username] = {};
  }
  const profile = players[username];
  profile.points = Math.max(0, normaliseNumber(profile.points, 0));
  profile.attackPoints = Math.max(0, normaliseNumber(profile.attackPoints, 0));
  profile.defendPoints = Math.max(0, normaliseNumber(profile.defendPoints, 0));
  profile.checkins = Array.isArray(profile.checkins) ? profile.checkins : [];
  profile.serverCheckinCount = Math.max(
    normaliseNumber(profile.serverCheckinCount, profile.checkins.length),
    profile.checkins.length,
  );
  if (profile.homeDistrictId !== undefined && profile.homeDistrictId !== null) {
    profile.homeDistrictId = safeId(profile.homeDistrictId);
  } else {
    profile.homeDistrictId = null;
  }
  if (typeof profile.homeDistrictName !== 'string') {
    profile.homeDistrictName = null;
  }
  if (!profile.lastKnownLocation || typeof profile.lastKnownLocation !== 'object') {
    profile.lastKnownLocation = null;
  }
  profile.mapMarkerColor = normaliseMarkerColor(profile.mapMarkerColor);
  ensureProfileCooldownState(profile);
  profile.nextCheckinMultiplier = Math.max(1, normaliseNumber(profile.nextCheckinMultiplier, 1));
  profile.skipCooldown = Boolean(profile.skipCooldown);
  const rememberOnDevice = Boolean(profile.auth && profile.auth.rememberOnDevice);
  if (profile.auth && typeof profile.auth === 'object') {
    const passwordHash = typeof profile.auth.passwordHash === 'string' ? profile.auth.passwordHash : null;
    const salt = typeof profile.auth.salt === 'string' ? profile.auth.salt : null;
    if (passwordHash && salt) {
      const createdAt = normaliseNumber(profile.auth.createdAt, Date.now());
      profile.auth = { passwordHash, salt, createdAt, rememberOnDevice };
    } else {
      profile.auth = { rememberOnDevice };
    }
  } else {
    profile.auth = { rememberOnDevice };
  }
  return profile;
}

function normaliseApiLastKnownLocation(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const lng = Number.isFinite(Number(data.lng)) ? Number(data.lng) : null;
  const lat = Number.isFinite(Number(data.lat)) ? Number(data.lat) : null;
  const districtId = data.districtId ? safeId(data.districtId) : null;
  const districtName =
    typeof data.districtName === 'string' && data.districtName.trim()
      ? data.districtName.trim()
      : null;
  const timestamp = Number.isFinite(Number(data.timestamp)) ? Number(data.timestamp) : Date.now();
  const source = normaliseLocationSource(data.source, 'profile');
  let resolvedDistrictId = districtId;
  let resolvedDistrictName = districtName;

  if (!resolvedDistrictId && lng !== null && lat !== null && districtGeoJson && Array.isArray(districtGeoJson.features)) {
    const feature = findDistrictFeatureByPoint(lng, lat);
    if (feature) {
      const inferredId = getDistrictId(feature);
      if (inferredId) {
        resolvedDistrictId = safeId(inferredId);
        if (!resolvedDistrictName) {
          resolvedDistrictName = getDistrictName(feature) || null;
        }
      }
    }
  }

  if (lng === null && lat === null && !resolvedDistrictId && !resolvedDistrictName) {
    return null;
  }

  return {
    lng,
    lat,
    districtId: resolvedDistrictId,
    districtName: resolvedDistrictName,
    timestamp,
    source,
  };
}

function sanitiseCheckinHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const type = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : '';
  if (type !== 'attack' && type !== 'defend') {
    return null;
  }

  const districtId = entry.districtId !== undefined && entry.districtId !== null ? String(entry.districtId).trim() : null;
  const districtName = typeof entry.districtName === 'string' && entry.districtName.trim() ? entry.districtName.trim() : null;
  if (!districtId && !districtName) {
    return null;
  }

  let timestamp = entry.timestamp;
  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime();
  }
  const tsNumber = Number(timestamp);
  if (!Number.isFinite(tsNumber)) {
    return null;
  }

  const multiplierValue = Number(entry.multiplier);
  const multiplier = Number.isFinite(multiplierValue) && multiplierValue > 0 ? multiplierValue : 1;
  const rawCooldownType = typeof entry.cooldownType === 'string' ? entry.cooldownType.trim().toLowerCase() : '';
  const validCooldownTypes = new Set([COOLDOWN_KEYS.ATTACK, COOLDOWN_KEYS.DEFEND, COOLDOWN_KEYS.CHARGE]);
  const cooldownType = validCooldownTypes.has(rawCooldownType) ? rawCooldownType : null;
  const rawCooldownMode = typeof entry.cooldownMode === 'string' ? entry.cooldownMode.trim().toLowerCase() : '';
  const validCooldownModes = new Set(['local', 'remote', 'ranged']);
  const cooldownMode = validCooldownModes.has(rawCooldownMode) ? rawCooldownMode : null;

  const payload = {
    timestamp: Math.trunc(tsNumber),
    districtId,
    districtName,
    type,
    multiplier,
    ranged: Boolean(entry.ranged),
    melee: Boolean(entry.melee),
  };
  if (cooldownType) {
    payload.cooldownType = cooldownType;
  }
  if (cooldownMode) {
    payload.cooldownMode = cooldownMode;
  }

  return payload;
}

function sanitizeApiCheckinHistory(history) {
  if (!history) {
    return [];
  }
  if (!Array.isArray(history)) {
    return [];
  }
  const sanitized = [];
  for (const entry of history) {
    if (sanitized.length >= MAX_HISTORY_ITEMS) {
      break;
    }
    const normalised = sanitiseCheckinHistoryEntry(entry);
    if (normalised) {
      sanitized.push(normalised);
    }
  }
  return sanitized;
}

function buildCheckinHistoryPayload(profile) {
  if (!profile || !Array.isArray(profile.checkins)) {
    return [];
  }
  const payload = [];
  for (const entry of profile.checkins.slice(0, MAX_HISTORY_ITEMS)) {
    const normalised = sanitiseCheckinHistoryEntry(entry);
    if (normalised) {
      payload.push(normalised);
    }
  }
  return payload;
}

function applyServerPlayerData(profile, apiPlayer) {
  if (!profile || !apiPlayer || typeof apiPlayer !== 'object') {
    return profile;
  }

  if (apiPlayer.id !== undefined && apiPlayer.id !== null) {
    profile.backendId = apiPlayer.id;
  }
  if (typeof apiPlayer.username === 'string' && !profile.username) {
    profile.username = apiPlayer.username;
  }
  if (typeof apiPlayer.display_name === 'string') {
    profile.displayName = apiPlayer.display_name;
  }
  if (typeof apiPlayer.profile_image_url === 'string') {
    profile.profileImageUrl = apiPlayer.profile_image_url;
  }
  if (typeof apiPlayer.map_marker_color === 'string') {
    profile.mapMarkerColor = normaliseMarkerColor(apiPlayer.map_marker_color);
  } else {
    profile.mapMarkerColor = normaliseMarkerColor(profile.mapMarkerColor);
  }

  profile.points = Math.max(0, normaliseNumber(apiPlayer.score, profile.points || 0));
  profile.attackPoints = Math.max(0, normaliseNumber(apiPlayer.attack_points, profile.attackPoints || 0));
  profile.defendPoints = Math.max(0, normaliseNumber(apiPlayer.defend_points, profile.defendPoints || 0));

  if (Array.isArray(apiPlayer.checkin_history)) {
    profile.checkins = sanitizeApiCheckinHistory(apiPlayer.checkin_history);
  } else if (!Array.isArray(profile.checkins)) {
    profile.checkins = [];
  }

  if (Object.prototype.hasOwnProperty.call(apiPlayer, 'cooldowns')) {
    profile.cooldowns = normaliseApiCooldowns(apiPlayer.cooldowns);
  }
  if (Object.prototype.hasOwnProperty.call(apiPlayer, 'cooldown_details')) {
    profile.cooldownDetails = normaliseApiCooldownDetails(apiPlayer.cooldown_details);
  }

  const serverCheckinsCount = normaliseNumber(apiPlayer.checkins, profile.checkins ? profile.checkins.length : 0);
  profile.serverCheckinCount = Math.max(serverCheckinsCount, Array.isArray(profile.checkins) ? profile.checkins.length : 0);

  if (Object.prototype.hasOwnProperty.call(apiPlayer, 'last_known_location')) {
    profile.lastKnownLocation = normaliseApiLastKnownLocation(apiPlayer.last_known_location);
    if (currentUser && profile === ensurePlayerProfile(currentUser) && profile.lastKnownLocation) {
      const { lng, lat, districtId, districtName } = profile.lastKnownLocation;
      if (typeof lng === 'number' && Number.isFinite(lng) && typeof lat === 'number' && Number.isFinite(lat)) {
        lastKnownLocation = [lng, lat];
      }
      if (districtId) {
        lastPreciseLocationInfo = {
          id: safeId(districtId),
          name:
            (typeof districtName === 'string' && districtName.trim()) || `District ${districtId}`,
        };
      }
      ensurePreciseLocationResolution(profile);
    }
  }

  const homeCode = typeof apiPlayer.home_district_code === 'string' && apiPlayer.home_district_code.trim()
    ? safeId(apiPlayer.home_district_code)
    : null;
  const homeName = typeof apiPlayer.home_district_name === 'string' && apiPlayer.home_district_name.trim()
    ? apiPlayer.home_district_name.trim()
    : null;

  if (Object.prototype.hasOwnProperty.call(apiPlayer, 'home_district_code')) {
    profile.homeDistrictId = homeCode || null;
  } else if (homeCode) {
    profile.homeDistrictId = homeCode;
  }

  if (homeName) {
    profile.homeDistrictName = homeName;
  } else if (Object.prototype.hasOwnProperty.call(apiPlayer, 'home_district_name')) {
    profile.homeDistrictName = null;
  } else if (typeof apiPlayer.home_district === 'string' && apiPlayer.home_district.trim()) {
    profile.homeDistrictName = apiPlayer.home_district.trim();
  }

  if (apiPlayer.attack_ratio !== undefined && apiPlayer.attack_ratio !== null) {
    const parsedAttackRatio = Number(apiPlayer.attack_ratio);
    if (Number.isFinite(parsedAttackRatio)) {
      profile.attackRatio = parsedAttackRatio;
    }
  }
  if (apiPlayer.defend_ratio !== undefined && apiPlayer.defend_ratio !== null) {
    const parsedDefendRatio = Number(apiPlayer.defend_ratio);
    if (Number.isFinite(parsedDefendRatio)) {
      profile.defendRatio = parsedDefendRatio;
    }
  }

  profile.isActive = apiPlayer.is_active !== undefined ? Boolean(apiPlayer.is_active) : profile.isActive;
  profile.createdAt = apiPlayer.created_at || profile.createdAt || null;
  profile.updatedAt = apiPlayer.updated_at || profile.updatedAt || null;

  profile.backendSyncedAt = Date.now();
  ensureProfileCooldownState(profile);
  return profile;
}

function formatAttackDefendRatio(profile) {
  const attack = normaliseNumber(profile?.attackPoints, 0);
  const defend = normaliseNumber(profile?.defendPoints, 0);
  if (attack === 0 && defend === 0) {
    return '—';
  }
  if (defend === 0) {
    return '∞';
  }
  const ratio = attack / defend;
  const precision = ratio >= 10 ? 1 : 2;
  return Number(ratio.toFixed(precision)).toString();
}

function describeHomeDistrict(profile) {
  if (!profile) {
    return 'Unset';
  }
  if (profile.homeDistrictName && profile.homeDistrictName.trim()) {
    return profile.homeDistrictName;
  }
  if (profile.homeDistrictId) {
    return `District ${profile.homeDistrictId}`;
  }
  return 'Unset';
}

function supportsTouchInput() {
  if (typeof window === 'undefined') {
    return false;
  }
  if ('ontouchstart' in window) {
    return true;
  }
  const nav = window.navigator;
  if (nav && typeof nav.maxTouchPoints === 'number' && nav.maxTouchPoints > 0) {
    return true;
  }
  if (nav && typeof nav.msMaxTouchPoints === 'number' && nav.msMaxTouchPoints > 0) {
    return true;
  }
  return false;
}

function cancelMobileContextMenuLongPress() {
  if (mobileContextMenuTimerId !== null) {
    window.clearTimeout(mobileContextMenuTimerId);
    mobileContextMenuTimerId = null;
  }
  mobileContextMenuStartPoint = null;
  mobileContextMenuStartLngLat = null;
  mobileContextMenuActive = false;
}

function suppressNextBuildingTap() {
  mobileContextMenuSuppressClick = true;
  if (mobileContextMenuSuppressClickResetId !== null) {
    window.clearTimeout(mobileContextMenuSuppressClickResetId);
  }
  mobileContextMenuSuppressClickResetId = window.setTimeout(() => {
    mobileContextMenuSuppressClick = false;
    mobileContextMenuSuppressClickResetId = null;
  }, 700);
}

function handleMobileContextMenuTouchStart(event) {
  if (!supportsTouchInput()) {
    return;
  }
  if (!event || !event.lngLat || !event.point) {
    cancelMobileContextMenuLongPress();
    return;
  }
  const originalEvent = event.originalEvent || null;
  const touches = originalEvent && originalEvent.touches ? originalEvent.touches : null;
  if ((touches && touches.length > 1) || (event.points && event.points.length > 1)) {
    cancelMobileContextMenuLongPress();
    return;
  }

  mobileContextMenuActive = true;
  mobileContextMenuStartPoint = { x: event.point.x, y: event.point.y };
  mobileContextMenuStartLngLat = { lng: event.lngLat.lng, lat: event.lngLat.lat };

  if (mobileContextMenuTimerId !== null) {
    window.clearTimeout(mobileContextMenuTimerId);
  }

  mobileContextMenuTimerId = window.setTimeout(() => {
    mobileContextMenuTimerId = null;
    if (!mobileContextMenuActive || !mobileContextMenuStartPoint || !mobileContextMenuStartLngLat) {
      return;
    }
    const projected =
      map && typeof map.project === 'function'
        ? map.project([mobileContextMenuStartLngLat.lng, mobileContextMenuStartLngLat.lat])
        : mobileContextMenuStartPoint;
    const anchorPoint = projected
      ? { x: projected.x, y: projected.y }
      : { x: mobileContextMenuStartPoint.x, y: mobileContextMenuStartPoint.y };

    try {
      showActionContextMenu(
        mobileContextMenuStartLngLat.lng,
        mobileContextMenuStartLngLat.lat,
        anchorPoint,
        { isTouch: true }
      );
      if (originalEvent && typeof originalEvent.preventDefault === 'function') {
        originalEvent.preventDefault();
      }
    } catch (error) {
      console.warn('Failed to open touch context menu', error);
    }
    cancelMobileContextMenuLongPress();
  }, MOBILE_CONTEXT_MENU_LONG_PRESS_MS);
}

function handleMobileContextMenuTouchMove(event) {
  if (!mobileContextMenuActive || !mobileContextMenuStartPoint) {
    return;
  }
  if (!event || !event.point) {
    cancelMobileContextMenuLongPress();
    return;
  }
  const originalEvent = event.originalEvent || null;
  const touches = originalEvent && originalEvent.touches ? originalEvent.touches : null;
  if ((touches && touches.length > 1) || (event.points && event.points.length > 1)) {
    cancelMobileContextMenuLongPress();
    return;
  }
  const dx = event.point.x - mobileContextMenuStartPoint.x;
  const dy = event.point.y - mobileContextMenuStartPoint.y;
  const distance = Math.hypot(dx, dy);
  if (distance > MOBILE_CONTEXT_MENU_MOVE_THRESHOLD) {
    cancelMobileContextMenuLongPress();
  }
}

function handleMobileContextMenuTouchEnd() {
  cancelMobileContextMenuLongPress();
}

function enableMobileContextMenuLongPress() {
  if (mobileContextMenuHandlersBound || !map || typeof map.on !== 'function') {
    return;
  }
  if (!supportsTouchInput()) {
    return;
  }
  mobileContextMenuHandlersBound = true;
  map.on('touchstart', 'buildings-3d', handleMobileContextMenuTouchStart);
  map.on('touchmove', handleMobileContextMenuTouchMove);
  map.on('touchend', handleMobileContextMenuTouchEnd);
  map.on('touchcancel', handleMobileContextMenuTouchEnd);
  map.on('dragstart', cancelMobileContextMenuLongPress);
  map.on('movestart', cancelMobileContextMenuLongPress);
  map.on('zoomstart', cancelMobileContextMenuLongPress);
  map.on('pitchstart', cancelMobileContextMenuLongPress);
  map.on('rotatestart', cancelMobileContextMenuLongPress);
}

async function attemptLocalMeleeAttackAt(lng, lat, options = {}) {
  if (!currentUser) {
    return false;
  }
  const numericLng = Number(lng);
  const numericLat = Number(lat);
  if (!Number.isFinite(numericLng) || !Number.isFinite(numericLat)) {
    return false;
  }
  const profile = ensurePlayerProfile(currentUser);
  const locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  if (!locationInfo || !locationInfo.id) {
    return false;
  }
  const locationSource = locationInfo.source || null;
  const localSources = new Set(['map', 'geolocated', 'cached', 'profile']);
  if (!localSources.has(locationSource)) {
    return false;
  }
  const localId = safeId(locationInfo.id);
  const homeId = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  let feature = options && options.feature ? options.feature : null;
  if (!feature) {
    try {
      feature = await resolveDistrictAtLngLat(numericLng, numericLat);
    } catch (error) {
      console.warn('Failed to resolve district for melee attack', error);
      feature = null;
    }
  }
  if (!feature) {
    return false;
  }
  const targetIdRaw = getDistrictId(feature);
  if (!targetIdRaw) {
    return false;
  }
  const targetId = safeId(targetIdRaw);
  if (targetId !== localId) {
    return false;
  }
  if (homeId && homeId === targetId) {
    return false;
  }
  const targetName = getDistrictName(feature) || `District ${targetId}`;
  const projectedPoint =
    options && options.point
      ? { x: options.point.x, y: options.point.y }
      : map && typeof map.project === 'function'
      ? map.project([numericLng, numericLat])
      : null;

  try {
    await handleCheckIn({
      contextCoords: [numericLng, numericLat],
      contextPoint: projectedPoint ? { x: projectedPoint.x, y: projectedPoint.y } : null,
      targetDistrictId: targetId,
      targetDistrictName: targetName,
      contextIsLocal: true,
    });
    return true;
  } catch (error) {
    console.warn('Unable to complete melee attack check-in', error);
    return false;
  }
}

function getCurrentLocationDistrictInfo(options) {
  const { profile = null, allowHomeFallback = false } = options || {};

  if (lastKnownLocation && Array.isArray(lastKnownLocation) && lastKnownLocation.length === 2) {
    let preciseId = null;
    let preciseName = null;
    if (lastPreciseLocationInfo && lastPreciseLocationInfo.id) {
      preciseId = safeId(lastPreciseLocationInfo.id);
      preciseName = lastPreciseLocationInfo.name || `District ${lastPreciseLocationInfo.id}`;
    }
    if (!preciseId && districtGeoJson) {
      const feature = findDistrictFeatureByPoint(lastKnownLocation[0], lastKnownLocation[1]);
      if (feature) {
        const derivedId = getDistrictId(feature);
        if (derivedId) {
          preciseId = safeId(derivedId);
          preciseName = getDistrictName(feature) || preciseName || `District ${preciseId}`;
        }
      }
    }
    if (preciseId) {
      return {
        id: preciseId,
        name: preciseName,
        source: 'geolocated',
        lng: lastKnownLocation[0],
        lat: lastKnownLocation[1],
      };
    }
  }

  if (currentDistrictId) {
    return {
      id: safeId(currentDistrictId),
      name: currentDistrictName || null,
      source: 'map',
      lng: lastKnownLocation && Array.isArray(lastKnownLocation) ? lastKnownLocation[0] : null,
      lat: lastKnownLocation && Array.isArray(lastKnownLocation) ? lastKnownLocation[1] : null,
    };
  }

  if (profile && profile.lastKnownLocation) {
    const source = normaliseLocationSource(profile.lastKnownLocation.source, 'profile');
    const lng = typeof profile.lastKnownLocation.lng === 'number' && Number.isFinite(profile.lastKnownLocation.lng)
      ? profile.lastKnownLocation.lng
      : null;
    const lat = typeof profile.lastKnownLocation.lat === 'number' && Number.isFinite(profile.lastKnownLocation.lat)
      ? profile.lastKnownLocation.lat
      : null;
    let id = profile.lastKnownLocation.districtId ? safeId(profile.lastKnownLocation.districtId) : null;
    let name = profile.lastKnownLocation.districtName || null;

    if (!id && lng !== null && lat !== null && districtGeoJson && Array.isArray(districtGeoJson.features)) {
      const feature = findDistrictFeatureByPoint(lng, lat);
      if (feature) {
        const inferredId = getDistrictId(feature);
        if (inferredId) {
          id = safeId(inferredId);
          if (!name) {
            name = getDistrictName(feature) || null;
          }
        }
      }
    } else if (!id && lng !== null && lat !== null && districtGeoJsonPromise) {
      districtGeoJsonPromise
        .then(() => {
          if (districtGeoJson && Array.isArray(districtGeoJson.features)) {
            ensurePreciseLocationResolution(profile);
          }
        })
        .catch(() => {});
    }

    if (id || lng !== null || lat !== null) {
      return {
        id: id ? safeId(id) : null,
        name,
        source,
        lng,
        lat,
      };
    }
  }

  if (allowHomeFallback && profile && profile.homeDistrictId) {
    return {
      id: safeId(profile.homeDistrictId),
      name: profile.homeDistrictName || `District ${profile.homeDistrictId}`,
      source: 'home-fallback',
      lng: null,
      lat: null,
    };
  }

  return null;
}

function saveProfileLocation(profile, data, options = {}) {
  if (!profile || !data) {
    return false;
  }

  const originRaw = Object.prototype.hasOwnProperty.call(options, 'origin') ? options.origin : data.source;
  const origin = normaliseLocationSource(originRaw, null);
  const isGeolocatedOrigin = origin === 'geolocated';
  const forcePersist = options.forcePersist === true;

  if (!forcePersist && !isGeolocatedOrigin) {
    return false;
  }

  const timestamp = Number.isFinite(Number(data.timestamp)) ? Number(data.timestamp) : Date.now();
  const sanitized = {
    lng: typeof data.lng === 'number' && Number.isFinite(data.lng) ? data.lng : null,
    lat: typeof data.lat === 'number' && Number.isFinite(data.lat) ? data.lat : null,
    districtId: data.districtId ? safeId(data.districtId) : null,
    districtName: data.districtName || null,
    timestamp,
    source: origin,
  };

  const existing = profile.lastKnownLocation || {};

  if (!sanitized.districtId && sanitized.lng !== null && sanitized.lat !== null && districtGeoJson) {
    const feature = findDistrictFeatureByPoint(sanitized.lng, sanitized.lat);
    if (feature) {
      const inferredId = getDistrictId(feature);
      if (inferredId) {
        sanitized.districtId = safeId(inferredId);
        if (!sanitized.districtName) {
          sanitized.districtName = getDistrictName(feature) || null;
        }
      }
    }
  }

  if (sanitized.lng === null && typeof existing.lng === 'number' && Number.isFinite(existing.lng)) {
    sanitized.lng = existing.lng;
  }
  if (sanitized.lat === null && typeof existing.lat === 'number' && Number.isFinite(existing.lat)) {
    sanitized.lat = existing.lat;
  }
  if (!sanitized.districtName && existing.districtName) {
    sanitized.districtName = existing.districtName;
  }
  if (!sanitized.districtId && existing.districtId) {
    sanitized.districtId = existing.districtId;
  }
  if (!sanitized.source && existing.source) {
    sanitized.source = normaliseLocationSource(existing.source, null);
  }

  if (
    sanitized.lng === null &&
    sanitized.lat === null &&
    !sanitized.districtId &&
    !sanitized.districtName
  ) {
    return false;
  }

  const hasChanged =
    !existing ||
    existing.districtId !== sanitized.districtId ||
    existing.lng !== sanitized.lng ||
    existing.lat !== sanitized.lat ||
    existing.districtName !== sanitized.districtName ||
    !existing.timestamp ||
    sanitized.timestamp !== existing.timestamp ||
    normaliseLocationSource(existing.source, null) !== sanitized.source;

  profile.lastKnownLocation = {
    lng: sanitized.lng,
    lat: sanitized.lat,
    districtId: sanitized.districtId || null,
    districtName: sanitized.districtName || null,
    timestamp: sanitized.timestamp,
    source: sanitized.source || null,
  };

  if (profile.lastKnownLocation.districtId) {
    lastPreciseLocationInfo = {
      id: profile.lastKnownLocation.districtId,
      name: profile.lastKnownLocation.districtName || `District ${profile.lastKnownLocation.districtId}`,
    };
  }
  if (isGeolocatedOrigin && sanitized.lng !== null && sanitized.lat !== null) {
    lastKnownLocation = [sanitized.lng, sanitized.lat];
  }

  if (hasChanged) {
    const shouldSyncBackend = options.syncBackend === true || (options.syncBackend !== false && isGeolocatedOrigin);
    if (shouldSyncBackend) {
      scheduleLastKnownLocationSync(profile);
    }
  }

  return hasChanged;
}

function scheduleLastKnownLocationSync(profile) {
  if (!profile || !profile.backendId) {
    return;
  }
  const locationPayload =
    profile.lastKnownLocation && typeof profile.lastKnownLocation === 'object'
      ? { ...profile.lastKnownLocation }
      : null;

  if (!isSessionAuthenticated) {
    return;
  }

  locationSyncQueue = locationSyncQueue
    .catch(() => null)
    .then(() =>
      apiRequest(`players/${profile.backendId}/`, {
        method: 'PATCH',
        body: { last_known_location: locationPayload },
      })
    )
    .catch((error) => {
      if (error && (error.status === 401 || error.status === 403)) {
        isSessionAuthenticated = false;
        activePlayerBackendId = null;
      }
      console.warn('Failed to update last known location', error);
    });
}

function stopLiveLocationWatch() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    liveLocationWatchId = null;
    return;
  }
  if (liveLocationWatchId !== null) {
    try {
      navigator.geolocation.clearWatch(liveLocationWatchId);
    } catch (error) {
      console.warn('Failed to clear geolocation watch', error);
    }
  }
  liveLocationWatchId = null;
  lastLiveLocationUpdate = 0;
}

function startLiveLocationWatch() {
  if (!isSecureOrigin() || typeof navigator === 'undefined' || !navigator.geolocation) {
    return;
  }
  if (liveLocationWatchId !== null) {
    return;
  }

  const handlePosition = (position) => {
    if (!position || !position.coords) {
      return;
    }
    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }
    const now = Date.now();
    if (now - lastLiveLocationUpdate < LIVE_LOCATION_MIN_UPDATE_MS) {
      return;
    }
    lastLiveLocationUpdate = now;

    const lng = Number(longitude);
    const lat = Number(latitude);
    lastKnownLocation = [lng, lat];
    hasTriggeredGeolocate = true;

    ensureMap(() => {
      updateCurrentDistrictFromCoordinates(lng, lat, {
        persist: true,
        origin: 'geolocated',
        syncBackend: true,
      });
    });
  };

  const handleError = (error) => {
    if (error && error.code === 1) {
      stopLiveLocationWatch();
    }
  };

  try {
    liveLocationWatchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      LIVE_LOCATION_WATCH_OPTIONS
    );
  } catch (error) {
    console.warn('Failed to start geolocation watch', error);
    liveLocationWatchId = null;
  }
}

function buildPlayerStatsPayload(profile) {
  if (!profile) {
    return null;
  }
  const history = buildCheckinHistoryPayload(profile);
  const score = Math.max(0, Math.round(normaliseNumber(profile.points, 0)));
  const attackPoints = Math.max(0, Math.round(normaliseNumber(profile.attackPoints, 0)));
  const defendPoints = Math.max(0, Math.round(normaliseNumber(profile.defendPoints, 0)));
  const homeCode = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const homeName =
    typeof profile.homeDistrictName === 'string' && profile.homeDistrictName.trim()
      ? profile.homeDistrictName.trim()
      : null;
  const cooldownState = buildCooldownStatePayload(profile);
  const markerColor = normaliseMarkerColor(profile.mapMarkerColor);

  return {
    score,
    attack_points: attackPoints,
    defend_points: defendPoints,
    checkins: history.length,
    checkin_history: history,
    home_district_code: homeCode,
    home_district_name: homeName,
    home_district: homeName || '',
    cooldowns: cooldownState.cooldowns,
    cooldown_details: cooldownState.details,
    map_marker_color: markerColor,
  };
}

function scheduleProfileStatsSync(profile) {
  if (!profile || !profile.backendId || !isSessionAuthenticated) {
    return;
  }
  const payload = buildPlayerStatsPayload(profile);
  if (!payload) {
    return;
  }

  statsSyncQueue = statsSyncQueue
    .catch(() => null)
    .then(() =>
      apiRequest(`players/${profile.backendId}/`, {
        method: 'PATCH',
        body: payload,
      })
    )
    .then((data) => {
      if (data && typeof data === 'object') {
        applyServerPlayerData(profile, data);
        savePlayers();
      }
    })
    .catch((error) => {
      if (error && (error.status === 401 || error.status === 403)) {
        isSessionAuthenticated = false;
        activePlayerBackendId = null;
      }
      console.warn('Failed to sync player stats', error);
    });
}

function ensurePreciseLocationResolution(profile) {
  if (
    resolvingPreciseLocation ||
    !profile ||
    !lastKnownLocation ||
    !Array.isArray(lastKnownLocation) ||
    lastKnownLocation.length !== 2
  ) {
    return;
  }

  resolvingPreciseLocation = true;
  resolveDistrictAtLngLat(lastKnownLocation[0], lastKnownLocation[1])
    .then((feature) => {
      if (!feature) {
        return;
      }
      const districtId = getDistrictId(feature);
      if (!districtId) {
        return;
      }
      const districtName = getDistrictName(feature) || null;
      if (
        saveProfileLocation(
          profile,
          {
            lng: lastKnownLocation[0],
            lat: lastKnownLocation[1],
            districtId,
            districtName,
            source: 'geolocated',
          },
          {
            origin: 'geolocated',
            forcePersist: true,
            syncBackend: false,
          }
        )
      ) {
        savePlayers();
        updateHomePresenceIndicator();
      }
    })
    .catch((error) => {
      console.warn('Failed to refine precise location', error);
    })
    .finally(() => {
      resolvingPreciseLocation = false;
    });
}

function renderAppVersionBadge() {
  const badge = document.getElementById('app-version-badge');
  if (!badge) {
    return;
  }
  const parts = [];
  if (APP_VERSION && APP_VERSION !== 'dev') {
    parts.push(APP_VERSION);
  }
  if (APP_SNAPSHOT && APP_SNAPSHOT !== 'app.js') {
    parts.push(APP_SNAPSHOT);
  }
  if (!parts.length) {
    parts.push('dev build');
  }
  badge.textContent = parts.join(' • ');
  badge.title = parts.join(' • ');
}

function updateHomePresenceIndicator() {
  if (!homePresenceIndicator) {
    return;
  }

  let statusText = 'Unknown location';
  let statusClass = 'neutral';
  let titleText = '';

  if (!currentUser || !players[currentUser]) {
    statusText = 'Not signed in';
    titleText = 'Sign in to track your location history.';
  } else {
    const profile = ensurePlayerProfile(currentUser);
    if (!profile.homeDistrictId) {
      statusText = 'Home not set';
      titleText = 'Choose a home district to start defending.';
    } else {
      let preciseInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
      if ((!preciseInfo || !preciseInfo.id) && lastPreciseLocationInfo && lastPreciseLocationInfo.id) {
        preciseInfo = {
          id: safeId(lastPreciseLocationInfo.id),
          name: lastPreciseLocationInfo.name || `District ${lastPreciseLocationInfo.id}`,
          source: 'cached',
        };
      }
      if (!preciseInfo || !preciseInfo.id) {
        ensurePreciseLocationResolution(profile);
        const profileSummary = getProfileLastKnownSummary(profile);
        if (profileSummary) {
          const isHome =
            profile.homeDistrictId && profileSummary.id
              ? safeId(profile.homeDistrictId) === safeId(profileSummary.id)
              : false;
          statusText = `Last known: ${profileSummary.name}`;
          statusClass = isHome ? 'home' : 'enemy';
          titleText = 'Last reported position from the server.';
        } else {
          const fallbackInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
          if (fallbackInfo && fallbackInfo.source === 'home-fallback') {
            statusText = 'Last known: Home district (fallback)';
            statusClass = 'neutral';
            titleText = 'No recent location data. Showing home district as a fallback.';
          } else if (fallbackInfo && fallbackInfo.id) {
            const label = fallbackInfo.name || `District ${fallbackInfo.id}`;
            statusText = `Last known: ${label}`;
            statusClass = 'enemy';
            titleText = 'Location derived from your most recent activity.';
          } else {
            statusText = 'Unknown location';
            titleText = 'No recent location data available.';
          }
        }
      } else {
        const atHome = safeId(profile.homeDistrictId) === safeId(preciseInfo.id);
        if (atHome) {
          statusText = 'Last known: Home district';
          statusClass = 'home';
          titleText = 'Based on your last confirmed position.';
        } else {
          const label = preciseInfo.name || `District ${preciseInfo.id}`;
          statusText = `Last known: ${label}`;
          statusClass = 'enemy';
          titleText = 'Location derived from your most recent activity.';
        }
      }
    }
  }

  homePresenceIndicator.textContent = statusText;
  homePresenceIndicator.className = `home-presence ${statusClass}`;
  homePresenceIndicator.title = titleText;
}

function ensureActionContextMenu() {
  if (actionContextMenu) {
    return actionContextMenu;
  }
  if (!mapContainer) {
    return null;
  }

  const menu = document.createElement('div');
  menu.className = 'context-menu hidden';

  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.className = 'context-menu-item';
  checkButton.textContent = 'Check In Here';

  const rangedButton = document.createElement('button');
  rangedButton.type = 'button';
  rangedButton.className = 'context-menu-item';
  rangedButton.textContent = 'Ranged Attack (10 pts)';

  const chargeButton = document.createElement('button');
  chargeButton.type = 'button';
  chargeButton.className = 'context-menu-item';
  chargeButton.textContent = 'Charge Attack';

  menu.appendChild(checkButton);
  menu.appendChild(rangedButton);
  menu.appendChild(chargeButton);
  mapContainer.appendChild(menu);

  checkButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (checkButton.disabled) {
      return;
    }
    const contextCoords = actionContextMenuLngLat ? [...actionContextMenuLngLat] : null;
    const contextPoint = actionContextMenuPoint ? { ...actionContextMenuPoint } : null;
    const targetId = menu.targetDistrictId ? safeId(menu.targetDistrictId) : null;
    const targetName = menu.targetDistrictName || null;
    const contextIsLocal = Boolean(menu.isLocal);
    hideActionContextMenu();
    try {
      await handleCheckIn({
        contextCoords,
        contextPoint,
        targetDistrictId: targetId,
        targetDistrictName: targetName,
        contextIsLocal,
      });
    } catch (error) {
      console.warn('Failed to check in from context menu', error);
    }
  });

  chargeButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (chargeButton.disabled) {
      return;
    }
    hideActionContextMenu();
    handleChargeAttack();
  });

  rangedButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (rangedButton.disabled) {
      return;
    }
    let targetId = menu.targetDistrictId;
    let targetName = menu.targetDistrictName;

    if ((!targetId || !targetName) && actionContextMenuLngLat) {
      try {
        const feature = await resolveDistrictAtLngLat(actionContextMenuLngLat[0], actionContextMenuLngLat[1]);
        if (feature) {
          const derivedId = getDistrictId(feature);
          if (derivedId) {
            targetId = safeId(derivedId);
            targetName = getDistrictName(feature) || `District ${targetId}`;
          }
        }
      } catch (lookupError) {
        console.warn('Failed to resolve district from context menu coordinates', lookupError);
      }
    }

    if ((!targetId || !targetName) && currentUser && players[currentUser]) {
      const profile = ensurePlayerProfile(currentUser);
      if (profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
        targetId = safeId(profile.lastKnownLocation.districtId);
        targetName = profile.lastKnownLocation.districtName || `District ${targetId}`;
      }
    }

    const contextCoords = actionContextMenuLngLat ? [...actionContextMenuLngLat] : null;
    const contextPoint = actionContextMenuPoint ? { ...actionContextMenuPoint } : null;
    hideActionContextMenu();
    if (!targetId || !targetName) {
      updateStatus('Select a valid district to attack.');
      return;
    }
    try {
      await handleRangedAttack({ districtId: targetId, districtName: targetName, contextCoords, contextPoint });
    } catch (error) {
      console.warn('Failed to perform ranged attack', error);
    }
  });

  actionContextMenu = {
    element: menu,
    checkButton,
    rangedButton,
    chargeButton,
    targetDistrictId: null,
    targetDistrictName: null,
    isLocal: false,
  };
  return actionContextMenu;
}

function hideActionContextMenu() {
  if (!actionContextMenu || !actionContextMenuVisible) {
    return;
  }
  actionContextMenu.element.classList.add('hidden');
  actionContextMenuVisible = false;
  actionContextMenuLngLat = null;
  actionContextMenuPoint = null;
  actionContextMenu.targetDistrictId = null;
  actionContextMenu.targetDistrictName = null;
  actionContextMenu.isLocal = false;
}

function showActionContextMenu(lng, lat, point, options = {}) {
  const isTouchTrigger = Boolean(options && options.isTouch);
  const menu = ensureActionContextMenu();
  if (!menu || !mapContainer) {
    return;
  }

  actionContextMenuLngLat = [lng, lat];
  const fallbackProjection =
    map && typeof map.project === 'function'
      ? map.project([lng, lat])
      : { x: mapContainer.clientWidth / 2, y: mapContainer.clientHeight / 2 };
  const anchorPoint =
    point && typeof point.x === 'number' && typeof point.y === 'number'
      ? { x: point.x, y: point.y }
      : { x: fallbackProjection.x, y: fallbackProjection.y };
  actionContextMenuPoint = { x: anchorPoint.x, y: anchorPoint.y };
  const element = menu.element;
  element.classList.remove('hidden');
  element.style.left = '0px';
  element.style.top = '0px';
  if (isTouchTrigger) {
    element.classList.add('context-menu--touch');
    suppressNextBuildingTap();
  } else {
    element.classList.remove('context-menu--touch');
  }

  menu.targetDistrictId = null;
  menu.targetDistrictName = null;
  menu.isLocal = false;

  if (menu.checkButton) {
    menu.checkButton.style.display = 'none';
    menu.checkButton.disabled = true;
  }
  if (menu.rangedButton) {
    menu.rangedButton.style.display = 'none';
    menu.rangedButton.disabled = true;
  }
  if (menu.chargeButton) {
    menu.chargeButton.style.display = 'block';
    menu.chargeButton.disabled = true;
  }

  const positionMenu = () => {
    if (!actionContextMenuVisible || !mapContainer) {
      return;
    }
    const pointToUse = actionContextMenuPoint || anchorPoint;
    const menuWidth = element.offsetWidth;
    const menuHeight = element.offsetHeight;
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    const padding = 8;

    let left = Math.round(pointToUse.x);
    let top = Math.round(pointToUse.y);

    if (left + menuWidth + padding > containerWidth) {
      left = containerWidth - menuWidth - padding;
    }
    if (top + menuHeight + padding > containerHeight) {
      top = containerHeight - menuHeight - padding;
    }
    left = Math.max(padding, left);
    top = Math.max(padding, top);

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  };
  const profile = currentUser ? ensurePlayerProfile(currentUser) : null;

  const applyButtonStates = () => {
    if (!menu) {
      return;
    }
    const nowLocal = Date.now();
    const chargeOnCooldown = profile ? isActionOnCooldown(profile, COOLDOWN_KEYS.CHARGE, nowLocal) : true;
    const chargeMultiplier = profile ? (profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1) : 1;
    const homeId = profile && profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
    const targetId = menu.targetDistrictId ? safeId(menu.targetDistrictId) : null;
    const locationInfo = profile ? getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true }) : null;
    const locationSource = locationInfo ? locationInfo.source : null;
    const localId = locationInfo && locationInfo.id ? safeId(locationInfo.id) : null;
    const lastKnownId =
      profile && profile.lastKnownLocation && profile.lastKnownLocation.districtId
        ? safeId(profile.lastKnownLocation.districtId)
        : null;
    const matchesLastKnown = Boolean(profile && targetId && lastKnownId && lastKnownId === targetId);
    const matchesLocalPosition = Boolean(profile && targetId && localId && localId === targetId);
    const isPreciseLocal =
      matchesLocalPosition && (locationSource === 'map' || locationSource === 'geolocated');
    const hasLocalPresence =
      matchesLocalPosition &&
      (locationSource === 'map' || locationSource === 'geolocated' || locationSource === 'cached' || locationSource === 'profile');
    const willDefend = profile && targetId && homeId && homeId === targetId;
    const allowCheck = profile && targetId && (willDefend || matchesLocalPosition || matchesLastKnown);
    const expectedLocalMultiplier = !profile
      ? 1
      : willDefend
      ? chargeMultiplier
      : isPreciseLocal
      ? chargeMultiplier * 2
      : chargeMultiplier;
    const checkActionKey = willDefend ? COOLDOWN_KEYS.DEFEND : COOLDOWN_KEYS.ATTACK;
    const checkMode =
      willDefend && (locationSource === 'home-remote' || locationSource === 'home-fallback') ? 'remote' : 'local';
    const checkOnCooldown = profile ? isActionOnCooldown(profile, checkActionKey, nowLocal) : true;
    const attackOnCooldown = profile ? isActionOnCooldown(profile, COOLDOWN_KEYS.ATTACK, nowLocal) : true;
    const enemyLocalAttack = Boolean(
      profile &&
      hasLocalPresence &&
      (!homeId || homeId !== localId)
    );

    if (menu.chargeButton) {
      menu.chargeButton.style.display = 'block';
      if (!profile) {
        menu.chargeButton.disabled = true;
        menu.chargeButton.textContent = 'Log in to charge';
        menu.chargeButton.title = 'Log in to start charging.';
      } else {
        menu.chargeButton.disabled = chargeOnCooldown;
        const baseText = willDefend ? 'Charge Defend' : 'Charge Attack';
        const chargedText = willDefend ? 'Recharge Defend' : 'Recharge Attack';
        menu.chargeButton.textContent = profile.nextCheckinMultiplier > 1 ? chargedText : baseText;
        if (chargeOnCooldown) {
          menu.chargeButton.title = 'Charge cooldown active. Wait until it completes to charge again.';
        } else {
          menu.chargeButton.title = willDefend
            ? 'Charge to defend your district with a boosted check-in.'
            : 'Charge to start a countdown and multiply your next attack.';
        }
      }
    }

    if (menu.checkButton) {
      if (!profile) {
        menu.checkButton.style.display = 'block';
        menu.checkButton.disabled = true;
        menu.checkButton.textContent = 'Log in to check in';
        menu.checkButton.title = 'Log in and enable geolocation to check in here.';
      } else if (allowCheck) {
        const targetLabel = menu.targetDistrictName || (targetId ? `District ${targetId}` : 'district');
        menu.checkButton.style.display = 'block';
        menu.checkButton.disabled = checkOnCooldown;
        if (checkOnCooldown) {
          const label = formatCooldownLabel(checkActionKey, checkMode === 'remote' ? 'remote' : null);
          menu.checkButton.textContent = `${label} (Cooldown)`;
          menu.checkButton.title = `${label} cooldown active. Wait before checking in again.`;
        } else if (willDefend) {
          const defendLabel = targetId && homeId && targetId === homeId ? 'Defend Home' : `Defend ${targetLabel}`;
          menu.checkButton.textContent = expectedLocalMultiplier > 1 ? `${defendLabel} (x${expectedLocalMultiplier})` : defendLabel;
          menu.checkButton.title = 'Defend your home district and earn points.';
        } else {
          menu.checkButton.textContent = expectedLocalMultiplier > 1 ? `Check In (x${expectedLocalMultiplier})` : 'Check In Here';
          menu.checkButton.title = expectedLocalMultiplier > 1
            ? `Earn x${expectedLocalMultiplier} points for this check-in.`
            : 'Log your presence in this district.';
        }
      } else {
        menu.checkButton.style.display = 'none';
      }
    }

    if (menu.rangedButton) {
      if (profile && !willDefend && !enemyLocalAttack && menu.targetDistrictId) {
        menu.rangedButton.style.display = 'block';
        menu.rangedButton.disabled = attackOnCooldown;
        const rangedLabel = chargeMultiplier > 1 ? `Ranged Attack (x${chargeMultiplier})` : 'Ranged Attack (10 pts)';
        menu.rangedButton.textContent = attackOnCooldown ? 'Ranged Attack (Cooldown)' : rangedLabel;
        menu.rangedButton.title = attackOnCooldown
          ? 'Attack cooldown active. Wait before launching another ranged attack.'
          : `Launch a ranged attack for ${10 * chargeMultiplier} points.`;
      } else if (!profile && menu.targetDistrictId) {
        menu.rangedButton.style.display = 'block';
        menu.rangedButton.disabled = true;
        menu.rangedButton.textContent = 'Log in to attack';
        menu.rangedButton.title = 'Log in to launch ranged attacks.';
      } else {
        menu.rangedButton.style.display = 'none';
      }
    }

    const visibleItems = [menu.checkButton, menu.rangedButton, menu.chargeButton].filter(
      (btn) => btn && btn.style.display !== 'none'
    );
    visibleItems.forEach((btn, index) => {
      btn.style.borderTop = index === 0 ? 'none' : '1px solid rgba(26, 26, 26, 0.08)';
    });
  };

  actionContextMenuVisible = true;
  applyButtonStates();
  positionMenu();

  resolveDistrictAtLngLat(lng, lat)
    .then((feature) => {
      if (!actionContextMenuVisible || !menu) {
        return;
      }
      let targetId = null;
      let targetName = null;
      if (feature) {
        targetId = getDistrictId(feature);
        targetName = getDistrictName(feature) || (targetId ? `District ${targetId}` : null);
      }

      if (!targetId || !targetName) {
        if (profile && profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
          menu.targetDistrictId = safeId(profile.lastKnownLocation.districtId);
          menu.targetDistrictName = profile.lastKnownLocation.districtName || `District ${menu.targetDistrictId}`;
          menu.isLocal = false;
          applyButtonStates();
          positionMenu();
        } else {
          menu.targetDistrictId = null;
          menu.targetDistrictName = null;
          applyButtonStates();
          positionMenu();
        }
        return;
      }

      menu.targetDistrictId = safeId(targetId);
      menu.targetDistrictName = targetName;
      const locationInfoUpdate = profile ? getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true }) : null;
      const locationSourceUpdate = locationInfoUpdate ? locationInfoUpdate.source : null;
      const localId = locationInfoUpdate && locationInfoUpdate.id ? safeId(locationInfoUpdate.id) : null;
      const isPreciseLocal = Boolean(
        profile &&
        localId &&
        menu.targetDistrictId &&
        localId === menu.targetDistrictId &&
        (locationSourceUpdate === 'map' || locationSourceUpdate === 'geolocated')
      );
      menu.isLocal = isPreciseLocal;
      applyButtonStates();
      positionMenu();
    })
    .catch((error) => {
      console.warn('Failed to resolve district for context menu', error);
      applyButtonStates();
      positionMenu();
    });

  positionMenu();
}

function buildHomeDistrictOptions() {
  if (!districtGeoJson || !Array.isArray(districtGeoJson.features)) {
    return [];
  }
  const seen = new Set();
  const options = [];
  const map = new Map();
  districtGeoJson.features.forEach((feature, index) => {
    let id = getDistrictId(feature);
    if (!id) {
      const props = feature.properties || {};
      const fallbackId =
        props.kod_mc ||
        props.KOD_MC ||
        props.kod_uzohmp ||
        props.KOD_UZOHMP ||
        props.objectid ||
        props.OBJECTID ||
        feature.id ||
        `feature-${index}`;
      id = safeId(fallbackId);
    }
    if (!id || seen.has(id)) {
      return;
    }
    const rawName = getDistrictName(feature) || `District ${id}`;
    const name = typeof rawName === 'string' ? rawName.trim() || `District ${id}` : `District ${id}`;
    const option = { id, name, feature };
    seen.add(id);
    options.push(option);
    map.set(id, option);
  });
  options.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  homeDistrictOptionMap = map;
  return options;
}

function resolveDistrictAtLngLat(lng, lat) {
  return ensureDistrictDataLoaded().then(() => {
    let feature = null;
    if (mapReady && map && typeof map.project === 'function' && typeof map.queryRenderedFeatures === 'function' && map.getLayer('districts-fill')) {
      const point = map.project([lng, lat]);
      const features = map.queryRenderedFeatures([point.x, point.y], { layers: ['districts-fill'] });
      if (features && features.length) {
        feature = features[0];
      }
    }
    if (!feature && districtGeoJson) {
      feature = findDistrictFeatureByPoint(lng, lat);
    }
    return feature || null;
  });
}

function getHomeDistrictOptions() {
  if (homeDistrictOptions && homeDistrictOptions.length) {
    return Promise.resolve(homeDistrictOptions);
  }
  return ensureDistrictDataLoaded().then(() => {
    homeDistrictOptions = buildHomeDistrictOptions();
    return homeDistrictOptions;
  });
}

function renderHomeDistrictOptions(filterTerm = '') {
  if (!homeDistrictListElement) {
    return;
  }

  const searchTerm = filterTerm.trim().toLowerCase();
  homeDistrictListElement.innerHTML = '';

  if (!homeDistrictOptions || !homeDistrictOptions.length) {
    const empty = document.createElement('li');
    empty.className = 'home-district-empty';
    empty.textContent = 'No districts available. Try again later.';
    empty.setAttribute('role', 'presentation');
    homeDistrictListElement.appendChild(empty);
    if (homeDistrictConfirmButton) {
      homeDistrictConfirmButton.disabled = true;
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  let matchCount = 0;

  homeDistrictOptions.forEach((option) => {
    const matches =
      !searchTerm ||
      option.name.toLowerCase().includes(searchTerm) ||
      option.id.toLowerCase().includes(searchTerm);
    if (!matches) {
      return;
    }

    const li = document.createElement('li');
    li.className = 'home-district-option';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-district-option-button';
    button.textContent = option.name;
    button.dataset.districtId = option.id;
    button.dataset.districtName = option.name;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', option.id === homeDistrictModalSelectedId ? 'true' : 'false');
    if (option.id === homeDistrictModalSelectedId) {
      button.classList.add('selected');
      li.classList.add('selected');
    }
    li.appendChild(button);
    fragment.appendChild(li);
    matchCount += 1;
  });

  if (!matchCount) {
    const empty = document.createElement('li');
    empty.className = 'home-district-empty';
    empty.textContent = 'No districts match your search.';
    empty.setAttribute('role', 'presentation');
    homeDistrictListElement.appendChild(empty);
    if (homeDistrictConfirmButton) {
      homeDistrictConfirmButton.disabled = true;
    }
    return;
  }

  homeDistrictListElement.appendChild(fragment);

  if (homeDistrictConfirmButton) {
    homeDistrictConfirmButton.disabled = !homeDistrictModalSelectedId;
  }
}

function selectHomeDistrictOption(districtId) {
  if (!districtId || !homeDistrictOptionMap.has(districtId)) {
    return;
  }
  const option = homeDistrictOptionMap.get(districtId);
  homeDistrictModalSelectedId = option.id;
  if (homeDistrictConfirmButton) {
    homeDistrictConfirmButton.disabled = false;
  }
  if (homeDistrictListElement) {
    const buttons = homeDistrictListElement.querySelectorAll('.home-district-option-button');
    buttons.forEach((button) => {
      if (button.dataset.districtId === districtId) {
        button.classList.add('selected');
        button.parentElement?.classList.add('selected');
        button.setAttribute('aria-selected', 'true');
      } else {
        button.classList.remove('selected');
        button.parentElement?.classList.remove('selected');
        button.setAttribute('aria-selected', 'false');
      }
    });
  }
}

function isHomeDistrictModalOpen() {
  return homeDistrictModal && !homeDistrictModal.classList.contains('hidden');
}

function closeHomeDistrictModal() {
  if (!homeDistrictModal || homeDistrictModal.classList.contains('hidden')) {
    return;
  }
  homeDistrictModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  if (homeDistrictSearchInput) {
    homeDistrictSearchInput.value = '';
  }
  if (homeDistrictConfirmButton) {
    homeDistrictConfirmButton.disabled = true;
  }
  homeDistrictModalSelectedId = null;
  if (homeDistrictListElement) {
    homeDistrictListElement.innerHTML = '';
  }
  if (homeDistrictModalTriggerElement && typeof homeDistrictModalTriggerElement.focus === 'function') {
    homeDistrictModalTriggerElement.focus({ preventScroll: true });
  }
  homeDistrictModalTriggerElement = null;
}

function openHomeDistrictModal() {
  if (!currentUser) {
    updateStatus('Log in to choose a home district.');
    return;
  }
  homeDistrictModalTriggerElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  getHomeDistrictOptions()
    .then((options) => {
      if (!options || !options.length) {
        updateStatus('Unable to load Prague districts. Try again later.');
        return;
      }

      const profile = ensurePlayerProfile(currentUser);
      const fallbackId =
        (profile && profile.homeDistrictId) ||
        (currentDistrictId ? safeId(currentDistrictId) : null) ||
        options[0].id;

      if (fallbackId && homeDistrictOptionMap.has(fallbackId)) {
        homeDistrictModalSelectedId = fallbackId;
      } else {
        homeDistrictModalSelectedId = null;
      }

      renderHomeDistrictOptions('');

      if (!homeDistrictModal) {
        return;
      }
      homeDistrictModal.classList.remove('hidden');
      document.body.classList.add('modal-open');
      queueMicrotask(() => {
        if (homeDistrictSearchInput) {
          homeDistrictSearchInput.focus({ preventScroll: true });
        }
      });
    })
    .catch((error) => {
      console.warn('Failed to open home district modal', error);
      updateStatus('Unable to load districts right now.');
    });
}

function confirmHomeDistrictSelection() {
  if (!currentUser || !homeDistrictModalSelectedId) {
    closeHomeDistrictModal();
    return;
  }
  if (!homeDistrictOptionMap.has(homeDistrictModalSelectedId)) {
    updateStatus('Selected district is unavailable. Please choose another.');
    return;
  }

  const option = homeDistrictOptionMap.get(homeDistrictModalSelectedId);
  const profile = ensurePlayerProfile(currentUser);
  const previousId = profile.homeDistrictId;
  profile.homeDistrictId = option.id;
  profile.homeDistrictName = option.name;
  savePlayers();
  renderPlayerState();

  const changed = previousId !== option.id;
  if (changed) {
    updateStatus(`${option.name} is now your home district. Defend it to earn points!`);
  } else {
    updateStatus(`${option.name} is already your home district.`);
  }

  closeHomeDistrictModal();
}

function handleHomeDistrictSearchInput(event) {
  const value = event?.target?.value || '';
  renderHomeDistrictOptions(value);
}

let map;
let mapReady = false;
let geolocateControl;
let hasTriggeredGeolocate = false;
const pendingActions = [];
let currentDistrictId = null;
let currentDistrictName = null;
let hoveredDistrictId = null;
let districtPopup = null;
let lastKnownLocation = null;
let lastPreciseLocationInfo = null;
let resolvingPreciseLocation = false;
let activeBuildingGifMarker = null;
let activeParkGifMarker = null;
let activeAttackHitmarker = null;
const activeCooldowns = new Map();
let cooldownTickerId = null;
let districtGeoJson = null;
let districtGeoJsonPromise = null;
let homeDistrictOptions = null;
let homeDistrictOptionMap = new Map();
let homeDistrictModalSelectedId = null;
let homeDistrictModalTriggerElement = null;
let actionContextMenu = null;
let actionContextMenuVisible = false;
let actionContextMenuLngLat = null;
let actionContextMenuPoint = null;
let mobileContextMenuTimerId = null;
let mobileContextMenuStartPoint = null;
let mobileContextMenuStartLngLat = null;
let mobileContextMenuActive = false;
let mobileContextMenuSuppressClick = false;
let mobileContextMenuSuppressClickResetId = null;
let mobileContextMenuHandlersBound = false;
let recentCheckinsShowAll = false;
let recentCheckinsLastTrigger = null;
let friendsLastTrigger = null;
let liveLocationWatchId = null;
let lastLiveLocationUpdate = 0;
let friendsState = {
  loading: false,
  loaded: false,
  error: null,
  items: [],
};
let friendRequestsState = {
  loading: false,
  loaded: false,
  error: null,
  incoming: [],
  outgoing: [],
};
let friendsManageOpen = false;
let districtLastTrigger = null;
let characterLastTrigger = null;
let lastHoverFeature = null;
let lastHoverLngLat = null;
let lastHoverDistrictId = null;
let isPointerOverDistrict = false;
let districtScores = {};

const STORAGE_KEY = 'pragueExplorerPlayers';
const COOLDOWN_KEYS = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  CHARGE: 'charge',
};

const COOLDOWN_DURATIONS = {
  attack: 3 * 60 * 1000,
  defendLocal: 3 * 60 * 1000,
  defendRemote: 10 * 60 * 1000,
  charge: 2 * 60 * 1000,
};
const CHARGE_ATTACK_MULTIPLIER = 3;
const MIN_PASSWORD_LENGTH = 4;
const DEV_USERNAME = 'dev';
const DEV_DEFAULT_PASSWORD = 'deve';
const LAST_SIGNED_IN_USER_KEY = 'pragueExplorerLastUser';
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

let isSessionAuthenticated = false;
let activePlayerBackendId = null;
let locationSyncQueue = Promise.resolve();
let statsSyncQueue = Promise.resolve();

const DISTRICT_NAME_FIELDS = [
  'nazev_mc',
  'NAZEV_MC',
  'nazev_1',
  'NAZEV_1',
  'naz_uzohmp',
  'NAZ_UZOHMP',
  'name',
  'NAME',
  'nazev',
  'NAZEV',
];

function getDistrictName(feature) {
  if (!feature || !feature.properties) {
    return null;
  }

  for (const field of DISTRICT_NAME_FIELDS) {
    const value = feature.properties[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function safeId(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value);
}

function normaliseNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const LOCATION_SOURCE_VALUES = new Set([
  'geolocated',
  'map',
  'profile',
  'cached',
  'home-fallback',
  'home-remote',
]);

function normaliseLocationSource(value, fallback = null) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim().toLowerCase();
  return LOCATION_SOURCE_VALUES.has(trimmed) ? trimmed : fallback;
}

function getProfileLastKnownSummary(profile) {
  if (!profile || !profile.lastKnownLocation) {
    return null;
  }
  const raw = profile.lastKnownLocation;
  let id = raw.districtId ? safeId(raw.districtId) : null;
  let name =
    typeof raw.districtName === 'string' && raw.districtName.trim() ? raw.districtName.trim() : null;
  const lng = typeof raw.lng === 'number' && Number.isFinite(raw.lng) ? raw.lng : null;
  const lat = typeof raw.lat === 'number' && Number.isFinite(raw.lat) ? raw.lat : null;

  if (!id && lng !== null && lat !== null && districtGeoJson && Array.isArray(districtGeoJson.features)) {
    const feature = findDistrictFeatureByPoint(lng, lat);
    if (feature) {
      const inferredId = getDistrictId(feature);
      if (inferredId) {
        id = safeId(inferredId);
        if (!name) {
          name = getDistrictName(feature) || null;
        }
      }
    }
  }

  if (!name && id) {
    name = `District ${id}`;
  }

  if (!name && lng !== null && lat !== null) {
    name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  if (!name) {
    return null;
  }

  return {
    id: id ? safeId(id) : null,
    name,
  };
}

function isValidUsername(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return USERNAME_PATTERN.test(value.trim());
}

function getCrypto() {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof self !== 'undefined' && self.crypto) {
    return self.crypto;
  }
  if (typeof crypto !== 'undefined') {
    return crypto;
  }
  return null;
}

function arrayBufferToBase64(buffer) {
  if (!buffer) {
    return '';
  }
  let bytes;
  if (buffer instanceof ArrayBuffer) {
    bytes = new Uint8Array(buffer);
  } else if (ArrayBuffer.isView(buffer)) {
    bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    return '';
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(binary);
  }
  return binary;
}

function generateSalt() {
  const cryptoObj = getCrypto();
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    return arrayBufferToBase64(bytes);
  }
  const entropy = `${Date.now()}-${Math.random()}-${Math.random()}`;
  if (typeof TextEncoder !== 'undefined') {
    return arrayBufferToBase64(new TextEncoder().encode(entropy));
  }
  const fallbackBytes = new Uint8Array(entropy.split('').map((char) => char.charCodeAt(0)));
  return arrayBufferToBase64(fallbackBytes);
}

async function hashPassword(password, salt) {
  const cryptoObj = getCrypto();
  const material = `${salt}:${password}`;
  if (cryptoObj && cryptoObj.subtle && typeof cryptoObj.subtle.digest === 'function' && typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(material);
    const digest = await cryptoObj.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(digest);
  }
  if (typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    return arrayBufferToBase64(encoder.encode(material));
  }
  const fallbackBytes = material.split('').map((char) => char.charCodeAt(0));
  return arrayBufferToBase64(new Uint8Array(fallbackBytes));
}

function isDevUser(username) {
  return typeof username === 'string' && username.toLowerCase() === 'dev';
}

function getDistrictId(feature) {
  if (!feature) {
    return null;
  }

  if (feature.id !== undefined && feature.id !== null) {
    return safeId(feature.id);
  }

  if (feature.properties) {
    for (const field of DISTRICT_ID_FIELDS) {
      const value = feature.properties[field];
      if (value !== undefined && value !== null) {
        return safeId(value);
      }
    }
  }

  return null;
}

function buildDistrictFilter(value) {
  const normalized = String(value);
  const clauses = [
    ['==', ['to-string', ['id']], normalized],
  ];
  for (const field of DISTRICT_ID_FIELDS) {
    clauses.push(['==', ['to-string', ['get', field]], normalized]);
  }
  return ['any', ...clauses];
}

function applyThemeToMap(theme) {
  if (!map) {
    return;
  }
  const settings = MAP_THEME_SETTINGS[theme] || MAP_THEME_SETTINGS.light;
  if (map.getLayer('background')) {
    map.setPaintProperty('background', 'background-color', settings.background);
  }
  if (map.getLayer('prague-mask-fill')) {
    map.setPaintProperty('prague-mask-fill', 'fill-color', settings.maskFill);
    map.setPaintProperty('prague-mask-fill', 'fill-opacity', settings.maskOpacity);
  }
  if (map.getLayer('districts-fill')) {
    map.setPaintProperty('districts-fill', 'fill-color', settings.districtFill);
    map.setPaintProperty('districts-fill', 'fill-opacity', settings.districtOpacity);
  }
  if (map.getLayer('buildings-3d')) {
    map.setPaintProperty('buildings-3d', 'fill-extrusion-color', settings.buildingColor);
  }
  if (map.getLayer('buildings-outline')) {
    map.setPaintProperty('buildings-outline', 'line-color', settings.buildingOutline);
  }
}

function ensureWelcomeLogoTheme(theme) {
  const logo = document.querySelector('.welcome-logo');
  if (!logo) {
    return;
  }

  if (!logo.dataset.originalSrc) {
    logo.dataset.originalSrc = logo.getAttribute('src') || '';
  }

  if (theme !== 'dark') {
    if (logo.dataset.originalSrc) {
      logo.setAttribute('src', logo.dataset.originalSrc);
    }
    return;
  }

  if (logo.dataset.darkModeSrc) {
    logo.setAttribute('src', logo.dataset.darkModeSrc);
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const threshold = 240;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r >= threshold && g >= threshold && b >= threshold) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const processedSrc = canvas.toDataURL('image/png');
      logo.dataset.darkModeSrc = processedSrc;
      logo.setAttribute('src', processedSrc);
    } catch (error) {
      console.error('Failed to adapt welcome logo for dark mode', error);
    }
  };
  img.onerror = () => {
    logo.setAttribute('src', logo.dataset.originalSrc);
  };
  img.src = logo.dataset.originalSrc;
}

function resolveContextLngLat({ lngLat, point }) {
  if (lngLat && Array.isArray(lngLat) && lngLat.length === 2) {
    const [lng, lat] = lngLat;
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat];
    }
  }

  if (point && typeof point.x === 'number' && typeof point.y === 'number' && map && typeof map.unproject === 'function') {
    const projected = map.unproject([point.x, point.y]);
    if (projected && Number.isFinite(projected.lng) && Number.isFinite(projected.lat)) {
      return [projected.lng, projected.lat];
    }
  }

  return null;
}

function showAttackHitmarker(context = {}) {
  if (!map) {
    return;
  }

  const lngLat = resolveContextLngLat(context);
  if (!lngLat) {
    return;
  }

  if (activeAttackHitmarker) {
    activeAttackHitmarker.remove();
    activeAttackHitmarker = null;
  }

  const markerElement = document.createElement('div');
  markerElement.className = 'attack-hitmarker-marker';

  const frame = document.createElement('div');
  frame.className = 'attack-hitmarker-frame';

  const img = document.createElement('img');
  img.src = context.variant === 'defend' ? DEFEND_HITMARKER_GIF_URL : HITMARKER_GIF_URL;
  img.alt = '';
  frame.appendChild(img);
  markerElement.appendChild(frame);

  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: 'center',
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
  })
    .setLngLat(lngLat)
    .addTo(map);

  activeAttackHitmarker = marker;

  window.setTimeout(() => {
    if (activeAttackHitmarker === marker) {
      marker.remove();
      activeAttackHitmarker = null;
    } else {
      marker.remove();
    }
  }, 900);
}

function ensureDistrictPopup() {
  if (!districtPopup) {
    districtPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      className: 'district-tooltip-popup',
    });
  }
  return districtPopup;
}

function hideDistrictTooltip() {
  if (districtPopup) {
    districtPopup.remove();
  }
}

function hideDistrictHover() {
  if (!map) {
    return;
  }

  if (map.getLayer('district-hover-glow')) {
    map.setFilter('district-hover-glow', DISTRICT_FILTER_NONE);
    map.setPaintProperty('district-hover-glow', 'line-opacity', 0);
    map.setPaintProperty('district-hover-glow', 'line-color', DISTRICT_GLOW_DEFAULT_COLOR);
  }

  if (map.getLayer('district-hover-line')) {
    map.setFilter('district-hover-line', DISTRICT_FILTER_NONE);
    map.setPaintProperty('district-hover-line', 'line-opacity', 0);
    map.setPaintProperty('district-hover-line', 'line-width', DISTRICT_GLOW_LINE_WIDTH);
    map.setPaintProperty('district-hover-line', 'line-color', DISTRICT_GLOW_DEFAULT_COLOR);
  }

  hoveredDistrictId = null;
}

function clearStoredHoverState() {
  lastHoverFeature = null;
  lastHoverLngLat = null;
  lastHoverDistrictId = null;
  isPointerOverDistrict = false;
}

function storeHoverState(feature, lngLat) {
  if (!feature) {
    clearStoredHoverState();
    return;
  }

  const districtId = getDistrictId(feature);
  if (!districtId) {
    clearStoredHoverState();
    return;
  }

  const normalizedId = safeId(districtId);
  const shouldCloneFeature = !lastHoverFeature || lastHoverDistrictId !== normalizedId;

  if (shouldCloneFeature) {
    const clonedProperties = feature.properties ? { ...feature.properties } : {};
    const fallbackId = feature.id !== undefined && feature.id !== null ? feature.id : normalizedId;
    lastHoverFeature = {
      id: fallbackId,
      properties: clonedProperties,
    };
  } else if (lastHoverFeature && lastHoverFeature.properties && feature.properties) {
    Object.assign(lastHoverFeature.properties, feature.properties);
  }

  lastHoverDistrictId = normalizedId;

  let lng = null;
  let lat = null;

  if (lngLat && typeof lngLat.lng === 'number' && Number.isFinite(lngLat.lng)) {
    lng = lngLat.lng;
  } else if (Array.isArray(lngLat) && lngLat.length >= 1 && Number.isFinite(Number(lngLat[0]))) {
    lng = Number(lngLat[0]);
  }

  if (lngLat && typeof lngLat.lat === 'number' && Number.isFinite(lngLat.lat)) {
    lat = lngLat.lat;
  } else if (Array.isArray(lngLat) && lngLat.length >= 2 && Number.isFinite(Number(lngLat[1]))) {
    lat = Number(lngLat[1]);
  }

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    lastHoverLngLat = null;
    isPointerOverDistrict = false;
    return;
  }

  lastHoverLngLat = { lng, lat };
  isPointerOverDistrict = true;
}

function refreshDistrictHover() {
  if (!map || !lastHoverFeature || !lastHoverLngLat || !lastHoverDistrictId || !isPointerOverDistrict) {
    return;
  }

  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  const homeDistrictId = profile && profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const isHome = Boolean(homeDistrictId && lastHoverDistrictId && homeDistrictId === lastHoverDistrictId);
  const hasHome = Boolean(homeDistrictId);

  let hoverColor = activeTheme === 'dark' ? DISTRICT_GLOW_ENEMY_COLOR_DARK : DISTRICT_GLOW_ENEMY_COLOR_LIGHT;
  if (isHome) {
    hoverColor = activeTheme === 'dark' ? DISTRICT_GLOW_HOME_COLOR_DARK : DISTRICT_GLOW_HOME_COLOR_LIGHT;
  } else if (!hasHome) {
    hoverColor = DISTRICT_GLOW_DEFAULT_COLOR;
  }

  const filterExpression = buildDistrictFilter(lastHoverDistrictId);

  if (map.getLayer('district-hover-glow')) {
    map.setLayoutProperty('district-hover-glow', 'visibility', 'visible');
    map.setFilter('district-hover-glow', filterExpression);
    map.setPaintProperty('district-hover-glow', 'line-color', hoverColor);
    map.setPaintProperty('district-hover-glow', 'line-opacity', DISTRICT_GLOW_GLOW_OPACITY);
  }

  if (map.getLayer('district-hover-line')) {
    map.setLayoutProperty('district-hover-line', 'visibility', 'visible');
    map.setFilter('district-hover-line', filterExpression);
    map.setPaintProperty('district-hover-line', 'line-color', hoverColor);
    map.setPaintProperty('district-hover-line', 'line-opacity', 0.96);
    map.setPaintProperty('district-hover-line', 'line-width', DISTRICT_GLOW_LINE_WIDTH);
  }

  hoveredDistrictId = lastHoverDistrictId;
  showDistrictTooltip(lastHoverFeature, lastHoverLngLat);

  if (map && typeof map.getCanvas === 'function') {
    const canvas = map.getCanvas();
    if (canvas && canvas.style) {
      canvas.style.cursor = 'pointer';
    }
  }
}

function highlightDistrict(feature) {
  if (!map || !feature) {
    return;
  }

  const districtId = getDistrictId(feature);
  if (!districtId) {
    clearStoredHoverState();
    hideDistrictHover();
    return;
  }
  const normalizedId = String(districtId);
  const filterExpression = buildDistrictFilter(normalizedId);

  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  const homeDistrictId = profile && profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const isHome = Boolean(homeDistrictId && districtId && homeDistrictId === districtId);
  const hasHome = Boolean(homeDistrictId);

  let hoverColor = activeTheme === 'dark' ? DISTRICT_GLOW_ENEMY_COLOR_DARK : DISTRICT_GLOW_ENEMY_COLOR_LIGHT;
  if (isHome) {
    hoverColor = activeTheme === 'dark' ? DISTRICT_GLOW_HOME_COLOR_DARK : DISTRICT_GLOW_HOME_COLOR_LIGHT;
  } else if (!hasHome) {
    hoverColor = DISTRICT_GLOW_DEFAULT_COLOR;
  }

  if (map.getLayer('district-hover-glow')) {
    map.setLayoutProperty('district-hover-glow', 'visibility', 'visible');
    map.setFilter('district-hover-glow', filterExpression);
    map.setPaintProperty('district-hover-glow', 'line-color', hoverColor);
    map.setPaintProperty('district-hover-glow', 'line-opacity', DISTRICT_GLOW_GLOW_OPACITY);
  }

  if (map.getLayer('district-hover-line')) {
    map.setLayoutProperty('district-hover-line', 'visibility', 'visible');
    map.setFilter('district-hover-line', filterExpression);
    map.setPaintProperty('district-hover-line', 'line-color', hoverColor);
    map.setPaintProperty('district-hover-line', 'line-opacity', 0.96);
    map.setPaintProperty('district-hover-line', 'line-width', DISTRICT_GLOW_LINE_WIDTH);
  }

  hoveredDistrictId = normalizedId;
}

function showDistrictTooltip(feature, lngLat) {
  if (!map) {
    return;
  }

  const name = getDistrictName(feature);
  if (!name) {
    return;
  }

  let displayName = name;
  if (/^Praha\b/i.test(displayName)) {
    displayName = displayName.replace(/^Praha\b/i, 'Prague');
  }

  const popup = ensureDistrictPopup();
  const content = document.createElement('div');
  content.className = 'district-tooltip';
  content.textContent = displayName;

  popup.setDOMContent(content).setLngLat(lngLat).addTo(map);
}

function updateCurrentDistrictFromCoordinates(lng, lat, options = {}) {
  ensureDistrictDataLoaded();

  const persist = Boolean(options && options.persist);
  const origin = normaliseLocationSource(options && options.origin ? options.origin : null, null);
  const syncBackend =
    options && Object.prototype.hasOwnProperty.call(options, 'syncBackend')
      ? Boolean(options.syncBackend)
      : true;

  const datasetReady = Boolean(districtGeoJson && Array.isArray(districtGeoJson.features));
  let currentFeature = datasetReady ? findDistrictFeatureByPoint(lng, lat) : null;
  const canUseMapQuery =
    mapReady &&
    map &&
    typeof map.project === 'function' &&
    typeof map.queryRenderedFeatures === 'function' &&
    map.getLayer('districts-fill') &&
    (typeof map.isSourceLoaded !== 'function' || map.isSourceLoaded('prague-districts'));

  if (!currentFeature && canUseMapQuery) {
    const point = map.project([lng, lat]);
    const padding = 6;
    const queryGeometry = [
      [point.x - padding, point.y - padding],
      [point.x + padding, point.y + padding],
    ];
    const features = map.queryRenderedFeatures(queryGeometry, { layers: ['districts-fill'] });
    if (features && features.length) {
      currentFeature = features[0];
    }
  }

  if (!currentFeature && !datasetReady && districtGeoJsonPromise) {
    districtGeoJsonPromise
      .then(() => {
        if (districtGeoJson) {
          updateCurrentDistrictFromCoordinates(lng, lat, options);
        }
      })
      .catch(() => {});
  }

  if (currentFeature) {
    const resolvedId = getDistrictId(currentFeature);
    currentDistrictId = resolvedId ? safeId(resolvedId) : null;
    currentDistrictName = getDistrictName(currentFeature);
    if (persist && origin === 'geolocated' && currentUser && players[currentUser] && currentDistrictId) {
      const profile = ensurePlayerProfile(currentUser);
      if (
        saveProfileLocation(
          profile,
          {
            lng,
            lat,
            districtId: currentDistrictId,
            districtName: currentDistrictName,
            source: origin,
          },
          {
            origin,
            syncBackend,
          }
        )
      ) {
        savePlayers();
        renderPlayerState();
      }
    }
  } else {
    currentDistrictId = null;
    currentDistrictName = null;
  }

  updateHomePresenceIndicator();
}

function updateStatus(message) {
  if (statusBox) {
    statusBox.textContent = message;
  }
}

function isMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(max-width: 820px)').matches;
}

function setMobileDrawerState(open) {
  if (!mobileDrawer || !drawerToggleButton || !drawerOverlay) {
    return;
  }
  const shouldOpen = Boolean(open && isMobileViewport());
  if (shouldOpen) {
    document.body.classList.add('drawer-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.remove('hidden');
    drawerOverlay.style.display = 'block';
    drawerOverlay.style.opacity = '1';
    drawerOverlay.setAttribute('aria-hidden', 'false');
    drawerToggleButton.setAttribute('aria-expanded', 'true');
    const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
    updateDrawerSummaries(profile);
    populateDrawerHomeSelect(profile);
  } else {
    document.body.classList.remove('drawer-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.classList.add('hidden');
    drawerOverlay.style.display = 'none';
    drawerOverlay.style.opacity = '0';
    drawerOverlay.setAttribute('aria-hidden', 'true');
    drawerToggleButton.setAttribute('aria-expanded', 'false');
    if (drawerHomeSaveButton) {
      drawerHomeSaveButton.disabled = true;
    }
  }
}

function toggleMobileDrawer() {
  if (!mobileDrawer) {
    return;
  }
  const shouldToggle = isMobileViewport();
  if (!shouldToggle) {
    return;
  }
  const isOpen = document.body.classList.contains('drawer-open');
  setMobileDrawerState(!isOpen);
}


function applyViewportUiState() {
  const mobile = isMobileViewport();
  if (findMeButton) {
    findMeButton.disabled = mobile;
    if (mobile) {
      findMeButton.classList.add('hidden-mobile');
    } else {
      findMeButton.classList.remove('hidden-mobile');
    }
  }
  if (!mobile) {
    setMobileDrawerState(false);
  }
}

function ensureMap(action) {
  if (mapReady) {
    action();
  } else {
    pendingActions.push(action);
  }
}

document.addEventListener('prague-themechange', (event) => {
  const nextTheme = event && event.detail && event.detail.theme === 'dark' ? 'dark' : 'light';
  activeTheme = nextTheme;
  ensureWelcomeLogoTheme(activeTheme);
  ensureMap(() => applyThemeToMap(activeTheme));
});

ensureWelcomeLogoTheme(activeTheme);
renderAppVersionBadge();
applyMarkerColorTheme(DEFAULT_MARKER_COLOR);

document.addEventListener('click', (event) => {
  if (!actionContextMenuVisible || !actionContextMenu) {
    return;
  }
  if (actionContextMenu.element.contains(event.target)) {
    return;
  }
  hideActionContextMenu();
});

function loadPlayers() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        players = parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load players from storage', error);
    players = {};
  }
  Object.keys(players).forEach((name) => {
    ensurePlayerProfile(name);
  });
}

function savePlayers() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.warn('Failed to save players to storage', error);
  }
}

function setLastSignedInUser(username) {
  try {
    if (username) {
      window.localStorage.setItem(LAST_SIGNED_IN_USER_KEY, username);
    } else {
      window.localStorage.removeItem(LAST_SIGNED_IN_USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to persist last signed-in user', error);
  }
}

function getLastSignedInUser() {
  try {
    const stored = window.localStorage.getItem(LAST_SIGNED_IN_USER_KEY);
    return typeof stored === 'string' && stored.trim() ? stored.trim() : null;
  } catch (error) {
    console.warn('Failed to read last signed-in user from storage', error);
    return null;
  }
}

function getRememberedUsernames() {
  return Object.keys(players).filter((name) => {
    if (!isValidUsername(name)) {
      return false;
    }
    const profile = players[name];
    return Boolean(profile && profile.auth && profile.auth.rememberOnDevice);
  });
}

function prefillLastSignedInUser() {
  if (!usernameInput) {
    return;
  }
  const lastUser = getLastSignedInUser();
  if (!lastUser || usernameInput.value) {
    return;
  }
  if (!isValidUsername(lastUser)) {
    setLastSignedInUser(null);
    return;
  }
  usernameInput.value = lastUser;
  if (rememberPasswordInput && players[lastUser]) {
    const profile = ensurePlayerProfile(lastUser);
    rememberPasswordInput.checked = Boolean(profile && profile.auth && profile.auth.rememberOnDevice);
  }
}

function autoLoginRememberedUser() {
  if (currentUser) {
    return;
  }
  const remembered = getRememberedUsernames();
  if (!remembered.length) {
    prefillLastSignedInUser();
    return;
  }
  const preferredRaw = getLastSignedInUser();
  const preferred = preferredRaw && isValidUsername(preferredRaw) ? preferredRaw : null;
  const username = preferred && remembered.includes(preferred) ? preferred : remembered[0];
  const profile = ensurePlayerProfile(username);
  completeAuthenticatedLogin(username, profile, {
    message: `Signed in automatically as ${username}.`,
    triggerGeolocation: false,
  });
}

async function ensureDevAccount() {
  const profile = ensurePlayerProfile(DEV_USERNAME);
  try {
    const salt = generateSalt();
    const passwordHash = await hashPassword(DEV_DEFAULT_PASSWORD, salt);
    profile.auth = {
      passwordHash,
      salt,
      createdAt: Date.now(),
      rememberOnDevice: false,
    };
    profile.skipCooldown = true;
    savePlayers();
  } catch (error) {
    console.warn('Failed to initialise dev account credentials', error);
  }
}

async function restoreSessionFromServer() {
  let sessionData;
  try {
    sessionData = await apiRequest('session/');
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      return;
    }
    if (error && error.status === 503) {
      // Backend DB schema is outdated; surface a non-fatal hint and continue without a session.
      const serverDetail = error.data && typeof error.data.detail === 'string' ? error.data.detail : 'Server database is not up to date. Please apply migrations.';
      const action = error.data && typeof error.data.action === 'string' ? error.data.action : 'run ./scripts/migrate.sh or python manage.py migrate';
      updateStatus(`${serverDetail} — To fix locally: ./scripts/setup.sh (first time), then ${action}.`);
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      return;
    }
    console.warn('Failed to verify existing session', error);
    throw error;
  }

  if (!sessionData || typeof sessionData !== 'object' || !sessionData.authenticated) {
    isSessionAuthenticated = false;
    activePlayerBackendId = null;
    return;
  }

  const apiPlayer = sessionData.player;
  if (!apiPlayer || typeof apiPlayer.username !== 'string') {
    isSessionAuthenticated = true;
    return;
  }

  const username = apiPlayer.username.trim();
  if (!isValidUsername(username)) {
    isSessionAuthenticated = true;
    return;
  }

  if (!players[username] || typeof players[username] !== 'object') {
    players[username] = {};
  }

  const profile = ensurePlayerProfile(username);
  applyServerPlayerData(profile, apiPlayer);
  profile.auth = { rememberOnDevice: true };

  isSessionAuthenticated = true;
  activePlayerBackendId = profile.backendId || null;

  completeAuthenticatedLogin(username, profile, {
    message: apiPlayer.display_name ? `Welcome back, ${apiPlayer.display_name}.` : `Welcome back, ${username}.`,
    triggerGeolocation: false,
  });
}

async function logoutCurrentSession() {
  try {
    await apiRequest('session/logout/', { method: 'POST' });
  } catch (error) {
    console.warn('Failed to terminate session', error);
  } finally {
    isSessionAuthenticated = false;
    activePlayerBackendId = null;
  }
}

function completeLogoutTransition() {
  currentUser = null;
  activePlayerBackendId = null;
  friendsState = {
    loading: false,
    loaded: false,
    error: null,
    items: [],
  };
  friendRequestsState = {
    loading: false,
    loaded: false,
    error: null,
    incoming: [],
    outgoing: [],
  };
  clearFriendLocationMarkers();
  updateFriendLocationsLayer();
  renderFriendRequestsSection();
  closeFriendsManagePanel();
  updateFriendsDrawerContent();
  renderPlayerState();
  applyMarkerColorTheme(DEFAULT_MARKER_COLOR);
  switchToWelcome();
}

function performLogout() {
  return logoutCurrentSession()
    .catch(() => null)
    .finally(() => {
      completeLogoutTransition();
    });
}

let migrationsStatusChecked = false;
let migrationsPending = false;
async function checkMigrationStatus() {
  try {
    const status = await apiRequest('migrations/status/');
    if (status && status.pending) {
      migrationsPending = true;
      const unapplied = Array.isArray(status.unapplied) ? status.unapplied : [];
      const details = unapplied.length ? `Unapplied: ${unapplied.join(', ')}` : 'Migrations pending.';
      updateStatus(`${details} — To fix locally: ./scripts/setup.sh (first time), then ./scripts/migrate.sh or python manage.py migrate.`);
    }
  } catch (e) {
    // Ignore; server may be older without the endpoint or temporarily unavailable
  } finally {
    migrationsStatusChecked = true;
  }
}

async function initialisePlayers() {
  loadPlayers();
  try {
    await ensureDevAccount();
  } catch (error) {
    console.warn('Failed to finalise player initialisation', error);
  }
  renderKnownPlayers();
  renderPlayerState();
  try {
    await restoreSessionFromServer();
  } catch (error) {
    console.warn('Unable to restore previous session', error);
  }
  if (!currentUser) {
    prefillLastSignedInUser();
  }
}

function loadDistrictScores() {
  districtScores = {};
  try {
    const stored = window.localStorage.getItem(DISTRICT_SCORES_STORAGE_KEY);
    if (!stored) {
      return;
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return;
    }
    Object.entries(parsed).forEach(([id, value]) => {
      if (!id) {
        return;
      }
      if (typeof value === 'number') {
        districtScores[id] = {
          adjustment: normaliseNumber(value, 0),
          defended: value > 0 ? normaliseNumber(value, 0) : 0,
          attacked: value < 0 ? Math.abs(normaliseNumber(value, 0)) : 0,
          name: null,
        };
        return;
      }
      if (value && typeof value === 'object') {
        districtScores[id] = {
          adjustment: normaliseNumber(value.adjustment, 0),
          defended: normaliseNumber(value.defended, 0),
          attacked: normaliseNumber(value.attacked, 0),
          name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null,
        };
      }
    });
  } catch (error) {
    console.warn('Failed to load district scores from storage', error);
    districtScores = {};
  }
}

function saveDistrictScores() {
  try {
    window.localStorage.setItem(DISTRICT_SCORES_STORAGE_KEY, JSON.stringify(districtScores));
  } catch (error) {
    console.warn('Failed to save district scores to storage', error);
  }
}

function ensureDistrictScoreEntry(districtId, districtName = null) {
  const id = districtId ? safeId(districtId) : null;
  if (!id) {
    return null;
  }
  if (!districtScores || typeof districtScores !== 'object') {
    districtScores = {};
  }
  if (!districtScores[id] || typeof districtScores[id] !== 'object') {
    districtScores[id] = {
      adjustment: 0,
      defended: 0,
      attacked: 0,
      name: null,
    };
  }
  const entry = districtScores[id];
  entry.adjustment = normaliseNumber(entry.adjustment, 0);
  entry.defended = normaliseNumber(entry.defended, 0);
  entry.attacked = normaliseNumber(entry.attacked, 0);
  if (districtName && typeof districtName === 'string' && districtName.trim()) {
    entry.name = districtName.trim();
  }
  return entry;
}

function getDistrictStrength(districtId) {
  const id = districtId ? safeId(districtId) : null;
  if (!id) {
    return null;
  }
  const entry = ensureDistrictScoreEntry(id);
  const adjustment = entry ? normaliseNumber(entry.adjustment, 0) : 0;
  return DISTRICT_BASE_SCORE + adjustment;
}

function applyDistrictScoreDelta(districtId, delta, districtName = null) {
  if (!districtId || !Number.isFinite(delta) || delta === 0) {
    return;
  }
  const entry = ensureDistrictScoreEntry(districtId, districtName);
  if (!entry) {
    return;
  }
  entry.adjustment = normaliseNumber(entry.adjustment, 0) + delta;
  if (delta > 0) {
    entry.defended = normaliseNumber(entry.defended, 0) + delta;
  } else if (delta < 0) {
    entry.attacked = normaliseNumber(entry.attacked, 0) + Math.abs(delta);
  }
  saveDistrictScores();
}

function renderKnownPlayers() {
  const names = Object.keys(players).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const validNames = names.filter((name) => isValidUsername(name));
  if (!validNames.length) {
    knownPlayersSection?.classList.add('hidden');
    knownPlayersList && (knownPlayersList.innerHTML = '');
    return;
  }

  if (knownPlayersSection) {
    knownPlayersSection.classList.remove('hidden');
  }
  if (knownPlayersList) {
    knownPlayersList.innerHTML = '';
    validNames.forEach((name) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'known-player-button';
      button.textContent = name;
      button.title = `Prepare sign-in for ${name}`;
      button.addEventListener('click', () => {
        handleExistingPlayer(name);
      });
      knownPlayersList.appendChild(button);
    });
  }
}

let profileImageHandlersInitialised = false;
let markerColorHandlersInitialised = false;
const friendLocationMarkers = new Map();

function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function setProfileImageFeedback(message, type = 'info') {
  if (!profileImageFeedback) return;
  profileImageFeedback.textContent = message || '';
  profileImageFeedback.dataset.type = type;
}

function primeProfileImagePreview(url) {
  if (!profileImagePreview) return;
  if (!url) {
    profileImagePreview.src = '';
    profileImagePreview.classList.remove('invalid');
    return;
  }
  profileImagePreview.classList.remove('invalid');
  profileImagePreview.src = url;
}

async function saveProfileImageUrl(profile, url) {
  if (!profile || !profile.backendId) {
    setProfileImageFeedback('Sign in to save your profile photo.', 'error');
    return;
  }
  if (!isSessionAuthenticated) {
    setProfileImageFeedback('Your session expired. Please sign in again.', 'error');
    return;
  }
  const payload = { profile_image_url: typeof url === 'string' ? url.trim() : '' };
  profileImageSaveButton.disabled = true;
  setProfileImageFeedback('Saving...', 'info');
  try {
    const updated = await apiRequest(`players/${profile.backendId}/`, { method: 'PATCH', body: payload });
    // Apply server data to profile
    applyServerPlayerData(profile, updated);
    savePlayers();
    setProfileImageFeedback('Profile photo saved.', 'success');
    profileImageSaveButton.disabled = true;
    // Keep preview in sync in case server normalized the URL
    if (typeof updated.profile_image_url === 'string') {
      primeProfileImagePreview(updated.profile_image_url);
      if (profileImageUrlInput) profileImageUrlInput.value = updated.profile_image_url;
    }
    // Rerender character/drawer summaries if needed
    updateCharacterDrawerContent(profile);
    updateDrawerSummaries(profile);
  } catch (error) {
    console.warn('Failed to save profile image URL', error);
    const msg = (error && error.message) || 'Failed to save. Please try again.';
    setProfileImageFeedback(msg, 'error');
    profileImageSaveButton.disabled = false;
  }
}

function initialiseProfileImageControls(profile) {
  if (!profileImageUrlInput || !profileImagePreview || !profileImageSaveButton || !profileImageClearButton) {
    return;
  }

  const currentUrl = profile && typeof profile.profileImageUrl === 'string' ? profile.profileImageUrl : '';
  profileImageUrlInput.value = currentUrl;
  primeProfileImagePreview(currentUrl);
  setProfileImageFeedback('Paste a direct image link (http/https).', 'info');
  profileImageSaveButton.disabled = true;

  if (!profileImageHandlersInitialised) {
    profileImageHandlersInitialised = true;

    profileImageUrlInput.addEventListener('input', () => {
      const value = profileImageUrlInput.value.trim();
      if (!value) {
        setProfileImageFeedback('No image URL set. You can paste a link and Save.', 'info');
        primeProfileImagePreview('');
        profileImageSaveButton.disabled = false; // allow saving empty to clear
        return;
      }
      if (!isValidHttpUrl(value)) {
        setProfileImageFeedback('Please enter a valid http(s) URL.', 'error');
        profileImageSaveButton.disabled = true;
        primeProfileImagePreview('');
        return;
      }
      setProfileImageFeedback('Previewing image...', 'info');
      profileImageSaveButton.disabled = true;
      // Load preview and enable save only when it loads
      const testImg = new Image();
      testImg.onload = () => {
        primeProfileImagePreview(value);
        setProfileImageFeedback('Looks good. Click Save to apply.', 'success');
        profileImageSaveButton.disabled = false;
      };
      testImg.onerror = () => {
        primeProfileImagePreview('');
        setProfileImageFeedback('Could not load this image. Check the link.', 'error');
        profileImageSaveButton.disabled = true;
      };
      testImg.src = value;
    });

    profileImageSaveButton.addEventListener('click', async () => {
      const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
      const value = profileImageUrlInput.value.trim();
      if (!value) {
        await saveProfileImageUrl(profile, '');
        return;
      }
      if (!isValidHttpUrl(value)) {
        setProfileImageFeedback('Please enter a valid http(s) URL.', 'error');
        return;
      }
      await saveProfileImageUrl(profile, value);
    });

    profileImageClearButton.addEventListener('click', async () => {
      const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
      profileImageUrlInput.value = '';
      primeProfileImagePreview('');
      setProfileImageFeedback('Cleared. Click Save to apply.', 'info');
      profileImageSaveButton.disabled = false;
      // Optionally persist immediately on clear:
      // await saveProfileImageUrl(profile, '');
    });
  }
}

function normaliseMarkerColor(value, fallback = DEFAULT_MARKER_COLOR) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (MARKER_COLOR_PATTERN.test(trimmed)) {
      return trimmed.toLowerCase();
    }
  }
  return fallback;
}

function applyMarkerColorTheme(color = DEFAULT_MARKER_COLOR) {
  if (typeof document === 'undefined' || !document.documentElement) {
    return;
  }
  const resolved = normaliseMarkerColor(color);
  document.documentElement.style.setProperty('--player-marker-color', resolved);
}

function setMarkerColorFeedback(message, type = 'info') {
  if (!markerColorFeedback) {
    return;
  }
  markerColorFeedback.textContent = message || '';
  markerColorFeedback.dataset.type = type;
}

async function saveMarkerColor(profile, color) {
  if (!profile) {
    setMarkerColorFeedback('Sign in to customize your map marker.', 'error');
    return;
  }
  const resolvedColor = normaliseMarkerColor(color);
  const canSyncWithServer = Boolean(profile.backendId && isSessionAuthenticated);
  const finishLocalUpdate = (nextColor, statusMessage) => {
    profile.mapMarkerColor = nextColor;
    applyMarkerColorTheme(nextColor);
    savePlayers();
    setMarkerColorFeedback(statusMessage, 'success');
    updateFriendLocationsLayer();
  };

  if (!canSyncWithServer) {
    finishLocalUpdate(resolvedColor, 'Marker color updated locally.');
    updateStatus('Marker color updated locally. Sign in to sync across devices.');
    return;
  }

  setMarkerColorFeedback('Saving...', 'info');
  markerColorInput && (markerColorInput.disabled = true);
  markerColorResetButton && (markerColorResetButton.disabled = true);

  try {
    const updated = await apiRequest(`players/${profile.backendId}/`, {
      method: 'PATCH',
      body: { map_marker_color: resolvedColor },
    });
    applyServerPlayerData(profile, updated);
    const nextColor =
      updated && typeof updated.map_marker_color === 'string'
        ? normaliseMarkerColor(updated.map_marker_color)
        : resolvedColor;
    finishLocalUpdate(nextColor, 'Marker color saved.');
    updateStatus('Marker color updated. Friends will see this on your next shared check-in.');
    if (isSessionAuthenticated && currentUser) {
      refreshFriends(true).catch(() => null);
    }
  } catch (error) {
    console.warn('Failed to save map marker color', error);
    const message = (error && error.message) || 'Failed to save. Please try again.';
    setMarkerColorFeedback(message, 'error');
  } finally {
    const editable = Boolean(profile && profile.backendId && isSessionAuthenticated);
    markerColorInput && (markerColorInput.disabled = !editable);
    markerColorResetButton && (markerColorResetButton.disabled = !editable);
  }
}

function initialiseMarkerColorControl(profile) {
  if (!markerColorInput || !markerColorResetButton || !markerColorFeedback) {
    return;
  }

  const canSyncWithServer = Boolean(profile && profile.backendId && isSessionAuthenticated);
  const canEditLocally = Boolean(profile && currentUser);
  const canEdit = canSyncWithServer || canEditLocally;
  const activeColor = profile ? normaliseMarkerColor(profile.mapMarkerColor) : DEFAULT_MARKER_COLOR;
  markerColorInput.value = activeColor;
  markerColorInput.disabled = !canEdit;
  markerColorResetButton.disabled = !canEdit;
  markerColorInput.title = canEdit ? 'Click to pick a color for your map marker.' : 'Sign in to customize your map marker.';
  markerColorResetButton.title = canEdit
    ? 'Reset your marker color to the default.'
    : 'Sign in to customize your map marker.';

  if (!canEdit) {
    setMarkerColorFeedback('Sign in to customize your map marker.', 'info');
  } else if (!markerColorFeedback.textContent) {
    setMarkerColorFeedback('Pick a color to update your map marker.', 'info');
  }

  if (!markerColorHandlersInitialised) {
    markerColorHandlersInitialised = true;

    markerColorInput.addEventListener('change', async () => {
      const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
      if (!profile) {
        setMarkerColorFeedback('Sign in to customize your map marker.', 'error');
        markerColorInput.value = DEFAULT_MARKER_COLOR;
        return;
      }
      const selected = normaliseMarkerColor(markerColorInput.value);
      markerColorInput.value = selected;
      await saveMarkerColor(profile, selected);
    });

    markerColorResetButton.addEventListener('click', async () => {
      const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
      if (!profile) {
        setMarkerColorFeedback('Sign in to customize your map marker.', 'error');
        return;
      }
      markerColorInput.value = DEFAULT_MARKER_COLOR;
      await saveMarkerColor(profile, DEFAULT_MARKER_COLOR);
    });
  }
}

function renderPlayerState() {
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;

  if (profileImageUrlInput && profileImagePreview && profileImageSaveButton && profileImageClearButton) {
    initialiseProfileImageControls(profile);
  }
  if (markerColorInput && markerColorResetButton && markerColorFeedback) {
    initialiseMarkerColorControl(profile);
  }
  if (!playerUsernameLabel || !playerPointsLabel || !playerCheckinsLabel || !checkInButton) {
    return;
  }

  if (!currentUser || !profile) {
    applyMarkerColorTheme(DEFAULT_MARKER_COLOR);
    playerUsernameLabel.textContent = 'Guest';
    playerPointsLabel.textContent = '0';
    playerCheckinsLabel.textContent = '0';
    renderCheckins([]);
    updateCurrentUserTag(null);
    checkInButton.disabled = true;
    checkInButton.title = 'Log in to check in';
    checkInButton.textContent = 'Check In';
    clearHistoryButton && (clearHistoryButton.disabled = true);
    if (chargeAttackButton) {
      chargeAttackButton.disabled = true;
      chargeAttackButton.title = 'Log in to charge your next attack.';
      chargeAttackButton.textContent = 'Charge Attack';
    }
    if (setHomeDistrictButton) {
      setHomeDistrictButton.disabled = true;
      setHomeDistrictButton.title = 'Log in to choose a home district.';
    }
    if (homeDistrictValue) {
      homeDistrictValue.textContent = 'Unset';
      homeDistrictValue.title = '';
    }
    if (attackDefendRatioLabel) {
      attackDefendRatioLabel.textContent = '0 / 0';
      attackDefendRatioLabel.title = 'No attack or defend points yet.';
    }
    syncCooldownsFromProfile(null);
    updateHomePresenceIndicator();
    hideActionContextMenu();
    if (devOptionsContainer && devSkipCooldownCheckbox && devChangeUserButton) {
      devOptionsContainer.classList.add('hidden');
      devSkipCooldownCheckbox.checked = false;
      devChangeUserButton.hidden = true;
      devChangeUserButton.disabled = true;
    }
    if (devClearUsersButton) {
      devClearUsersButton.hidden = true;
      devClearUsersButton.disabled = true;
    }
    updateRecentCheckinsDrawerContent(null);
    updateFriendsDrawerContent();
    updateDistrictDrawerContent(null);
    updateCharacterDrawerContent(null);
    closeFriendsDrawer({ restoreFocus: false });
    closeDistrictDrawer({ restoreFocus: false });
    closeCharacterDrawer({ restoreFocus: false });
    closeRecentCheckinsDrawer({ restoreFocus: false });
    updateDrawerSummaries(null);
    if (drawerLogoutButton) {
      drawerLogoutButton.disabled = true;
      drawerLogoutButton.title = 'Log in to log out.';
    }
    if (mobileCheckInButton) {
      mobileCheckInButton.setAttribute('disabled', 'disabled');
    }
    return;
  }

  applyMarkerColorTheme(profile.mapMarkerColor);
  playerUsernameLabel.textContent = currentUser;
  playerPointsLabel.textContent = Math.round(profile.points).toString();
  playerCheckinsLabel.textContent = profile.checkins.length.toString();
  updateCurrentUserTag(currentUser);
  updateDrawerSummaries(profile);
  populateDrawerHomeSelect(profile);
  renderCheckins(profile.checkins);
  updateRecentCheckinsDrawerContent(profile);
  updateFriendsDrawerContent();
  updateDistrictDrawerContent(profile);
  updateCharacterDrawerContent(profile);
  if (drawerLogoutButton) {
    drawerLogoutButton.disabled = false;
    drawerLogoutButton.title = 'Log out from this device.';
  }
  if (mobileCheckInButton) {
    mobileCheckInButton.removeAttribute('disabled');
  }
  if (devOptionsContainer && devSkipCooldownCheckbox && devChangeUserButton) {
    if (isDevUser(currentUser)) {
      devOptionsContainer.classList.remove('hidden');
      devSkipCooldownCheckbox.checked = Boolean(profile.skipCooldown);
      devChangeUserButton.hidden = false;
      devChangeUserButton.disabled = false;
      if (devClearUsersButton) {
        devClearUsersButton.hidden = false;
        devClearUsersButton.disabled = false;
      }
    } else {
      devOptionsContainer.classList.add('hidden');
      devSkipCooldownCheckbox.checked = false;
      devChangeUserButton.hidden = true;
      devChangeUserButton.disabled = true;
      if (devClearUsersButton) {
        devClearUsersButton.hidden = true;
        devClearUsersButton.disabled = true;
      }
      if (profile.skipCooldown) {
        profile.skipCooldown = false;
        savePlayers();
      }
    }
  }
  const homeDescription = describeHomeDistrict(profile);
  const preciseInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  const fallbackInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  const preciseId = preciseInfo && preciseInfo.id ? safeId(preciseInfo.id) : null;
  const fallbackId = fallbackInfo && fallbackInfo.id ? safeId(fallbackInfo.id) : null;
  const locationId = preciseId || (fallbackInfo && fallbackInfo.source !== 'home-fallback' ? fallbackId : null);
  const actionDescriptor = resolveCheckInAction(profile, { preciseInfo, fallbackInfo });
  const now = Date.now();
  const checkCooldownActive = isActionOnCooldown(profile, actionDescriptor.key, now);
  const chargeCooldownActive = isActionOnCooldown(profile, COOLDOWN_KEYS.CHARGE, now);
  const isAtHome =
    actionDescriptor.key === COOLDOWN_KEYS.DEFEND && actionDescriptor.mode !== 'remote';
  if (homeDistrictValue) {
    homeDistrictValue.textContent = homeDescription;
    homeDistrictValue.title = profile.homeDistrictId ? `District ID: ${profile.homeDistrictId}` : '';
  }
  if (attackDefendRatioLabel) {
    const attackDisplay = Math.round(profile.attackPoints);
    const defendDisplay = Math.round(profile.defendPoints);
    attackDefendRatioLabel.textContent = `${attackDisplay} / ${defendDisplay}`;
    const ratioText = formatAttackDefendRatio(profile);
    attackDefendRatioLabel.title =
      attackDisplay === 0 && defendDisplay === 0
        ? 'No attack or defend points yet.'
        : `Attack: ${attackDisplay} pts • Defend: ${defendDisplay} pts • Ratio: ${ratioText}`;
  }
  if (chargeAttackButton) {
    const baseChargeText = isAtHome ? 'Charge Defend' : 'Charge Attack';
    const chargedText = isAtHome ? 'Recharge Defend' : 'Recharge Attack';
    chargeAttackButton.textContent = profile.nextCheckinMultiplier > 1 ? chargedText : baseChargeText;
    if (chargeCooldownActive) {
      chargeAttackButton.disabled = true;
      chargeAttackButton.title = 'Charge cooldown active. Wait until it completes to charge again.';
    } else {
      chargeAttackButton.disabled = false;
      chargeAttackButton.title = profile.nextCheckinMultiplier > 1
        ? `Charged: next check-in worth x${profile.nextCheckinMultiplier} points. Recharge to reset the timer.`
        : isAtHome
        ? 'Charge to defend your district with a boosted check-in.'
        : 'Charge to start a countdown and multiply your next attack.';
    }
  }
  if (setHomeDistrictButton) {
    setHomeDistrictButton.disabled = false;
    setHomeDistrictButton.title = profile.homeDistrictId
      ? `Current home: ${homeDescription}. Click to change.`
      : 'Click to choose your home district from the list.';
  }
  if (checkInButton) {
    const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
    const baseMultiplier = !profile || !preciseId ? 1 : isAtHome ? 1 : 2;
    const effectiveMultiplier = chargeMultiplier * baseMultiplier;
    const buttonLabel = actionDescriptor.key === COOLDOWN_KEYS.DEFEND ? 'Defend' : 'Check In';
    checkInButton.textContent = effectiveMultiplier > 1 ? `${buttonLabel} (x${effectiveMultiplier})` : buttonLabel;
    if (checkCooldownActive) {
      checkInButton.title = `${actionDescriptor.label} cooldown active. Wait for it to finish.`;
    } else if (chargeMultiplier > 1) {
      checkInButton.title = `Charged! Next check-in pays x${chargeMultiplier}.`;
    } else if (baseMultiplier > 1) {
      checkInButton.title = `Earn x${baseMultiplier} points for this local attack.`;
    } else {
      checkInButton.title = 'Log a check-in to earn points.';
    }
    checkInButton.disabled = checkCooldownActive;
  }
  if (clearHistoryButton) {
    clearHistoryButton.disabled = !(profile.checkins && profile.checkins.length);
  }

  syncCooldownsFromProfile(profile);
  updateHomePresenceIndicator();
}

function createCheckinListItem(entry, profile = null, now = Date.now()) {
  const li = document.createElement('li');
  const safeEntry = entry || {};
  const entryType = typeof safeEntry.type === 'string' ? safeEntry.type.toLowerCase() : '';
  const typeClass = entryType === 'defend' ? 'defend' : entryType === 'attack' ? 'attack' : '';
  const isAttackType = typeClass === 'attack';

  li.className = `checkin-item${typeClass ? ` ${typeClass}` : ''}`;

  if (typeClass) {
    const typeTag = document.createElement('span');
    typeTag.className = `checkin-type ${typeClass}`;
    typeTag.textContent = typeClass === 'defend' ? 'Defend' : 'Attack';
    li.appendChild(typeTag);
    li.setAttribute('data-checkin-type', typeClass);
  }

  if (safeEntry.ranged) {
    const rangedTag = document.createElement('span');
    rangedTag.className = 'checkin-type ranged';
    rangedTag.textContent = 'Ranged';
    li.appendChild(rangedTag);
  }

  const shouldShowMelee =
    !safeEntry?.ranged && (safeEntry?.melee || (isAttackType && (safeEntry?.ranged === false || safeEntry?.ranged === undefined)));
  if (shouldShowMelee) {
    const meleeTag = document.createElement('span');
    meleeTag.className = 'checkin-type melee';
    meleeTag.textContent = 'Melee';
    li.appendChild(meleeTag);
  }

  const title = document.createElement('strong');
  title.textContent = safeEntry.districtName || `District ${safeEntry.districtId || ''}`;
  li.appendChild(title);

  const meta = document.createElement('span');
  meta.textContent = formatTimeAgo(safeEntry.timestamp);
  li.appendChild(meta);

  const cooldownInfo = profile ? getEntryCooldownInfo(profile, safeEntry, now) : null;
  if (cooldownInfo) {
    const cooldownTag = document.createElement('span');
    cooldownTag.className = 'checkin-cooldown-indicator';
    cooldownTag.textContent = `${cooldownInfo.label} ${formatCooldownTime(cooldownInfo.remaining)}`;
    cooldownTag.dataset.cooldownAction = cooldownInfo.key;
    if (cooldownInfo.mode) {
      cooldownTag.dataset.cooldownMode = cooldownInfo.mode;
    }
    const colors = resolveCooldownColors(cooldownInfo.key, cooldownInfo.mode);
    cooldownTag.style.background = colors.fill;
    cooldownTag.style.color = colors.text;
    cooldownTag.style.boxShadow = '0 6px 14px rgba(15, 6, 32, 0.24)';
    li.appendChild(cooldownTag);
  }

  const multiplierValue = Number(safeEntry.multiplier);
  if (Number.isFinite(multiplierValue) && multiplierValue > 1) {
    const multiplierTag = document.createElement('span');
    multiplierTag.className = 'checkin-multiplier';
    multiplierTag.textContent = `x${multiplierValue}`;
    multiplierTag.title = `Earned with x${multiplierValue} charge`;
    li.appendChild(multiplierTag);
  }

  return li;
}

function renderCheckins(history) {
  const safeHistory = Array.isArray(history) ? history : [];
  updateRecentCheckinTags(safeHistory);

  if (!checkinList) {
    return;
  }
  checkinList.innerHTML = '';

  if (!safeHistory.length) {
    const li = document.createElement('li');
    li.className = 'checkin-item empty';
    li.textContent = currentUser ? 'No check-ins yet. Explore the city and log your first stop!' : 'Sign in to track your check-ins.';
    checkinList.appendChild(li);
    return;
  }

  const allEntries = safeHistory.slice(0, MAX_HISTORY_ITEMS);
  const primaryEntries = allEntries.slice(0, 2);
  const additionalEntries = allEntries.slice(2);
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  if (profile) {
    ensureProfileCooldownState(profile);
  }
  const now = Date.now();

  primaryEntries.forEach((entry) => {
    checkinList.appendChild(createCheckinListItem(entry, profile, now));
  });

  if (additionalEntries.length) {
    const collapsedLabel = `Show ${additionalEntries.length} more`;
    const expandedLabel = 'Hide additional check-ins';

    const containerItem = document.createElement('li');
    containerItem.className = 'checkin-more';

    const details = document.createElement('details');
    details.className = 'checkin-more-details';

    const summary = document.createElement('summary');
    summary.className = 'checkin-more-summary';
    summary.textContent = collapsedLabel;
    details.appendChild(summary);

    const moreList = document.createElement('ul');
    moreList.className = 'checkin-more-list';
    additionalEntries.forEach((entry) => {
      moreList.appendChild(createCheckinListItem(entry, profile, now));
    });
    details.appendChild(moreList);

    details.addEventListener('toggle', () => {
      summary.textContent = details.open ? expandedLabel : collapsedLabel;
    });

    containerItem.appendChild(details);
    checkinList.appendChild(containerItem);
  }
}

function formatRecentCheckinTag(entry, options = {}) {
  if (!entry) {
    return '';
  }
  const includeTime = options && Object.prototype.hasOwnProperty.call(options, 'includeTime') ? Boolean(options.includeTime) : true;
  const district = entry.districtName && entry.districtName.trim()
    ? entry.districtName.trim()
    : entry.districtId
    ? `District ${entry.districtId}`
    : 'Unknown district';
  const type = typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
  const typeLabel = type === 'defend' ? 'Defend' : type === 'attack' ? 'Attack' : 'Check-in';
  const when = includeTime && entry.timestamp ? formatTimeAgo(entry.timestamp) : '';
  return when ? `${typeLabel} • ${district} (${when})` : `${typeLabel} • ${district}`;
}

function applyRecentCheckinTagState(element, entry, { fallbackText = '', hideWhenEmpty = false, includeTime = true } = {}) {
  if (!element) {
    return;
  }
  element.classList.remove('attack', 'defend', 'neutral', 'empty');

  if (entry) {
    element.textContent = formatRecentCheckinTag(entry, { includeTime });
    const type = typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
    if (type === 'attack' || type === 'defend') {
      element.classList.add(type);
    } else {
      element.classList.add('neutral');
    }
    return;
  }

  if (hideWhenEmpty) {
    element.textContent = '';
    element.classList.add('empty');
    return;
  }

  element.textContent = fallbackText;
  element.classList.add('neutral');
}

function updateCurrentUserTag(username) {
  if (!currentUserTag) {
    return;
  }
  if (!username) {
    currentUserTag.textContent = 'Guest';
    currentUserTag.classList.add('empty');
    currentUserTag.setAttribute('aria-hidden', 'true');
    currentUserTag.setAttribute('aria-expanded', 'false');
    currentUserTag.disabled = true;
    updateSettingsButton(null);
    return;
  }
  currentUserTag.textContent = username;
  currentUserTag.classList.remove('empty');
  currentUserTag.removeAttribute('aria-hidden');
  currentUserTag.disabled = false;
  updateSettingsButton(username);
}

function updateSettingsButton(username) {
  if (!settingsButton) {
    return;
  }
  if (!username) {
    settingsButton.textContent = 'Character & Settings';
    settingsButton.classList.add('disabled');
    settingsButton.disabled = false;
    return;
  }
  settingsButton.textContent = `@${username}`;
  settingsButton.classList.remove('disabled');
}

function updateRecentCheckinTags(history) {
  if (!recentCheckinTagPrimary) {
    return;
  }
  const first = history && history.length ? history[0] : null;

  applyRecentCheckinTagState(recentCheckinTagPrimary, first, { fallbackText: 'No check-ins yet', includeTime: false });
}

function calculateCheckinPoints(entry) {
  if (!entry) {
    return 0;
  }
  const multiplier = Number(entry.multiplier) > 0 ? Number(entry.multiplier) : 1;
  const type = typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
  let base = POINTS_PER_CHECKIN;
  if (type !== 'defend') {
    base = entry && entry.ranged ? 10 : POINTS_PER_CHECKIN;
  }
  return Math.round(base * multiplier);
}

function updateRecentCheckinsDrawerContent(profile = undefined) {
  if (!recentCheckinsList) {
    return;
  }
  const resolvedProfile =
    profile === undefined ? (currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null) : profile;
  const history =
    resolvedProfile && Array.isArray(resolvedProfile.checkins) ? resolvedProfile.checkins.slice(0, MAX_HISTORY_ITEMS) : [];
  const hasHistory = history.length > 0;
  if (resolvedProfile) {
    ensureProfileCooldownState(resolvedProfile);
  }
  const now = Date.now();

  recentCheckinsList.innerHTML = '';

  if (recentCheckinsEmptyState) {
    recentCheckinsEmptyState.hidden = hasHistory;
  }

  if (!hasHistory) {
    if (recentCheckinsToggleButton) {
      recentCheckinsToggleButton.classList.add('hidden');
    }
    return;
  }

  const itemsToShow = recentCheckinsShowAll ? history.length : Math.min(4, history.length);
  const entriesToRender = history.slice(0, itemsToShow);
  const renderedCooldownKeys = new Set();

  entriesToRender.forEach((entry) => {
    const type = typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
    const li = document.createElement('li');
    li.className = 'recent-checkins-item';
    if (type === 'attack' || type === 'defend') {
      li.classList.add(type);
    }

    const district = entry.districtName && entry.districtName.trim()
      ? entry.districtName.trim()
      : entry.districtId
      ? `District ${entry.districtId}`
      : 'Unknown district';

    const title = document.createElement('div');
    title.className = 'recent-checkins-entry';
    title.textContent = district;
    li.appendChild(title);

    const typeLabel = type === 'defend' ? 'Defend' : type === 'attack' ? 'Attack' : 'Check-in';
    const points = calculateCheckinPoints(entry);
    const pointsText = `${points > 0 ? '+' : ''}${points.toLocaleString()} pts`;
    const multiplier = Number(entry.multiplier) > 1 ? `x${Number(entry.multiplier)}` : null;
    const mode = entry.ranged ? 'Ranged' : entry.melee ? 'Local' : null;
    const when = entry.timestamp ? formatTimeAgo(entry.timestamp) : 'Unknown time';
    let cooldownInfo = resolvedProfile ? getEntryCooldownInfo(resolvedProfile, entry, now) : null;
    if (cooldownInfo && renderedCooldownKeys.has(cooldownInfo.key)) {
      cooldownInfo = null;
    }
    if (cooldownInfo) {
      renderedCooldownKeys.add(cooldownInfo.key);
    }

    const metaParts = [typeLabel];
    if (mode) {
      metaParts.push(mode);
    }
    if (multiplier) {
      metaParts.push(multiplier);
    }
    metaParts.push(pointsText);
    metaParts.push(when);

    const meta = document.createElement('div');
    meta.className = 'recent-checkins-meta';
    metaParts
      .filter((part) => typeof part === 'string' && part.trim())
      .forEach((part, index) => {
        if (index > 0) {
          meta.appendChild(document.createTextNode(' • '));
        }
        meta.appendChild(document.createTextNode(part));
      });
    if (cooldownInfo) {
      if (meta.childNodes.length) {
        meta.appendChild(document.createTextNode(' • '));
      }
      const cooldownText = document.createElement('span');
      cooldownText.className = 'recent-checkin-cooldown-text';
      cooldownText.dataset.cooldownAction = cooldownInfo.key;
      cooldownText.dataset.cooldownLabel = cooldownInfo.label;
      if (cooldownInfo.startedAt) {
        cooldownText.dataset.cooldownStart = String(cooldownInfo.startedAt);
      } else if (entry.timestamp) {
        const ts = Number(entry.timestamp);
        if (Number.isFinite(ts)) {
          cooldownText.dataset.cooldownStart = String(ts);
        }
      }
      cooldownText.textContent = `${cooldownInfo.label} ${formatCooldownTime(cooldownInfo.remaining)}`;
      meta.appendChild(cooldownText);
    }
    li.appendChild(meta);

    if (cooldownInfo) {
      const cooldownBadge = document.createElement('span');
      cooldownBadge.className = 'recent-checkin-cooldown';
      cooldownBadge.textContent = formatCooldownTime(cooldownInfo.remaining);
      cooldownBadge.dataset.cooldownAction = cooldownInfo.key;
      if (cooldownInfo.label) {
        cooldownBadge.dataset.cooldownLabel = cooldownInfo.label;
      }
      if (cooldownInfo.startedAt) {
        cooldownBadge.dataset.cooldownStart = String(cooldownInfo.startedAt);
      } else if (entry.timestamp) {
        const ts = Number(entry.timestamp);
        if (Number.isFinite(ts)) {
          cooldownBadge.dataset.cooldownStart = String(ts);
        }
      }
      if (cooldownInfo.mode) {
        cooldownBadge.dataset.cooldownMode = cooldownInfo.mode;
      }
      const colors = resolveCooldownColors(cooldownInfo.key, cooldownInfo.mode);
      cooldownBadge.style.background = colors.fill;
      cooldownBadge.style.color = colors.text;
      cooldownBadge.style.boxShadow = '0 6px 18px rgba(15, 6, 32, 0.28)';
      li.appendChild(cooldownBadge);
    }

    recentCheckinsList.appendChild(li);
  });
  updateRecentCheckinCooldownBadges(now, resolvedProfile);

  if (recentCheckinsToggleButton) {
    if (history.length > 4) {
      recentCheckinsToggleButton.classList.remove('hidden');
      recentCheckinsToggleButton.textContent = recentCheckinsShowAll
        ? 'Show less'
        : `Show all (${history.length})`;
    } else {
      recentCheckinsToggleButton.classList.add('hidden');
    }
  }
}

function openRecentCheckinsDrawer(trigger = null) {
  if (!recentCheckinsDrawer || !recentCheckinsOverlay) {
    return;
  }
  closeCharacterDrawer({ restoreFocus: false });
  closeFriendsDrawer({ restoreFocus: false });
  closeDistrictDrawer({ restoreFocus: false });
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  recentCheckinsShowAll = false;
  updateRecentCheckinsDrawerContent(profile);
  document.body.classList.add('recent-checkins-open');
  recentCheckinsDrawer.setAttribute('aria-hidden', 'false');
  recentCheckinsOverlay.classList.remove('hidden');
  recentCheckinsOverlay.setAttribute('aria-hidden', 'false');
  recentCheckinsLastTrigger = trigger || null;
  window.setTimeout(() => {
    if (recentCheckinsContent && typeof recentCheckinsContent.focus === 'function') {
      recentCheckinsContent.focus();
    }
  }, 0);
}

function closeRecentCheckinsDrawer({ restoreFocus = true } = {}) {
  if (!recentCheckinsDrawer || !document.body.classList.contains('recent-checkins-open')) {
    return;
  }
  document.body.classList.remove('recent-checkins-open');
  recentCheckinsDrawer.setAttribute('aria-hidden', 'true');
  if (recentCheckinsOverlay) {
    recentCheckinsOverlay.classList.add('hidden');
    recentCheckinsOverlay.setAttribute('aria-hidden', 'true');
  }
  recentCheckinsShowAll = false;
  if (restoreFocus && recentCheckinsLastTrigger && typeof recentCheckinsLastTrigger.focus === 'function') {
    recentCheckinsLastTrigger.focus();
  }
  recentCheckinsLastTrigger = null;
}

function toggleRecentCheckinsDrawerMore() {
  recentCheckinsShowAll = !recentCheckinsShowAll;
  updateRecentCheckinsDrawerContent();
  if (recentCheckinsToggleButton) {
    recentCheckinsToggleButton.blur();
  }
}

function updateRecentCheckinCooldownBadges(now = Date.now(), profile = undefined) {
  if (!recentCheckinsList) {
    return;
  }
  const targets = recentCheckinsList.querySelectorAll('[data-cooldown-action]');
  if (!targets.length) {
    return;
  }
  const resolvedProfile =
    profile === undefined ? (currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null) : profile;
  if (!resolvedProfile) {
    return;
  }
  ensureProfileCooldownState(resolvedProfile);
  let requiresRefresh = false;
  targets.forEach((node) => {
    const actionKey = node.dataset.cooldownAction;
    if (!actionKey) {
      return;
    }
    const deadline =
      resolvedProfile.cooldowns && typeof resolvedProfile.cooldowns[actionKey] === 'number'
        ? resolvedProfile.cooldowns[actionKey]
        : null;
    const detail = resolvedProfile.cooldownDetails ? resolvedProfile.cooldownDetails[actionKey] : null;
    const startedAtRaw = detail && detail.startedAt !== undefined ? Number(detail.startedAt) : null;
    const startedAt = Number.isFinite(startedAtRaw) ? startedAtRaw : null;
    const nodeStartRaw = node.dataset.cooldownStart !== undefined ? Number(node.dataset.cooldownStart) : null;
    const nodeStart = Number.isFinite(nodeStartRaw) ? nodeStartRaw : null;
    if (!deadline || deadline <= now || !startedAt || nodeStart === null || Math.abs(nodeStart - startedAt) > 5000) {
      requiresRefresh = true;
      return;
    }
    const remaining = Math.max(0, deadline - now);
    if (node.dataset.cooldownLabel) {
      node.textContent = `${node.dataset.cooldownLabel} ${formatCooldownTime(remaining)}`;
    } else {
      node.textContent = formatCooldownTime(remaining);
    }
  });
  if (
    requiresRefresh &&
    typeof document !== 'undefined' &&
    document.body &&
    document.body.classList.contains('recent-checkins-open')
  ) {
    updateRecentCheckinsDrawerContent(resolvedProfile);
  }
}

function createFriendLocationFeature(friend) {
  if (!friend || typeof friend !== 'object') {
    return null;
  }
  const location = friend.last_known_location;
  if (!location || typeof location !== 'object') {
    return null;
  }
  const lng = Number(location.lng);
  const lat = Number(location.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  const feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: {
      username: typeof friend.username === 'string' ? friend.username : '',
      markerColor: normaliseMarkerColor(friend.map_marker_color),
    },
  };

  if (typeof friend.display_name === 'string' && friend.display_name.trim()) {
    feature.properties.displayName = friend.display_name.trim();
  }
  const districtId = location.districtId ? safeId(location.districtId) : null;
  if (districtId) {
    feature.properties.districtId = districtId;
  }
  if (typeof location.districtName === 'string' && location.districtName.trim()) {
    feature.properties.districtName = location.districtName.trim();
  }
  const timestamp = Number(location.timestamp);
  if (Number.isFinite(timestamp)) {
    feature.properties.timestamp = Math.trunc(timestamp);
  }
  return feature;
}

function buildFriendLocationsGeoJson(friends) {
  if (!Array.isArray(friends)) {
    return { type: 'FeatureCollection', features: [] };
  }
  const features = [];
  friends.forEach((friend) => {
    const feature = createFriendLocationFeature(friend);
    if (feature) {
      features.push(feature);
    }
  });
  return {
    type: 'FeatureCollection',
    features,
  };
}

function clearFriendLocationMarkers() {
  friendLocationMarkers.forEach((marker) => {
    try {
      marker.remove();
    } catch (error) {
      // no-op
    }
  });
  friendLocationMarkers.clear();
}

function rebuildFriendLocationMarkers() {
  if (!map || typeof map.getSource !== 'function') {
    return;
  }
  clearFriendLocationMarkers();
  if (!friendLocationsGeoJson || !Array.isArray(friendLocationsGeoJson.features)) {
    return;
  }
  friendLocationsGeoJson.features.forEach((feature, index) => {
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
      return;
    }
    const coords = Array.isArray(feature.geometry.coordinates) ? feature.geometry.coordinates : null;
    if (!coords || coords.length !== 2) {
      return;
    }
    const username = feature.properties && typeof feature.properties.username === 'string' ? feature.properties.username : '';
    const label = username ? `@${username}` : 'Friend';
    const markerColor = feature.properties && feature.properties.markerColor ? normaliseMarkerColor(feature.properties.markerColor) : DEFAULT_MARKER_COLOR;

    const el = document.createElement('div');
    el.className = 'friend-location-label';
    el.textContent = label;
    el.style.setProperty('--friend-label-color', markerColor);

    const key = `${label}-${coords[0]}-${coords[1]}-${index}`;
    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'bottom',
      pitchAlignment: 'map',
      rotationAlignment: 'map',
    })
      .setLngLat([coords[0], coords[1]])
      .addTo(map);
    friendLocationMarkers.set(key, marker);
  });
}

function updateFriendLocationsLayer() {
  const friends = Array.isArray(friendsState.items) ? friendsState.items : [];
  friendLocationsGeoJson = buildFriendLocationsGeoJson(friends);
  ensureMap(() => {
    if (!map || typeof map.getSource !== 'function') {
      return;
    }
    const source = map.getSource(FRIEND_LOCATIONS_SOURCE_ID);
    if (source && typeof source.setData === 'function') {
      source.setData(friendLocationsGeoJson);
    }
    rebuildFriendLocationMarkers();
  });
}

function focusFriendLocation({ username, lng, lat, color }) {
  const numericLng = Number(lng);
  const numericLat = Number(lat);
  if (!Number.isFinite(numericLng) || !Number.isFinite(numericLat)) {
    updateStatus('Location unavailable for this friend.');
    return;
  }

  if (!map) {
    showMap(false);
  }

  ensureMap(() => {
    closeFriendsDrawer({ restoreFocus: false });
    const currentZoom = map && typeof map.getZoom === 'function' ? map.getZoom() : 12;
    const targetZoom = Math.max(currentZoom, 14.2);
    map.flyTo({
      center: [numericLng, numericLat],
      zoom: targetZoom,
      speed: 0.9,
      curve: 1.5,
      essential: true,
    });
    const markerColor = normaliseMarkerColor(color);
    let highlightShown = false;
    const spawnHighlight = () => {
      if (highlightShown) {
        return;
      }
      highlightShown = true;
      const highlight = document.createElement('div');
      highlight.className = 'friend-highlight-pulse';
      highlight.style.setProperty('--friend-highlight-color', markerColor);
      highlight.setAttribute('aria-hidden', 'true');
      const marker = new maplibregl.Marker({
        element: highlight,
        anchor: 'center',
        pitchAlignment: 'map',
        rotationAlignment: 'map',
      })
        .setLngLat([numericLng, numericLat])
        .addTo(map);
      window.setTimeout(() => {
        marker.remove();
      }, 2600);
    };

    if (map && typeof map.once === 'function') {
      map.once('moveend', spawnHighlight);
      window.setTimeout(spawnHighlight, 900);
    } else {
      spawnHighlight();
    }

    const label = username ? `@${username}` : 'Friend';
    updateStatus(`${label}'s last check-in highlighted on the map.`);
  });
}

function sortFriends(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list
    .slice()
    .sort((a, b) => {
      const aFav = Boolean(a && a.is_favorite);
      const bFav = Boolean(b && b.is_favorite);
      if (aFav !== bFav) {
        return aFav ? -1 : 1;
      }
      const aName = a && typeof a.username === 'string' ? a.username.toLowerCase() : '';
      const bName = b && typeof b.username === 'string' ? b.username.toLowerCase() : '';
      return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
    });
}

function isFriendUsername(username) {
  if (!username) {
    return false;
  }
  const target = username.toLowerCase();
  return friendsState.items.some(
    (friend) => friend && typeof friend.username === 'string' && friend.username.toLowerCase() === target,
  );
}

function upsertFriend(friend) {
  if (!friend || typeof friend.username !== 'string') {
    return;
  }
  const target = friend.username.toLowerCase();
  const existingIndex = friendsState.items.findIndex(
    (item) => item && typeof item.username === 'string' && item.username.toLowerCase() === target,
  );
  if (existingIndex >= 0) {
    friendsState.items[existingIndex] = friend;
  } else {
    friendsState.items.push(friend);
  }
  friendsState.items = sortFriends(friendsState.items);
  friendsState.loaded = true;
  friendsState.error = null;
  updateFriendLocationsLayer();
}

function removeFriendFromState(username) {
  if (!username) {
    return;
  }
  const target = username.toLowerCase();
  friendsState.items = friendsState.items.filter(
    (friend) => !(friend && typeof friend.username === 'string' && friend.username.toLowerCase() === target),
  );
  updateFriendLocationsLayer();
}

function formatFriendStatsSummary(friend) {
  const score = Math.max(0, Math.round(normaliseNumber(friend?.score, 0))).toLocaleString();
  const checkins = Math.max(0, Math.round(normaliseNumber(friend?.checkins, 0))).toLocaleString();
  return `${score} pts • ${checkins} check-ins`;
}

function resolveFriendHomeMeta(friend) {
  if (!friend) {
    return null;
  }
  const homeName =
    typeof friend.home_district_name === 'string' && friend.home_district_name.trim()
      ? friend.home_district_name.trim()
      : typeof friend.home_district === 'string' && friend.home_district.trim()
      ? friend.home_district.trim()
      : '';
  const homeId = friend.home_district_code ? safeId(friend.home_district_code) : null;
  if (!homeId && !homeName) {
    return null;
  }
  const label = homeName || (homeId ? `District ${homeId}` : null);
  if (!label) {
    return null;
  }

  let statusClass = 'neutral';
  if (currentUser) {
    const viewerProfile = ensurePlayerProfile(currentUser);
    if (viewerProfile) {
      const viewerId = viewerProfile.homeDistrictId ? safeId(viewerProfile.homeDistrictId) : null;
      const viewerName =
        viewerProfile.homeDistrictName && viewerProfile.homeDistrictName.trim()
          ? viewerProfile.homeDistrictName.trim().toLowerCase()
          : null;
      const targetId = homeId;
      const targetName = homeName ? homeName.toLowerCase() : null;
      if (viewerId && targetId) {
        statusClass = viewerId === targetId ? 'home' : 'enemy';
      } else if (viewerName && targetName) {
        statusClass = viewerName === targetName ? 'home' : 'enemy';
      }
    }
  }

  return {
    label,
    statusClass,
  };
}

function renderFriendCard(friend) {
  if (!friend || typeof friend.username !== 'string') {
    return null;
  }
  const card = document.createElement('div');
  card.className = 'friend-card';
  card.dataset.username = friend.username;
  if (friend.is_favorite) {
    card.classList.add('favorite');
  }

  const main = document.createElement('div');
  main.className = 'friend-main';

  const header = document.createElement('div');
  header.className = 'friend-header';
  const markerColor = normaliseMarkerColor(friend.map_marker_color);
  if (markerColor) {
    const swatch = document.createElement('span');
    swatch.className = 'friend-marker-swatch';
    swatch.style.backgroundColor = markerColor;
    swatch.title = 'Map marker color';
    header.appendChild(swatch);
  }
  const name = document.createElement('span');
  name.className = 'friend-name';
  name.textContent = `@${friend.username}`;
  header.appendChild(name);
  const displayName =
    typeof friend.display_name === 'string' && friend.display_name.trim() ? friend.display_name.trim() : '';
  if (displayName) {
    const display = document.createElement('span');
    display.className = 'friend-display';
    display.textContent = displayName;
    header.appendChild(display);
  }
  const homeMeta = resolveFriendHomeMeta(friend);
  if (homeMeta) {
    const homeTag = document.createElement('span');
    homeTag.className = `friend-home-tag ${homeMeta.statusClass}`;
    homeTag.textContent = homeMeta.label;
    if (homeMeta.statusClass === 'home') {
      homeTag.title = 'Matches your home district.';
    } else if (homeMeta.statusClass === 'enemy') {
      homeTag.title = 'Different from your home district.';
    } else {
      homeTag.title = 'Home district not set.';
    }
    header.appendChild(homeTag);
  }
  main.appendChild(header);

  const stats = document.createElement('div');
  stats.className = 'friend-stats';
  const scoreStat = document.createElement('span');
  scoreStat.className = 'friend-stat friend-meta';
  scoreStat.textContent = `${Math.max(0, Math.round(normaliseNumber(friend.score, 0))).toLocaleString()} pts`;
  stats.appendChild(scoreStat);
  const checkinsStat = document.createElement('span');
  checkinsStat.className = 'friend-stat friend-meta';
  checkinsStat.textContent = `${Math.max(0, Math.round(normaliseNumber(friend.checkins, 0))).toLocaleString()} check-ins`;
  stats.appendChild(checkinsStat);
  const attackPoints = Math.max(0, Math.round(normaliseNumber(friend.attack_points, 0)));
  const defendPoints = Math.max(0, Math.round(normaliseNumber(friend.defend_points, 0)));
  if (attackPoints || defendPoints) {
    const attackDefendStat = document.createElement('span');
    attackDefendStat.className = 'friend-stat friend-meta';
    attackDefendStat.textContent = `${attackPoints.toLocaleString()} atk • ${defendPoints.toLocaleString()} def`;
    stats.appendChild(attackDefendStat);
  }
  main.appendChild(stats);

  const checkinCounts = friend.checkin_counts || {};
  const attackCount = Math.max(0, Math.round(normaliseNumber(checkinCounts.attack, 0)));
  const defendCount = Math.max(0, Math.round(normaliseNumber(checkinCounts.defend, 0)));
  if (attackCount || defendCount) {
    const activity = document.createElement('div');
    activity.className = 'friend-activity';
    const attackSpan = document.createElement('span');
    attackSpan.className = 'friend-meta';
    attackSpan.textContent = `Attacks: ${attackCount.toLocaleString()}`;
    activity.appendChild(attackSpan);
    const defendSpan = document.createElement('span');
    defendSpan.className = 'friend-meta';
    defendSpan.textContent = `Defends: ${defendCount.toLocaleString()}`;
    activity.appendChild(defendSpan);
    const latest = Array.isArray(friend.recent_checkins) ? friend.recent_checkins[0] : null;
    if (latest) {
      const latestSpan = document.createElement('span');
      latestSpan.className = 'friend-meta';
      latestSpan.textContent = `Latest: ${formatRecentCheckinTag(latest)}`;
      activity.appendChild(latestSpan);
    }
    main.appendChild(activity);
  }

  card.appendChild(main);

  const actions = document.createElement('div');
  actions.className = 'friend-actions';
  let hasActions = false;

  const lastKnown = friend.last_known_location;
  if (
    lastKnown &&
    typeof lastKnown === 'object' &&
    Number.isFinite(Number(lastKnown.lng)) &&
    Number.isFinite(Number(lastKnown.lat))
  ) {
    const locateButton = document.createElement('button');
    locateButton.type = 'button';
    locateButton.className = 'secondary small friend-locate-button';
    locateButton.dataset.friendLocate = friend.username;
    locateButton.dataset.lng = String(lastKnown.lng);
    locateButton.dataset.lat = String(lastKnown.lat);
    locateButton.dataset.color = normaliseMarkerColor(friend.map_marker_color);
    const locationLabel =
      typeof lastKnown.districtName === 'string' && lastKnown.districtName.trim()
        ? lastKnown.districtName.trim()
        : lastKnown.districtId
        ? `District ${lastKnown.districtId}`
        : 'map';
    locateButton.textContent = `View on map (${locationLabel})`;
    actions.appendChild(locateButton);
    hasActions = true;
  }

  if (hasActions) {
    card.appendChild(actions);
  }

  const favoriteBadge = document.createElement('span');
  favoriteBadge.className = 'friend-favorite';
  favoriteBadge.textContent = '★';
  favoriteBadge.hidden = !friend.is_favorite;
  card.appendChild(favoriteBadge);

  return card;
}

function renderFriendManageList() {
  if (!friendManageList) {
    return;
  }
  friendManageList.innerHTML = '';
  const friends = Array.isArray(friendsState.items) ? friendsState.items : [];
  if (!friends.length) {
    const empty = document.createElement('p');
    empty.className = 'friend-manage-empty';
    empty.textContent = 'No friends yet. Use search above to add someone.';
    friendManageList.appendChild(empty);
    return;
  }

  friends.forEach((friend) => {
    if (!friend || typeof friend.username !== 'string') {
      return;
    }
    const item = document.createElement('div');
    item.className = 'friend-manage-item';
    item.dataset.username = friend.username;

    const info = document.createElement('div');
    info.className = 'friend-info';

    const name = document.createElement('span');
    name.className = 'friend-name';
    name.textContent = `@${friend.username}`;
    info.appendChild(name);

    const displayName =
      typeof friend.display_name === 'string' && friend.display_name.trim() ? friend.display_name.trim() : '';
    if (displayName) {
      const display = document.createElement('span');
      display.className = 'friend-display';
      display.textContent = displayName;
      info.appendChild(display);
    }

    const meta = document.createElement('span');
    meta.className = 'friend-meta';
    meta.textContent = formatFriendStatsSummary(friend);
    info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'friend-manage-actions';

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = 'secondary small';
    favoriteButton.dataset.friendAction = 'toggle-favorite';
    favoriteButton.dataset.username = friend.username;
    favoriteButton.textContent = friend.is_favorite ? 'Unfavorite' : 'Favorite';
    actions.appendChild(favoriteButton);

    const unfriendButton = document.createElement('button');
    unfriendButton.type = 'button';
    unfriendButton.className = 'secondary small danger';
    unfriendButton.dataset.friendAction = 'unfriend';
    unfriendButton.dataset.username = friend.username;
    unfriendButton.textContent = 'Unfriend';
    actions.appendChild(unfriendButton);

    item.appendChild(info);
    item.appendChild(actions);
    friendManageList.appendChild(item);
  });

  renderFriendRequestsSection();
}

function getFriendRequestTimeLabel(createdAt) {
  if (!createdAt) {
    return 'Moments ago';
  }
  const parsed = Date.parse(createdAt);
  if (Number.isNaN(parsed)) {
    return 'Moments ago';
  }
  return formatTimeAgo(parsed);
}

function createFriendRequestItem(request, type) {
  if (!request || typeof request.id === 'undefined') {
    return null;
  }
  const item = document.createElement('div');
  item.className = 'friend-request-item';
  item.dataset.requestId = String(request.id);

  const info = document.createElement('div');
  info.className = 'friend-info';

  const resolvedUsername =
    typeof request.username === 'string' && request.username.trim() ? request.username.trim() : 'unknown';
  const name = document.createElement('span');
  name.className = 'friend-name';
  name.textContent = `@${resolvedUsername}`;
  info.appendChild(name);

  const displayName =
    typeof request.display_name === 'string' && request.display_name.trim() ? request.display_name.trim() : '';
  if (displayName) {
    const display = document.createElement('span');
    display.className = 'friend-display';
    display.textContent = displayName;
    info.appendChild(display);
  }

  const meta = document.createElement('span');
  meta.className = 'friend-meta';
  const timeLabel = getFriendRequestTimeLabel(request.created_at);
  meta.textContent = type === 'incoming' ? `Requested ${timeLabel}` : `Sent ${timeLabel}`;
  info.appendChild(meta);

  item.appendChild(info);

  const actions = document.createElement('div');
  actions.className = 'friend-request-actions';

  if (type === 'incoming') {
    const acceptButton = document.createElement('button');
    acceptButton.type = 'button';
    acceptButton.className = 'primary small';
    acceptButton.dataset.requestAction = 'accept';
    acceptButton.dataset.requestId = String(request.id);
    acceptButton.textContent = 'Accept';
    actions.appendChild(acceptButton);

    const declineButton = document.createElement('button');
    declineButton.type = 'button';
    declineButton.className = 'secondary small danger';
    declineButton.dataset.requestAction = 'decline';
    declineButton.dataset.requestId = String(request.id);
    declineButton.textContent = 'Decline';
    actions.appendChild(declineButton);
  } else {
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'secondary small';
    cancelButton.dataset.requestAction = 'cancel';
    cancelButton.dataset.requestId = String(request.id);
    cancelButton.textContent = 'Cancel';
    actions.appendChild(cancelButton);
  }

  item.appendChild(actions);
  return item;
}

function renderFriendRequestsSection() {
  if (!friendRequestsPanel) {
    return;
  }

  const isLoggedIn = Boolean(isSessionAuthenticated && currentUser);
  if (!isLoggedIn) {
    if (friendRequestsFeedback) {
      friendRequestsFeedback.textContent = '';
    }
    if (friendRequestsIncomingList) {
      friendRequestsIncomingList.innerHTML = '';
    }
    if (friendRequestsOutgoingList) {
      friendRequestsOutgoingList.innerHTML = '';
    }
    if (friendRequestsIncomingEmpty) {
      friendRequestsIncomingEmpty.hidden = false;
    }
    if (friendRequestsOutgoingEmpty) {
      friendRequestsOutgoingEmpty.hidden = false;
    }
    return;
  }

  if (friendRequestsFeedback) {
    if (friendRequestsState.error) {
      friendRequestsFeedback.textContent = friendRequestsState.error;
    } else if (friendRequestsState.loading && !friendRequestsState.loaded) {
      friendRequestsFeedback.textContent = 'Loading friend requests…';
    } else {
      friendRequestsFeedback.textContent = '';
    }
  }

  const incoming = Array.isArray(friendRequestsState.incoming) ? friendRequestsState.incoming : [];
  const outgoing = Array.isArray(friendRequestsState.outgoing) ? friendRequestsState.outgoing : [];

  if (friendRequestsIncomingList) {
    friendRequestsIncomingList.innerHTML = '';
    incoming.forEach((request) => {
      const item = createFriendRequestItem(request, 'incoming');
      if (item) {
        friendRequestsIncomingList.appendChild(item);
      }
    });
  }
  if (friendRequestsIncomingEmpty) {
    friendRequestsIncomingEmpty.hidden = incoming.length > 0;
  }

  if (friendRequestsOutgoingList) {
    friendRequestsOutgoingList.innerHTML = '';
    outgoing.forEach((request) => {
      const item = createFriendRequestItem(request, 'outgoing');
      if (item) {
        friendRequestsOutgoingList.appendChild(item);
      }
    });
  }
  if (friendRequestsOutgoingEmpty) {
    friendRequestsOutgoingEmpty.hidden = outgoing.length > 0;
  }
}

async function refreshFriendRequests(force = false) {
  if (!isSessionAuthenticated || !currentUser) {
    friendRequestsState = {
      loading: false,
      loaded: false,
      error: null,
      incoming: [],
      outgoing: [],
    };
    renderFriendRequestsSection();
    return;
  }

  if (friendRequestsState.loading && !force) {
    return;
  }
  if (!force && friendRequestsState.loaded) {
    renderFriendRequestsSection();
    return;
  }

  friendRequestsState.loading = true;
  friendRequestsState.error = null;
  renderFriendRequestsSection();

  let sessionExpired = false;
  try {
    const response = await apiRequest('friend-requests/');
    friendRequestsState.incoming = Array.isArray(response?.incoming) ? response.incoming : [];
    friendRequestsState.outgoing = Array.isArray(response?.outgoing) ? response.outgoing : [];
    friendRequestsState.loaded = true;
    friendRequestsState.error = null;
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      friendRequestsState = {
        loading: false,
        loaded: false,
        error: null,
        incoming: [],
        outgoing: [],
      };
      sessionExpired = true;
    } else {
      friendRequestsState.error = 'Unable to load friend requests right now.';
      friendRequestsState.loaded = false;
      console.warn('Failed to load friend requests', error);
    }
  } finally {
    friendRequestsState.loading = false;
    renderFriendRequestsSection();
    if (sessionExpired) {
      updateStatus('Session expired. Sign in again to manage friend requests.');
    }
  }
}

function resetFriendSearchDirect() {
  if (!friendSearchDirect || !friendSearchAddDirectButton) {
    return;
  }
  friendSearchAddDirectButton.dataset.username = '';
  friendSearchAddDirectButton.disabled = false;
  friendSearchAddDirectButton.textContent = 'Send Friend Request';
  friendSearchDirect.classList.add('hidden');
}

function updateFriendSearchDirect(results, query) {
  if (!friendSearchDirect || !friendSearchAddDirectButton) {
    return;
  }
  friendSearchAddDirectButton.dataset.username = '';
  friendSearchAddDirectButton.disabled = false;
  const trimmedQuery = typeof query === 'string' ? query.trim() : '';
  if (!trimmedQuery) {
    friendSearchDirect.classList.add('hidden');
    return;
  }
  if (!Array.isArray(results) || !results.length) {
    friendSearchDirect.classList.add('hidden');
    return;
  }

  const exactMatch = results.find((player) => {
    if (!player || typeof player.username !== 'string') {
      return false;
    }
    return player.username.toLowerCase() === trimmedQuery.toLowerCase();
  });

  const preventDirectAdd =
    !exactMatch ||
    isFriendUsername(exactMatch.username) ||
    Boolean(exactMatch.is_friend) ||
    Boolean(exactMatch.incoming_request) ||
    Boolean(exactMatch.outgoing_request);

  if (preventDirectAdd) {
    friendSearchDirect.classList.add('hidden');
    return;
  }

  friendSearchAddDirectButton.dataset.username = exactMatch.username;
  friendSearchAddDirectButton.textContent = `Send request to @${exactMatch.username}`;
  friendSearchDirect.classList.remove('hidden');
}

function renderFriendSearchResults(results) {
  if (!friendSearchResults) {
    return;
  }
  friendSearchResults.innerHTML = '';
  if (!Array.isArray(results) || !results.length) {
    updateFriendSearchDirect([], friendSearchInput ? friendSearchInput.value : '');
    return;
  }

  results.forEach((player) => {
    if (!player || typeof player.username !== 'string') {
      return;
    }
    const item = document.createElement('div');
    item.className = 'friend-search-result';
    item.dataset.username = player.username;

    const info = document.createElement('div');
    info.className = 'friend-info';

    const name = document.createElement('span');
    name.className = 'friend-name';
    name.textContent = `@${player.username}`;
    info.appendChild(name);

    const displayName =
      typeof player.display_name === 'string' && player.display_name.trim() ? player.display_name.trim() : '';
    if (displayName) {
      const display = document.createElement('span');
      display.className = 'friend-display';
      display.textContent = displayName;
      info.appendChild(display);
    }

    const meta = document.createElement('span');
    meta.className = 'friend-meta';
    meta.textContent = formatFriendStatsSummary(player);
    info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'friend-search-actions';
    const alreadyFriend = Boolean(player.is_friend || isFriendUsername(player.username));
    const hasIncomingRequest = Boolean(player.incoming_request);
    const hasOutgoingRequest = Boolean(player.outgoing_request);
    if (alreadyFriend) {
      const label = document.createElement('span');
      label.className = 'friend-meta';
      label.textContent = 'Already friends';
      actions.appendChild(label);
    } else if (hasIncomingRequest) {
      const label = document.createElement('span');
      label.className = 'friend-meta';
      label.textContent = 'Request received';
      actions.appendChild(label);
    } else if (hasOutgoingRequest) {
      const label = document.createElement('span');
      label.className = 'friend-meta';
      label.textContent = 'Request sent';
      actions.appendChild(label);
    } else {
      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'primary small';
      addButton.dataset.friendAction = 'add';
      addButton.dataset.username = player.username;
      addButton.textContent = 'Send Request';
      actions.appendChild(addButton);
    }

    item.appendChild(info);
    item.appendChild(actions);
    friendSearchResults.appendChild(item);
  });

  updateFriendSearchDirect(results, friendSearchInput ? friendSearchInput.value : '');
}

function updateFriendsDrawerContent() {
  if (!friendsListContainer || !friendsEmptyState) {
    return;
  }

  const isLoggedIn = Boolean(isSessionAuthenticated && currentUser);

  if (friendsManageButton) {
    friendsManageButton.disabled = !isLoggedIn;
    friendsManageButton.title = isLoggedIn ? 'Manage your friend list.' : 'Sign in to manage friends.';
  }

  if (friendsInviteButton) {
    friendsInviteButton.disabled = !isLoggedIn;
    friendsInviteButton.title = isLoggedIn
      ? 'Share your invite link with a teammate.'
      : 'Sign in to invite friends.';
  }

  if (!isLoggedIn) {
    closeFriendsManagePanel();
    friendsEmptyState.hidden = false;
    friendsEmptyState.textContent = 'Sign in to see your friends list.';
    friendsListContainer.hidden = true;
    friendsListContainer.innerHTML = '';
    return;
  }

  if (friendsState.loading) {
    friendsEmptyState.hidden = false;
    friendsEmptyState.textContent = 'Loading your friends…';
    friendsListContainer.hidden = true;
    friendsListContainer.innerHTML = '';
    return;
  }

  if (friendsState.error) {
    friendsEmptyState.hidden = false;
    friendsEmptyState.textContent = friendsState.error;
    friendsListContainer.hidden = true;
    friendsListContainer.innerHTML = '';
    return;
  }

  const friends = Array.isArray(friendsState.items) ? friendsState.items : [];
  if (!friends.length) {
    friendsEmptyState.hidden = false;
    friendsEmptyState.textContent = 'No friends linked yet. Use Manage Friends to add teammates.';
    friendsListContainer.hidden = true;
    friendsListContainer.innerHTML = '';
    return;
  }

  friendsEmptyState.hidden = true;
  friendsListContainer.hidden = false;
  friendsListContainer.innerHTML = '';
  friends.forEach((friend) => {
    const card = renderFriendCard(friend);
    if (card) {
      friendsListContainer.appendChild(card);
    }
  });

  if (friendsManageOpen) {
    renderFriendManageList();
  }
}

async function refreshFriends(force = false) {
  if (!isSessionAuthenticated || !currentUser) {
    friendsState = {
      loading: false,
      loaded: true,
      error: null,
      items: [],
    };
    updateFriendsDrawerContent();
    updateFriendLocationsLayer();
    return;
  }
  if (friendsState.loading) {
    return;
  }
  if (!force && friendsState.loaded) {
    return;
  }

  friendsState.loading = true;
  friendsState.error = null;
  updateFriendsDrawerContent();

  try {
    const response = await apiRequest('friends/');
    const items = Array.isArray(response?.friends) ? response.friends : [];
    friendsState.items = sortFriends(items);
    friendsState.loaded = true;
    friendsState.error = null;
    updateFriendLocationsLayer();
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      friendsState = {
        loading: false,
        loaded: false,
        error: null,
        items: [],
      };
      updateFriendsDrawerContent();
      updateFriendLocationsLayer();
      return;
    }
    console.warn('Failed to load friends', error);
    friendsState.error = 'Unable to load friends right now.';
    friendsState.loaded = false;
  } finally {
    friendsState.loading = false;
    updateFriendsDrawerContent();
    if (friendsManageOpen) {
      renderFriendManageList();
    }
  }
}

function openFriendsManagePanel() {
  if (!friendsManagePanel || !isSessionAuthenticated || !currentUser) {
    return;
  }
  friendsManageOpen = true;
  friendsManagePanel.classList.remove('hidden');
  friendsManagePanel.setAttribute('aria-hidden', 'false');
  refreshFriends();
  refreshFriendRequests(true);
  renderFriendManageList();
  if (friendSearchInput) {
    friendSearchInput.focus();
  }
}

function closeFriendsManagePanel() {
  if (!friendsManagePanel) {
    friendsManageOpen = false;
    return;
  }
  friendsManageOpen = false;
  friendsManagePanel.classList.add('hidden');
  friendsManagePanel.setAttribute('aria-hidden', 'true');
  if (friendSearchResults) {
    friendSearchResults.innerHTML = '';
  }
  if (friendSearchFeedback) {
    friendSearchFeedback.textContent = '';
  }
  resetFriendSearchDirect();
  if (friendSearchInput) {
    friendSearchInput.value = '';
  }
}

async function performFriendSearch(query) {
  if (!friendSearchResults || !friendSearchFeedback) {
    return;
  }
  resetFriendSearchDirect();
  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) {
    friendSearchFeedback.textContent = 'Enter a username to search.';
    friendSearchResults.innerHTML = '';
    return;
  }
  if (trimmed.length < 2) {
    friendSearchFeedback.textContent = 'Enter at least two characters.';
    friendSearchResults.innerHTML = '';
    return;
  }
  if (!isSessionAuthenticated || !currentUser) {
    friendSearchFeedback.textContent = 'Sign in to search for friends.';
    friendSearchResults.innerHTML = '';
    return;
  }

  friendSearchFeedback.textContent = 'Searching…';
  friendSearchResults.innerHTML = '';
  if (friendSearchButton) {
    friendSearchButton.disabled = true;
  }
  if (friendSearchInput) {
    friendSearchInput.disabled = true;
  }

  try {
    const response = await apiRequest(`friends/search/?q=${encodeURIComponent(trimmed)}`);
    const results = Array.isArray(response?.results) ? response.results : [];
    if (results.length) {
      friendSearchFeedback.textContent = '';
    } else {
      friendSearchFeedback.textContent = 'No players found.';
    }
    renderFriendSearchResults(results);
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      friendSearchFeedback.textContent = 'Session expired. Sign in and try again.';
      resetFriendSearchDirect();
    } else if (error && error.cause) {
      friendSearchFeedback.textContent = 'Network error. Check your connection and try again.';
      resetFriendSearchDirect();
    } else {
      friendSearchFeedback.textContent = 'Unable to search for players right now.';
      resetFriendSearchDirect();
    }
    console.warn('Friend search failed', error);
  } finally {
    if (friendSearchButton) {
      friendSearchButton.disabled = false;
    }
    if (friendSearchInput) {
      friendSearchInput.disabled = false;
    }
  }
}

async function addFriendByUsername(username) {
  if (!username || !isSessionAuthenticated || !currentUser) {
    return;
  }
  try {
    const payload = await apiRequest('friends/', {
      method: 'POST',
      body: { username },
    });
    const friendData = payload && typeof payload === 'object' ? payload.friend : null;
    const requestData = payload && typeof payload === 'object' ? payload.friend_request : null;
    if (friendData && typeof friendData === 'object') {
      upsertFriend(friendData);
      updateFriendsDrawerContent();
      if (friendsManageOpen) {
        renderFriendManageList();
      }
      const addedUsername =
        typeof friendData.username === 'string' && friendData.username.trim() ? friendData.username.trim() : username;
      if (friendSearchFeedback) {
        friendSearchFeedback.textContent = `You're now friends with @${addedUsername}.`;
      }
      updateStatus(`You're now friends with @${addedUsername}.`);
      await refreshFriendRequests(true);
    }

    if (requestData && typeof requestData === 'object' && requestData.status === 'pending') {
      const requestedUsername =
        typeof requestData.username === 'string' && requestData.username.trim()
          ? requestData.username.trim()
          : username;
      if (friendSearchFeedback) {
        friendSearchFeedback.textContent = `Friend request sent to @${requestedUsername}.`;
      }
      await refreshFriendRequests(true);
      updateStatus(`Friend request sent to @${requestedUsername}.`);
    }
  } catch (error) {
    if (error && error.data && typeof error.data.detail === 'string' && friendSearchFeedback) {
      friendSearchFeedback.textContent = error.data.detail;
    } else if (error && error.status === 404 && friendSearchFeedback) {
      friendSearchFeedback.textContent = 'Player not found.';
    } else if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      if (friendSearchFeedback) {
        friendSearchFeedback.textContent = 'Session expired. Sign in and try again.';
      }
    } else if (friendSearchFeedback) {
      friendSearchFeedback.textContent = 'Unable to send friend request right now.';
    }
    console.warn('Failed to send friend request', error);
    return;
  }
  if (friendSearchInput && friendSearchInput.value.trim()) {
    performFriendSearch(friendSearchInput.value.trim());
  }
}

async function updateFriendFavorite(username, isFavorite) {
  if (!username || !isSessionAuthenticated || !currentUser) {
    return;
  }
  try {
    const payload = await apiRequest(`friends/${encodeURIComponent(username)}/`, {
      method: 'PATCH',
      body: { is_favorite: Boolean(isFavorite) },
    });
    if (payload && typeof payload === 'object') {
      upsertFriend(payload);
      updateFriendsDrawerContent();
      if (friendsManageOpen) {
        renderFriendManageList();
      }
    }
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      updateStatus('Session expired. Sign in again to manage friends.');
    } else {
      updateStatus('Unable to update favorite status right now.');
    }
    console.warn('Failed to update friend favorite', error);
  }
}

async function removeFriend(username) {
  if (!username || !isSessionAuthenticated || !currentUser) {
    return;
  }
  try {
    await apiRequest(`friends/${encodeURIComponent(username)}/`, {
      method: 'DELETE',
    });
    removeFriendFromState(username);
    updateFriendsDrawerContent();
    if (friendsManageOpen) {
      renderFriendManageList();
    }
    if (friendSearchInput && friendSearchInput.value.trim()) {
      performFriendSearch(friendSearchInput.value.trim());
    }
    updateStatus(`Removed @${username} from your friends.`);
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      updateStatus('Session expired. Sign in again to manage friends.');
    } else {
      updateStatus('Unable to remove friend. Try again later.');
    }
    console.warn('Failed to remove friend', error);
  }
}

async function handleFriendSearchSubmit(event) {
  event.preventDefault();
  if (!friendSearchInput) {
    return;
  }
  await performFriendSearch(friendSearchInput.value);
}

function handleFriendSearchAction(event) {
  const actionButton = event.target.closest('button[data-friend-action]');
  if (!actionButton) {
    return;
  }
  const action = actionButton.dataset.friendAction;
  const username = actionButton.dataset.username;
  if (!action || !username) {
    return;
  }
  if (action !== 'add') {
    return;
  }
  actionButton.disabled = true;
  addFriendByUsername(username)
    .catch((error) => {
      console.warn('Failed to process friend search action', error);
      if (friendSearchFeedback) {
        friendSearchFeedback.textContent = 'Unable to send friend request. Try again.';
      }
    })
    .finally(() => {
      actionButton.disabled = false;
    });
}

function handleFriendManageAction(event) {
  const actionButton = event.target.closest('button[data-friend-action]');
  if (!actionButton) {
    return;
  }
  const action = actionButton.dataset.friendAction;
  const username = actionButton.dataset.username;
  if (!action || !username) {
    return;
  }

  if (!isSessionAuthenticated || !currentUser) {
    updateStatus('Sign in to manage friends.');
    return;
  }

  if (action === 'toggle-favorite') {
    const friend = friendsState.items.find(
      (item) => item && typeof item.username === 'string' && item.username.toLowerCase() === username.toLowerCase(),
    );
    const nextFavorite = !(friend && friend.is_favorite);
    actionButton.disabled = true;
    updateFriendFavorite(username, nextFavorite).finally(() => {
      actionButton.disabled = false;
    });
    return;
  }

  if (action === 'unfriend') {
    if (!window.confirm(`Remove @${username} from your friends?`)) {
      return;
    }
    actionButton.disabled = true;
    removeFriend(username).finally(() => {
      actionButton.disabled = false;
    });
  }
}

async function handleFriendRequestAction(event) {
  const actionButton = event.target.closest('button[data-request-action]');
  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.requestAction;
  const requestIdRaw = actionButton.dataset.requestId;
  const requestId = Number.parseInt(requestIdRaw, 10);
  if (!action || Number.isNaN(requestId)) {
    return;
  }

  if (!isSessionAuthenticated || !currentUser) {
    updateStatus('Sign in to manage friend requests.');
    return;
  }

  actionButton.disabled = true;
  try {
    const payload = await apiRequest(`friend-requests/${requestId}/`, {
      method: 'PATCH',
      body: { action },
    });
    const friendData = payload && typeof payload === 'object' ? payload.friend : null;
    const requestData = payload && typeof payload === 'object' ? payload.friend_request : null;
    if (friendData && typeof friendData === 'object') {
      upsertFriend(friendData);
      refreshFriends(true);
      updateFriendsDrawerContent();
      if (friendsManageOpen) {
        renderFriendManageList();
      }
    }
    await refreshFriendRequests(true);
    const username =
      requestData && typeof requestData.username === 'string' && requestData.username.trim()
        ? requestData.username.trim()
        : '';
    let message = '';
    if (action === 'accept') {
      message = username ? `You're now friends with @${username}.` : 'Friend request accepted.';
    } else if (action === 'decline') {
      message = username ? `Declined @${username}'s friend request.` : 'Friend request declined.';
    } else if (action === 'cancel') {
      message = username ? `Canceled friend request to @${username}.` : 'Friend request canceled.';
    }
    if (message) {
      updateStatus(message);
    }
  } catch (error) {
    if (error && (error.status === 401 || error.status === 403)) {
      isSessionAuthenticated = false;
      activePlayerBackendId = null;
      updateStatus('Session expired. Sign in again to manage friend requests.');
    } else if (error && error.data && typeof error.data.detail === 'string') {
      updateStatus(error.data.detail);
    } else {
      updateStatus('Unable to update friend request. Try again.');
    }
    console.warn('Failed to update friend request', error);
  } finally {
    actionButton.disabled = false;
  }
}

function openFriendsDrawer(trigger = null) {
  if (!friendsDrawer || !friendsOverlay) {
    return;
  }
  closeRecentCheckinsDrawer({ restoreFocus: false });
  closeCharacterDrawer({ restoreFocus: false });
  closeDistrictDrawer({ restoreFocus: false });
  updateFriendsDrawerContent();
  refreshFriends();
  refreshFriendRequests();
  document.body.classList.add('friends-open');
  friendsDrawer.setAttribute('aria-hidden', 'false');
  friendsOverlay.classList.remove('hidden');
  friendsOverlay.setAttribute('aria-hidden', 'false');
  friendsLastTrigger = trigger || null;
  if (friendsButton) {
    friendsButton.setAttribute('aria-expanded', 'true');
  }
  window.setTimeout(() => {
    if (friendsContent && typeof friendsContent.focus === 'function') {
      friendsContent.focus();
    }
  }, 0);
}

function closeFriendsDrawer({ restoreFocus = true } = {}) {
  if (!friendsDrawer || !document.body.classList.contains('friends-open')) {
    return;
  }
  document.body.classList.remove('friends-open');
  friendsDrawer.setAttribute('aria-hidden', 'true');
  if (friendsOverlay) {
    friendsOverlay.classList.add('hidden');
    friendsOverlay.setAttribute('aria-hidden', 'true');
  }
  if (friendsButton) {
    friendsButton.setAttribute('aria-expanded', 'false');
  }
  if (restoreFocus && friendsLastTrigger && typeof friendsLastTrigger.focus === 'function') {
    friendsLastTrigger.focus();
  }
  friendsLastTrigger = null;
  closeFriendsManagePanel();
}

function computeCheckinPoints(entry) {
  if (!entry || typeof entry !== 'object') {
    return 0;
  }
  if (Number.isFinite(entry.points)) {
    return Number(entry.points);
  }
  const base = entry.ranged ? 10 : POINTS_PER_CHECKIN;
  const multiplier = Number(entry.multiplier);
  const resolvedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  return base * resolvedMultiplier;
}

function normaliseLeaderboardPlayer(username, sourceProfile) {
  if (!username || !sourceProfile) {
    return null;
  }
  const attackRaw = sourceProfile.attackPoints ?? sourceProfile.attack_points ?? 0;
  const defendRaw = sourceProfile.defendPoints ?? sourceProfile.defend_points ?? 0;
  const attackPoints = Math.max(0, Math.round(normaliseNumber(attackRaw, 0)));
  const defendPoints = Math.max(0, Math.round(normaliseNumber(defendRaw, 0)));

  let homeDistrictId = null;
  if (sourceProfile.homeDistrictId !== undefined && sourceProfile.homeDistrictId !== null) {
    homeDistrictId = safeId(sourceProfile.homeDistrictId);
  } else if (sourceProfile.home_district_code) {
    homeDistrictId = safeId(sourceProfile.home_district_code);
  } else if (sourceProfile.home_district_id) {
    homeDistrictId = safeId(sourceProfile.home_district_id);
  }

  const homeDistrictName =
    (typeof sourceProfile.homeDistrictName === 'string' && sourceProfile.homeDistrictName.trim()) ||
    (typeof sourceProfile.home_district_name === 'string' && sourceProfile.home_district_name.trim()) ||
    (typeof sourceProfile.home_district === 'string' && sourceProfile.home_district.trim()) ||
    (homeDistrictId ? `District ${homeDistrictId}` : null);

  const checkins = Array.isArray(sourceProfile.checkins)
    ? sourceProfile.checkins
    : Array.isArray(sourceProfile.recent_checkins)
    ? sourceProfile.recent_checkins
    : [];

  return {
    username,
    attackPoints,
    defendPoints,
    homeDistrictId,
    homeDistrictName,
    checkins,
  };
}

function buildDistrictLeaderboard(profile) {
  const homeId = profile && profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  if (!homeId) {
    return { homeId: null, aggressive: [], supporters: [], target: null, threat: null, hasData: false };
  }

  const playersMap = new Map();
  const addPlayerRecord = (username, sourceProfile, prefer = false) => {
    if (!username || !sourceProfile) {
      return;
    }
    const key = String(username).toLowerCase();
    const normalised = normaliseLeaderboardPlayer(username, sourceProfile);
    if (!normalised) {
      return;
    }
    if (!playersMap.has(key) || prefer) {
      playersMap.set(key, normalised);
      return;
    }
    const existing = playersMap.get(key);
    playersMap.set(key, {
      username: existing.username,
      attackPoints: Math.max(existing.attackPoints, normalised.attackPoints),
      defendPoints: Math.max(existing.defendPoints, normalised.defendPoints),
      homeDistrictId: normalised.homeDistrictId || existing.homeDistrictId,
      homeDistrictName: normalised.homeDistrictName || existing.homeDistrictName,
      checkins:
        (normalised.checkins && normalised.checkins.length > existing.checkins.length)
          ? normalised.checkins
          : existing.checkins,
    });
  };

  if (currentUser && profile) {
    addPlayerRecord(currentUser, profile, true);
  }

  Object.entries(players).forEach(([username, storedProfile]) => {
    if (!isValidUsername(username)) {
      return;
    }
    addPlayerRecord(username, storedProfile, username === currentUser);
  });

  if (Array.isArray(friendsState.items)) {
    friendsState.items.forEach((friend) => {
      if (friend && typeof friend.username === 'string') {
        addPlayerRecord(friend.username, friend, true);
      }
    });
  }

  const allPlayers = Array.from(playersMap.values());
  const homePlayers = allPlayers.filter(
    (player) => player.homeDistrictId && safeId(player.homeDistrictId) === homeId
  );

  const aggressive = homePlayers
    .map((player) => {
      const attack = player.attackPoints;
      const defend = player.defendPoints;
      const ratio = attack > 0 ? attack / Math.max(defend, 1) : 0;
      return { username: player.username, ratio, attack, defend };
    })
    .filter((item) => item.attack > 0 || item.defend > 0)
    .sort((a, b) => {
      if (b.ratio !== a.ratio) {
        return b.ratio - a.ratio;
      }
      if (b.attack !== a.attack) {
        return b.attack - a.attack;
      }
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    })
    .slice(0, 3);

  const supporters = homePlayers
    .map((player) => ({ username: player.username, defend: player.defendPoints, attack: player.attackPoints }))
    .filter((item) => item.defend > 0 || item.attack > 0)
    .sort((a, b) => {
      if (b.defend !== a.defend) {
        return b.defend - a.defend;
      }
      if (b.attack !== a.attack) {
        return b.attack - a.attack;
      }
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    })
    .slice(0, 3);

  const targetMap = new Map();
  homePlayers.forEach((player) => {
    const checkins = Array.isArray(player.checkins) ? player.checkins : [];
    checkins.forEach((entry) => {
      const type = entry && typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
      if (type !== 'attack') {
        return;
      }
      const districtId = entry.districtId ? safeId(entry.districtId) : null;
      if (!districtId || districtId === homeId) {
        return;
      }
      const points = computeCheckinPoints(entry);
      if (points <= 0) {
        return;
      }
      const existing = targetMap.get(districtId) || {
        id: districtId,
        name: (entry.districtName && entry.districtName.trim()) || `District ${districtId}`,
        points: 0,
      };
      existing.points += points;
      targetMap.set(districtId, existing);
    });
  });

  let topTarget = null;
  targetMap.forEach((value) => {
    if (!topTarget || value.points > topTarget.points) {
      topTarget = value;
    }
  });

  const threatMap = new Map();
  allPlayers.forEach((player) => {
    if (player.homeDistrictId && safeId(player.homeDistrictId) === homeId) {
      return;
    }
    const checkins = Array.isArray(player.checkins) ? player.checkins : [];
    checkins.forEach((entry) => {
      const type = entry && typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
      if (type !== 'attack') {
        return;
      }
      const districtId = entry.districtId ? safeId(entry.districtId) : null;
      if (!districtId || districtId !== homeId) {
        return;
      }
      const points = computeCheckinPoints(entry);
      if (points <= 0) {
        return;
      }
      const threatId = player.homeDistrictId ? safeId(player.homeDistrictId) : 'unknown';
      const displayName =
        player.homeDistrictName || (player.homeDistrictId ? `District ${player.homeDistrictId}` : 'Unknown');
      const existing = threatMap.get(threatId) || { id: threatId, name: displayName, points: 0 };
      existing.points += points;
      threatMap.set(threatId, existing);
    });
  });

  let topThreat = null;
  threatMap.forEach((value) => {
    if (!topThreat || value.points > topThreat.points) {
      topThreat = value;
    }
  });

  const hasData =
    aggressive.length > 0 || supporters.length > 0 || Boolean(topTarget) || Boolean(topThreat);

  return {
    homeId,
    aggressive,
    supporters,
    target: topTarget,
    threat: topThreat,
    hasData,
  };
}

function renderDistrictLeaderboard(data) {
  if (!districtLeaderboardContainer) {
    return;
  }

  if (!data || !data.homeId) {
    if (districtLeaderboardContainer) {
      districtLeaderboardContainer.style.display = 'none';
    }
    if (districtLeaderboardEmpty) {
      districtLeaderboardEmpty.textContent = 'Set a home district to see player rankings.';
      districtLeaderboardEmpty.style.display = 'block';
    }
    return;
  }

  districtLeaderboardContainer.style.display = 'flex';

  const showHomeData = Boolean(data && data.homeId);
  const hasLeaderboardData = Boolean(data && data.hasData);

  if (districtLeaderboardEmpty) {
    if (!showHomeData) {
      districtLeaderboardEmpty.style.display = 'block';
      districtLeaderboardEmpty.textContent = 'Set a home district to see player rankings.';
    } else if (!hasLeaderboardData) {
      districtLeaderboardEmpty.style.display = 'block';
      districtLeaderboardEmpty.textContent = 'No leaderboard data yet. Start checking in to populate rankings.';
    } else {
      districtLeaderboardEmpty.style.display = 'none';
    }
  }

  const resetList = (element) => {
    if (element) {
      element.innerHTML = '';
    }
  };

  resetList(districtLeaderboardAggressive);
  resetList(districtLeaderboardSupport);

  if (districtTargetValue) {
    districtTargetValue.textContent = '—';
  }
  if (districtThreatValue) {
    districtThreatValue.textContent = '—';
  }

  if (!showHomeData) {
    return;
  }

  const formatPointsValue = (value) => `${Math.round(value).toLocaleString()} pts`;

  if (districtLeaderboardAggressive) {
    if (!data.aggressive.length) {
      const li = document.createElement('li');
      li.className = 'leaderboard-empty';
      li.textContent = 'No attack activity yet.';
      districtLeaderboardAggressive.appendChild(li);
    } else {
      data.aggressive.forEach((item) => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'leaderboard-name';
        nameSpan.textContent = `@${item.username}`;
        const metricSpan = document.createElement('span');
        metricSpan.className = 'leaderboard-metric';
        const ratio = item.ratio > 0 ? item.ratio.toFixed(2) : '0.00';
        metricSpan.textContent = `${ratio} A/D • ${item.attack.toLocaleString()} atk / ${item.defend.toLocaleString()} def`;
        li.appendChild(nameSpan);
        li.appendChild(metricSpan);
        districtLeaderboardAggressive.appendChild(li);
      });
    }
  }

  if (districtLeaderboardSupport) {
    if (!data.supporters.length) {
      const li = document.createElement('li');
      li.className = 'leaderboard-empty';
      li.textContent = 'No defensive activity yet.';
      districtLeaderboardSupport.appendChild(li);
    } else {
      data.supporters.forEach((item) => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'leaderboard-name';
        nameSpan.textContent = `@${item.username}`;
        const metricSpan = document.createElement('span');
        metricSpan.className = 'leaderboard-metric';
        metricSpan.textContent = `${item.defend.toLocaleString()} defend pts`;
        li.appendChild(nameSpan);
        li.appendChild(metricSpan);
        districtLeaderboardSupport.appendChild(li);
      });
    }
  }

  if (districtTargetValue) {
    districtTargetValue.textContent = data.target
      ? `${data.target.name} • ${formatPointsValue(data.target.points)}`
      : 'No offensive activity yet.';
  }

  if (districtThreatValue) {
    districtThreatValue.textContent = data.threat
      ? `${data.threat.name} • ${formatPointsValue(data.threat.points)}`
      : 'No threats detected yet.';
  }
}

function updateDistrictDrawerContent(profile = null) {
  if (
    !districtHomeNameValue ||
    !districtContributionValue ||
    !districtRecentActivityValue ||
    !districtPerformanceBlurb ||
    !districtCheckinsCountValue ||
    !districtLastContestedValue ||
    !districtControlStatusValue
  ) {
    return;
  }
  const resolvedProfile = profile || (currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null);
  const leaderboardData = buildDistrictLeaderboard(resolvedProfile);
  renderDistrictLeaderboard(leaderboardData);
  if (!resolvedProfile) {
    districtHomeNameValue.textContent = 'Not set';
    districtContributionValue.textContent = '0 pts';
    districtRecentActivityValue.textContent = 'No check-ins yet';
    districtPerformanceBlurb.textContent = 'Sign in and choose a home district to see its performance.';
    districtCheckinsCountValue.textContent = '0';
    districtLastContestedValue.textContent = '—';
    districtControlStatusValue.textContent = 'Not assigned';
    return;
  }

  const homeName =
    (resolvedProfile.homeDistrictName && resolvedProfile.homeDistrictName.trim()) ||
    (resolvedProfile.homeDistrictId ? `District ${resolvedProfile.homeDistrictId}` : 'Not set');
  districtHomeNameValue.textContent = homeName;

  const points = Math.max(0, Math.round(Number(resolvedProfile.points) || 0));
  districtContributionValue.textContent = `${points.toLocaleString()} pts`;

  const checkinsCount =
    resolvedProfile.serverCheckinCount || (Array.isArray(resolvedProfile.checkins) ? resolvedProfile.checkins.length : 0);
  districtCheckinsCountValue.textContent = checkinsCount.toLocaleString();

  const latestCheckin =
    Array.isArray(resolvedProfile.checkins) && resolvedProfile.checkins.length
      ? resolvedProfile.checkins[0]
      : null;
  if (latestCheckin) {
    districtRecentActivityValue.textContent = formatRecentCheckinTag(latestCheckin);
    districtLastContestedValue.textContent = latestCheckin.timestamp ? formatTimeAgo(latestCheckin.timestamp) : 'Just now';
  } else {
    districtRecentActivityValue.textContent = 'No check-ins yet';
    districtLastContestedValue.textContent = '—';
  }

  const hasHomeDistrict =
    Boolean(resolvedProfile.homeDistrictId) || Boolean(resolvedProfile.homeDistrictName && resolvedProfile.homeDistrictName.trim());
  if (!hasHomeDistrict) {
    districtPerformanceBlurb.textContent = 'Choose a home district to start building its strength.';
    districtControlStatusValue.textContent = 'Not assigned';
    return;
  }

  const defendCount = Array.isArray(resolvedProfile.checkins)
    ? resolvedProfile.checkins.filter((entry) => entry && String(entry.type).toLowerCase() === 'defend').length
    : 0;
  const latestType = latestCheckin && typeof latestCheckin.type === 'string' ? latestCheckin.type.toLowerCase() : '';
  let controlStatus = 'Holding steady';
  if (!latestCheckin) {
    controlStatus = 'Awaiting activity';
  } else if (latestType === 'defend') {
    controlStatus = 'Fortifying defenses';
  } else if (latestType === 'attack') {
    controlStatus = 'On the offensive';
  } else {
    controlStatus = 'Expanding influence';
  }
  districtControlStatusValue.textContent = controlStatus;

  const defendText = defendCount
    ? `You have logged ${defendCount.toLocaleString()} defend ${defendCount === 1 ? 'action' : 'actions'} in ${homeName}.`
    : `Visit ${homeName} to defend and boost its resilience.`;
  districtPerformanceBlurb.textContent = `You have contributed ${points.toLocaleString()} pts across ${checkinsCount.toLocaleString()} check-ins. ${defendText}`;
}

function openDistrictDrawer(trigger = null) {
  if (!districtDrawer || !districtOverlay) {
    return;
  }
  closeFriendsDrawer({ restoreFocus: false });
  closeCharacterDrawer({ restoreFocus: false });
  closeRecentCheckinsDrawer({ restoreFocus: false });
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  updateDistrictDrawerContent(profile);
  document.body.classList.add('district-open');
  districtDrawer.setAttribute('aria-hidden', 'false');
  districtOverlay.classList.remove('hidden');
  districtOverlay.setAttribute('aria-hidden', 'false');
  districtLastTrigger = trigger || null;
  if (districtButton) {
    districtButton.setAttribute('aria-expanded', 'true');
  }
  window.setTimeout(() => {
    if (districtContent && typeof districtContent.focus === 'function') {
      districtContent.focus();
    }
  }, 0);
}

function closeDistrictDrawer({ restoreFocus = true } = {}) {
  if (!districtDrawer || !document.body.classList.contains('district-open')) {
    return;
  }
  document.body.classList.remove('district-open');
  districtDrawer.setAttribute('aria-hidden', 'true');
  if (districtOverlay) {
    districtOverlay.classList.add('hidden');
    districtOverlay.setAttribute('aria-hidden', 'true');
  }
  if (districtButton) {
    districtButton.setAttribute('aria-expanded', 'false');
  }
  if (restoreFocus && districtLastTrigger && typeof districtLastTrigger.focus === 'function') {
    districtLastTrigger.focus();
  }
  districtLastTrigger = null;
}

function updateCharacterDrawerContent(profile = null) {
  if (
    !characterNameLabel ||
    !characterAvatarInitial ||
    !characterTagline ||
    !characterPointsValue ||
    !characterLevelValue ||
    !characterCheckinsValue ||
    !characterAttackDefendValue ||
    !characterChargeValue ||
    !characterCooldownValue ||
    !characterInteractionsList ||
    !characterInteractionsEmpty
  ) {
    return;
  }
  const resolvedProfile = profile || (currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null);
  if (!resolvedProfile || !currentUser) {
    characterNameLabel.textContent = 'Guest';
    characterAvatarInitial.textContent = 'G';
    characterTagline.textContent = 'Sign in to personalise your character.';
    characterPointsValue.textContent = '0';
    characterLevelValue.textContent = '1';
    characterCheckinsValue.textContent = '0';
    characterAttackDefendValue.textContent = '0 / 0';
    characterChargeValue.textContent = 'x1';
    characterCooldownValue.textContent = 'Ready';
    characterInteractionsList.innerHTML = '';
    characterInteractionsList.hidden = true;
    characterInteractionsEmpty.hidden = false;
    return;
  }

  const displayName = currentUser;
  const trimmedName = displayName.trim();
  characterNameLabel.textContent = trimmedName || 'Player';
  const initial = trimmedName ? trimmedName.charAt(0).toUpperCase() : 'P';
  characterAvatarInitial.textContent = initial;

  const homeName =
    (resolvedProfile.homeDistrictName && resolvedProfile.homeDistrictName.trim()) ||
    (resolvedProfile.homeDistrictId ? `District ${resolvedProfile.homeDistrictId}` : null);
  if (homeName) {
    characterTagline.textContent = `Champion of ${homeName}`;
  } else if (resolvedProfile.points > 0) {
    characterTagline.textContent = `Rising with ${Math.round(resolvedProfile.points).toLocaleString()} pts earned.`;
  } else {
    characterTagline.textContent = 'Set a home district to unlock territory bonuses.';
  }

  const points = Math.max(0, Math.round(Number(resolvedProfile.points) || 0));
  characterPointsValue.textContent = points.toLocaleString();

  const calculatedLevel = Math.max(1, Math.floor(points / 250) + 1);
  characterLevelValue.textContent = calculatedLevel.toLocaleString();

  const checkinsCount =
    resolvedProfile.serverCheckinCount || (Array.isArray(resolvedProfile.checkins) ? resolvedProfile.checkins.length : 0);
  characterCheckinsValue.textContent = checkinsCount.toLocaleString();

  const attackPoints = Math.max(0, Math.round(Number(resolvedProfile.attackPoints) || 0));
  const defendPoints = Math.max(0, Math.round(Number(resolvedProfile.defendPoints) || 0));
  characterAttackDefendValue.textContent = `${attackPoints.toLocaleString()} / ${defendPoints.toLocaleString()}`;

  const multiplier = Math.max(1, Number(resolvedProfile.nextCheckinMultiplier) || 1);
  characterChargeValue.textContent = `x${multiplier}`;

  ensureProfileCooldownState(resolvedProfile);
  const now = Date.now();
  let closestKey = null;
  let closestDeadline = Number.POSITIVE_INFINITY;
  Object.keys(resolvedProfile.cooldowns || {}).forEach((key) => {
    const deadline = resolvedProfile.cooldowns[key];
    if (typeof deadline === 'number' && deadline > now && deadline < closestDeadline) {
      closestKey = key;
      closestDeadline = deadline;
    }
  });
  if (closestKey) {
    const remaining = closestDeadline - now;
    const details = resolvedProfile.cooldownDetails ? resolvedProfile.cooldownDetails[closestKey] : null;
    const mode = details && typeof details.mode === 'string' ? details.mode : null;
    characterCooldownValue.textContent = `${formatCooldownLabel(closestKey, mode)} ${formatCooldownTime(remaining)}`;
  } else {
    characterCooldownValue.textContent = 'Ready';
  }

  characterInteractionsList.innerHTML = '';
  const recentInteractions = Array.isArray(resolvedProfile.checkins) ? resolvedProfile.checkins.slice(0, 4) : [];
  if (!recentInteractions.length) {
    characterInteractionsList.hidden = true;
    characterInteractionsEmpty.hidden = false;
    characterInteractionsEmpty.textContent = 'No interactions yet. Check in to build your story.';
  } else {
    characterInteractionsList.hidden = false;
    characterInteractionsEmpty.hidden = true;
    recentInteractions.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = formatRecentCheckinTag(entry);
      characterInteractionsList.appendChild(item);
    });
  }
}

function openCharacterDrawer(trigger = null) {
  if (!characterDrawer || !characterOverlay) {
    return;
  }
  closeRecentCheckinsDrawer({ restoreFocus: false });
  closeFriendsDrawer({ restoreFocus: false });
  closeDistrictDrawer({ restoreFocus: false });
  const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
  updateCharacterDrawerContent(profile);
  document.body.classList.add('character-open');
  characterDrawer.setAttribute('aria-hidden', 'false');
  characterOverlay.classList.remove('hidden');
  characterOverlay.setAttribute('aria-hidden', 'false');
  characterLastTrigger = trigger || null;
  if (currentUserTag) {
    currentUserTag.setAttribute('aria-expanded', 'true');
  }
  window.setTimeout(() => {
    if (characterContent && typeof characterContent.focus === 'function') {
      characterContent.focus();
    }
  }, 0);
}

function closeCharacterDrawer({ restoreFocus = true } = {}) {
  if (!characterDrawer || !document.body.classList.contains('character-open')) {
    return;
  }
  document.body.classList.remove('character-open');
  characterDrawer.setAttribute('aria-hidden', 'true');
  if (characterOverlay) {
    characterOverlay.classList.add('hidden');
    characterOverlay.setAttribute('aria-hidden', 'true');
  }
  if (currentUserTag) {
    currentUserTag.setAttribute('aria-expanded', 'false');
  }
  if (restoreFocus && characterLastTrigger && typeof characterLastTrigger.focus === 'function') {
    characterLastTrigger.focus();
  }
  characterLastTrigger = null;
}

function populateDrawerHomeSelect(profile) {
  if (!drawerHomeSelect) {
    return;
  }
  if (!profile) {
    drawerHomeSelect.innerHTML = '<option value="">Sign in to choose a home district</option>';
    drawerHomeSelect.disabled = true;
    if (drawerHomeSaveButton) {
      drawerHomeSaveButton.disabled = true;
    }
    return;
  }
  drawerHomeSelect.innerHTML = '<option value="">Loading districts…</option>';
  drawerHomeSelect.disabled = true;
  getHomeDistrictOptions()
    .then((options) => {
      if (!drawerHomeSelect) {
        return;
      }
      const currentId = profile && profile.homeDistrictId ? safeId(profile.homeDistrictId) : '';
      const fragment = document.createDocumentFragment();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose a district';
      fragment.appendChild(placeholder);
      options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option.id;
        opt.textContent = option.name;
        if (currentId && option.id === currentId) {
          opt.selected = true;
        }
        fragment.appendChild(opt);
      });
      drawerHomeSelect.innerHTML = '';
      drawerHomeSelect.appendChild(fragment);
      drawerHomeSelect.disabled = false;
      drawerHomeSaveButton && (drawerHomeSaveButton.disabled = !drawerHomeSelect.value);
    })
    .catch((error) => {
      console.warn('Failed to populate home district select', error);
      if (!drawerHomeSelect) {
        return;
      }
      drawerHomeSelect.innerHTML = '<option value="">Unavailable</option>';
      drawerHomeSelect.disabled = true;
      drawerHomeSaveButton && (drawerHomeSaveButton.disabled = true);
    });
}

function updateDrawerSummaries(profile) {
  if (!drawerHomeSummary || !drawerLocationSummary) {
    return;
  }

  if (drawerPlayerUsernameSummary) {
    const usernameText = profile && currentUser ? currentUser : 'Not signed in';
    drawerPlayerUsernameSummary.textContent = usernameText;
    drawerPlayerUsernameSummary.title = profile
      ? `Signed in as ${usernameText}`
      : 'Log in to view character details.';
  }

  if (!profile) {
    if (drawerAdRatioSummary) {
      drawerAdRatioSummary.textContent = '—';
      drawerAdRatioSummary.title = 'Attack/Defend ratio available after sign-in.';
    }
    if (drawerHomeStrengthSummary) {
      drawerHomeStrengthSummary.textContent = 'Not set';
      drawerHomeStrengthSummary.title = 'Choose a home district to build its strength.';
    }
    drawerHomeSummary.textContent = 'Not set';
    drawerHomeSummary.classList.remove('home', 'away');
    drawerLocationSummary.textContent = 'Unknown';
    drawerLocationSummary.classList.remove('home', 'away');
    return;
  }

  if (drawerAdRatioSummary) {
    const ratioText = formatAttackDefendRatio(profile);
    const attackDisplay = Math.round(profile.attackPoints);
    const defendDisplay = Math.round(profile.defendPoints);
    drawerAdRatioSummary.textContent = ratioText;
    drawerAdRatioSummary.title =
      attackDisplay === 0 && defendDisplay === 0
        ? 'No attack or defend points yet.'
        : `Attack: ${attackDisplay.toLocaleString()} pts • Defend: ${defendDisplay.toLocaleString()} pts`;
  }

  if (drawerHomeStrengthSummary) {
    if (profile.homeDistrictId) {
      const strength = getDistrictStrength(profile.homeDistrictId);
      const entry = ensureDistrictScoreEntry(profile.homeDistrictId, profile.homeDistrictName || null);
      const defended = entry ? Math.round(entry.defended) : 0;
      const attacked = entry ? Math.round(entry.attacked) : 0;
      drawerHomeStrengthSummary.textContent = `${Math.round(strength).toLocaleString()} pts`;
      const details = [
        `Base: ${DISTRICT_BASE_SCORE.toLocaleString()} pts`,
        defended ? `Defended bonus: +${defended.toLocaleString()} pts` : null,
        attacked ? `Damage taken: -${attacked.toLocaleString()} pts` : null,
      ]
        .filter(Boolean)
        .join(' • ');
      drawerHomeStrengthSummary.title = details || 'District strength';
    } else {
      drawerHomeStrengthSummary.textContent = 'Not set';
      drawerHomeStrengthSummary.title = 'Choose a home district to build its strength.';
    }
  }

  const homeName = profile.homeDistrictName && profile.homeDistrictName.trim()
    ? profile.homeDistrictName.trim()
    : profile.homeDistrictId
    ? `District ${profile.homeDistrictId}`
    : 'Not set';
  drawerHomeSummary.textContent = homeName;
  drawerHomeSummary.classList.remove('home', 'away');
  if (profile.homeDistrictId) {
    drawerHomeSummary.classList.add('home');
  }

  let locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  if ((!locationInfo || !locationInfo.id) && lastPreciseLocationInfo && lastPreciseLocationInfo.id) {
    locationInfo = {
      id: safeId(lastPreciseLocationInfo.id),
      name: lastPreciseLocationInfo.name || `District ${lastPreciseLocationInfo.id}`,
      source: 'cached',
    };
  }
  let fallbackInfo = null;
  if (!locationInfo || !locationInfo.id) {
    fallbackInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  }

  if (!locationInfo || !locationInfo.id) {
    const profileSummary = getProfileLastKnownSummary(profile);
    drawerLocationSummary.classList.remove('home', 'away', 'fallback');
    if (profileSummary) {
      drawerLocationSummary.textContent = profileSummary.name;
      if (profile.homeDistrictId && profileSummary.id && safeId(profile.homeDistrictId) === safeId(profileSummary.id)) {
        drawerLocationSummary.classList.add('home');
      } else {
        drawerLocationSummary.classList.add('away');
      }
    } else if (fallbackInfo && fallbackInfo.source === 'home-fallback') {
      drawerLocationSummary.textContent = 'Home district (fallback)';
      drawerLocationSummary.classList.add('fallback');
    } else if (fallbackInfo && fallbackInfo.id) {
      const name = fallbackInfo.name || `District ${fallbackInfo.id}`;
      drawerLocationSummary.textContent = `${name} (fallback)`;
      drawerLocationSummary.classList.add('away');
    } else {
      drawerLocationSummary.textContent = 'Unknown';
    }
  } else {
    drawerLocationSummary.classList.remove('home', 'away', 'fallback');
    const name = locationInfo.name || `District ${locationInfo.id}`;
    drawerLocationSummary.textContent = name;
    if (profile.homeDistrictId && safeId(profile.homeDistrictId) === safeId(locationInfo.id)) {
      drawerLocationSummary.classList.add('home');
    } else {
      drawerLocationSummary.classList.add('away');
    }
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) {
    return 'Just now';
  }
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);
  if (diffSeconds < 60) {
    return 'Just now';
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} wk${diffWeeks === 1 ? '' : 's'} ago`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} mo${diffMonths === 1 ? '' : 's'} ago`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} yr${diffYears === 1 ? '' : 's'} ago`;
}

async function handleLogin(event) {
  if (event) {
    event.preventDefault();
  }
  if (!usernameInput || !passwordInput) {
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const rememberRequested = rememberPasswordInput ? rememberPasswordInput.checked : false;

  if (!username || !password) {
    updateStatus('Enter both username and password to continue.');
    return;
  }
  if (!isValidUsername(username)) {
    updateStatus('Invalid username. Use 3-32 letters, numbers, or underscores. Need an account? Click “Create one here”.');
    usernameInput.focus();
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    updateStatus(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    return;
  }

  const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
  const resetSubmittingState = () => {
    if (submitButton) {
      submitButton.disabled = false;
    }
    if (loginForm) {
      loginForm.classList.remove('is-submitting');
    }
  };

  if (loginForm) {
    loginForm.classList.add('is-submitting');
  }
  if (submitButton) {
    submitButton.disabled = true;
  }
  updateStatus('Signing you in…');

  try {
    const result = await apiRequest('session/login/', {
      method: 'POST',
      body: { username, password },
    });
    const apiPlayer = result && typeof result === 'object' ? result.player : null;
    if (!apiPlayer) {
      throw new Error('Login succeeded but player data was unavailable.');
    }

    players[username] = {};
    const profile = ensurePlayerProfile(username);
    applyServerPlayerData(profile, apiPlayer);
    profile.auth = { rememberOnDevice: rememberRequested };

    isSessionAuthenticated = true;
    activePlayerBackendId = profile.backendId || null;

    usernameInput.value = '';
    passwordInput.value = '';

    const welcomeName = apiPlayer.display_name || username;
    completeAuthenticatedLogin(username, profile, {
      message: `Welcome back, ${welcomeName}.`,
      triggerGeolocation: true,
    });
  } catch (error) {
    let message = 'Unable to sign in. Please try again.';
    if (error && typeof error === 'object') {
      if (error.status === 401) {
        message = 'Incorrect username or password.';
      } else if (error.status === 503) {
        // Backend reports DB schema is outdated (e.g., missing migrations). Surface clear guidance.
        const serverDetail = error.data && typeof error.data.detail === 'string' ? error.data.detail : null;
        const action = error.data && typeof error.data.action === 'string' ? error.data.action : 'run ./scripts/migrate.sh or python manage.py migrate';
        message = serverDetail || 'Server database is not up to date. Please apply migrations.';
        message += ` — To fix locally: ./scripts/setup.sh (first time), then ${action}.`;
      } else if (error.status === 400 && error.data && typeof error.data === 'object') {
        if (Array.isArray(error.data.non_field_errors) && error.data.non_field_errors.length) {
          message = error.data.non_field_errors[0];
        } else if (typeof error.data.detail === 'string') {
          message = error.data.detail;
        }
      } else if (error.cause) {
        message = 'Network error. Check your connection and try again.';
      }
      if (error.status === 401 || error.status === 403) {
        isSessionAuthenticated = false;
        activePlayerBackendId = null;
      }
    }
    console.warn('Login failed', error);
    passwordInput.value = '';
    passwordInput.focus();
    updateStatus(message);
    return;
  } finally {
    resetSubmittingState();
  }
}

function completeAuthenticatedLogin(username, profile, options = {}) {
  if (!username || !profile) {
    return;
  }

  if (!profile.cooldowns || typeof profile.cooldowns !== 'object') {
    profile.cooldowns = {};
  }
  if (!profile.cooldownDetails || typeof profile.cooldownDetails !== 'object') {
    profile.cooldownDetails = {};
  }
  ensureProfileCooldownState(profile);
  currentUser = username;
  players[username] = profile;
  applyMarkerColorTheme(profile.mapMarkerColor || DEFAULT_MARKER_COLOR);
  friendsState = {
    loading: false,
    loaded: false,
    error: null,
    items: [],
  };
  friendRequestsState = {
    loading: false,
    loaded: false,
    error: null,
    incoming: [],
    outgoing: [],
  };
  updateFriendLocationsLayer();
  renderFriendRequestsSection();
  closeFriendsManagePanel();
  if (profile.backendId !== undefined && profile.backendId !== null) {
    activePlayerBackendId = profile.backendId;
    isSessionAuthenticated = true;
  }
  if (
    profile.lastKnownLocation &&
    typeof profile.lastKnownLocation.lng === 'number' &&
    typeof profile.lastKnownLocation.lat === 'number'
  ) {
    lastKnownLocation = [profile.lastKnownLocation.lng, profile.lastKnownLocation.lat];
  }
  if (profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
    lastPreciseLocationInfo = {
      id: safeId(profile.lastKnownLocation.districtId),
      name:
        (profile.lastKnownLocation.districtName && profile.lastKnownLocation.districtName.trim()) ||
        `District ${profile.lastKnownLocation.districtId}`,
    };
  }

  const rememberState = Boolean(profile.auth && profile.auth.rememberOnDevice);
  if (rememberPasswordInput) {
    rememberPasswordInput.checked = rememberState;
  }

  if (rememberState) {
    setLastSignedInUser(username);
  } else if (getLastSignedInUser() === username) {
    setLastSignedInUser(null);
  }
  savePlayers();
  renderKnownPlayers();
  renderPlayerState();
  if (isMobileViewport()) {
    setMobileDrawerState(false);
  }
  refreshFriends(true).catch(() => null);

  if (isSecureOrigin()) {
    startLiveLocationWatch();
  }

  if (typeof options.message === 'string' && options.message.trim()) {
    updateStatus(options.message.trim());
  }

  const triggerGeolocation = options.triggerGeolocation !== false;
  showMap(triggerGeolocation);
}

function handleExistingPlayer(username) {
  if (!username) {
    return;
  }
  const safeName = username.trim();
  if (!isValidUsername(safeName)) {
    updateStatus('Invalid username. Create a new account to continue.');
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(players, safeName)) {
    updateStatus('Player not found. Create a new account to continue.');
    return;
  }
  const profile = ensurePlayerProfile(safeName);
  const hasStoredLocation = profile && profile.lastKnownLocation && typeof profile.lastKnownLocation.lng === 'number' && typeof profile.lastKnownLocation.lat === 'number';
  lastKnownLocation = hasStoredLocation ? [profile.lastKnownLocation.lng, profile.lastKnownLocation.lat] : null;
  if (profile && profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
    lastPreciseLocationInfo = {
      id: safeId(profile.lastKnownLocation.districtId),
      name:
        (profile.lastKnownLocation.districtName && profile.lastKnownLocation.districtName.trim()) ||
        `District ${profile.lastKnownLocation.districtId}`,
    };
  } else {
    lastPreciseLocationInfo = null;
  }
  if (usernameInput) {
    usernameInput.value = safeName;
  }
  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.focus();
  }
  if (rememberPasswordInput) {
    rememberPasswordInput.checked = Boolean(profile && profile.auth && profile.auth.rememberOnDevice);
  }
  updateStatus(`Enter password for ${safeName}.`);
}

function switchToWelcome() {
  if (gameScreen) {
    gameScreen.classList.add('hidden');
  }
  if (welcomeScreen) {
    welcomeScreen.classList.remove('hidden');
  }
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.add('welcome-active');
    document.body.classList.remove('game-active');
  }
  if (usernameInput) {
    usernameInput.value = '';
  }
  if (passwordInput) {
    passwordInput.value = '';
  }
  if (rememberPasswordInput) {
    rememberPasswordInput.checked = false;
  }
  if (devChangeUserButton) {
    devChangeUserButton.hidden = true;
    devChangeUserButton.disabled = true;
  }
  if (devClearUsersButton) {
    devClearUsersButton.hidden = true;
    devClearUsersButton.disabled = true;
  }
  lastKnownLocation = null;
  lastPreciseLocationInfo = null;
  currentDistrictId = null;
  currentDistrictName = null;
  stopLiveLocationWatch();
  if (isMobileViewport()) {
    setMobileDrawerState(false);
  }
  updateStatus('Sign in to begin your exploration.');
  renderKnownPlayers();
  prefillLastSignedInUser();
}

async function handleCheckIn(options = {}) {
  const contextCoords = options && options.contextCoords ? [...options.contextCoords] : null;
  const contextPoint = options && options.contextPoint ? { ...options.contextPoint } : null;
  const hasTargetDistrictId = options && Object.prototype.hasOwnProperty.call(options, 'targetDistrictId');
  const rawTargetDistrictId = hasTargetDistrictId ? options.targetDistrictId : null;
  let targetDistrictId = rawTargetDistrictId !== null && rawTargetDistrictId !== undefined ? safeId(rawTargetDistrictId) : null;
  let targetDistrictName =
    options && typeof options.targetDistrictName === 'string' && options.targetDistrictName.trim()
      ? options.targetDistrictName.trim()
      : null;
  const contextIsLocal = Boolean(options && options.contextIsLocal);
  if (!currentUser) {
    updateStatus('Log in to check in.');
    return;
  }

  hideActionContextMenu();

  await ensureDistrictDataLoaded();

  if ((!currentDistrictId || !currentDistrictName) && lastKnownLocation) {
    if (districtGeoJson && Array.isArray(districtGeoJson.features)) {
      const feature = findDistrictFeatureByPoint(lastKnownLocation[0], lastKnownLocation[1]);
      if (feature) {
        currentDistrictId = getDistrictId(feature);
        currentDistrictName = getDistrictName(feature);
      }
    }
    if (!currentDistrictId || !currentDistrictName) {
      updateCurrentDistrictFromCoordinates(lastKnownLocation[0], lastKnownLocation[1]);
    }
  }

  const profile = ensurePlayerProfile(currentUser);
  const now = Date.now();
  if (!targetDistrictId && contextCoords && contextCoords.length === 2) {
    const contextLng = Number(contextCoords[0]);
    const contextLat = Number(contextCoords[1]);
    if (Number.isFinite(contextLng) && Number.isFinite(contextLat)) {
      try {
        const contextFeature = await resolveDistrictAtLngLat(contextLng, contextLat);
        if (contextFeature) {
          const derivedTargetId = getDistrictId(contextFeature);
          if (derivedTargetId) {
            targetDistrictId = safeId(derivedTargetId);
            const derivedName = getDistrictName(contextFeature);
            targetDistrictName = derivedName && derivedName.trim() ? derivedName.trim() : targetDistrictName;
          }
        }
      } catch (contextError) {
        console.warn('Failed to resolve target district from context coordinates during check-in', contextError);
      }
    }
  }

  const preciseLocationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  const fallbackLocationInfo = preciseLocationInfo ? null : getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  const locationInfo = preciseLocationInfo || fallbackLocationInfo;
  if (!locationInfo || !locationInfo.id) {
    updateStatus('Unable to determine your last known district. Enable location or complete a local check-in first.');
    return;
  }

  const locationContextId = safeId(locationInfo.id);
  const locationOrigin = locationInfo.source || null;
  const locationDisplayName = locationInfo.name || currentDistrictName || `District ${locationContextId}`;
  let districtId = locationContextId;
  let locationSource = locationOrigin;
  let districtDisplayName = locationDisplayName;
  let locationLng = typeof locationInfo.lng === 'number' && Number.isFinite(locationInfo.lng) ? locationInfo.lng : null;
  let locationLat = typeof locationInfo.lat === 'number' && Number.isFinite(locationInfo.lat) ? locationInfo.lat : null;
  const homeId = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const isHomeLocation = Boolean(homeId && locationContextId && homeId === locationContextId);
  const isTargetHome = Boolean(targetDistrictId && homeId && targetDistrictId === homeId);
  const isDefending = Boolean(homeId && (isHomeLocation || isTargetHome));
  const defendDistrictId = isTargetHome ? targetDistrictId : isHomeLocation ? locationContextId : null;
  const checkInType = isDefending ? 'defend' : 'attack';

  if (isDefending && defendDistrictId) {
    districtId = defendDistrictId;
    const fallbackHomeDescription = describeHomeDistrict(profile);
    const fallbackHomeName =
      fallbackHomeDescription && fallbackHomeDescription !== 'Unset' ? fallbackHomeDescription : null;
    districtDisplayName =
      (targetDistrictName && targetDistrictName.trim()) ||
      (profile.homeDistrictName && profile.homeDistrictName.trim()) ||
      fallbackHomeName ||
      `District ${defendDistrictId}`;
    if (
      !isHomeLocation &&
      !(contextIsLocal && (locationSource === 'map' || locationSource === 'geolocated'))
    ) {
      locationSource = 'home-remote';
      locationLng = null;
      locationLat = null;
    }
  }

  if (locationSource !== 'home-remote') {
    currentDistrictId = locationContextId;
    currentDistrictName = locationDisplayName;
  }
  updateHomePresenceIndicator();

  const normalizedLocationSource = normaliseLocationSource(locationSource, null);

  const actionKey = isDefending ? COOLDOWN_KEYS.DEFEND : COOLDOWN_KEYS.ATTACK;
  const cooldownMode =
    isDefending && (locationSource === 'home-remote' || locationSource === 'home-fallback') ? 'remote' : 'local';
  if (isActionOnCooldown(profile, actionKey, now)) {
    const label = formatCooldownLabel(actionKey, cooldownMode === 'remote' ? 'remote' : null);
    updateStatus(`${label} cooldown active. Wait until it finishes before checking in again.`);
    return;
  }
  const cooldownDuration =
    actionKey === COOLDOWN_KEYS.DEFEND
      ? cooldownMode === 'remote'
        ? COOLDOWN_DURATIONS.defendRemote
        : COOLDOWN_DURATIONS.defendLocal
      : COOLDOWN_DURATIONS.attack;

  const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
  const isPreciseLocal =
    normalizedLocationSource &&
    (normalizedLocationSource === 'map' || normalizedLocationSource === 'geolocated') &&
    locationContextId === districtId;
  const isLocalAttack = !isDefending && (isPreciseLocal || normalizedLocationSource === 'profile');

  let basePoints = POINTS_PER_CHECKIN;
  let effectiveMultiplier = chargeMultiplier;
  let rangedAttack = false;
  let meleeAttack = false;

  if (!isDefending) {
    if (isLocalAttack) {
      effectiveMultiplier = isPreciseLocal ? chargeMultiplier * 2 : chargeMultiplier;
      meleeAttack = true;
    } else {
      basePoints = 10;
      effectiveMultiplier = chargeMultiplier;
      rangedAttack = true;
    }
  }

  const pointsAwarded = basePoints * effectiveMultiplier;

  if (isDefending) {
    applyDistrictScoreDelta(districtId, pointsAwarded, districtDisplayName);
  } else {
    applyDistrictScoreDelta(districtId, -pointsAwarded, districtDisplayName);
  }

  profile.checkins.unshift({
    timestamp: Date.now(),
    districtId,
    districtName: districtDisplayName,
    type: checkInType,
    multiplier: effectiveMultiplier,
    ranged: rangedAttack,
    melee: meleeAttack,
    cooldownType: actionKey,
    cooldownMode,
  });
  profile.checkins = profile.checkins.slice(0, MAX_HISTORY_ITEMS);
  profile.points += pointsAwarded;
  if (isDefending) {
    profile.defendPoints += pointsAwarded;
  } else {
    profile.attackPoints += pointsAwarded;
  }
  profile.serverCheckinCount = profile.checkins.length;
  const locationPersistOrigin = normalizedLocationSource === 'geolocated' ? 'geolocated' : null;
  if (
    locationPersistOrigin &&
    saveProfileLocation(
      profile,
      {
        lng: locationLng,
        lat: locationLat,
        districtId: locationContextId,
        districtName: locationDisplayName,
        source: locationPersistOrigin,
      },
      {
        origin: locationPersistOrigin,
        syncBackend: true,
      }
    )
  ) {
    savePlayers();
  } else if (
    locationSource !== 'home-remote' &&
    profile.lastKnownLocation &&
    safeId(profile.lastKnownLocation.districtId) === locationContextId
  ) {
    profile.lastKnownLocation.timestamp = Date.now();
  }
  profile.nextCheckinMultiplier = 1;
  if (!profile.skipCooldown || !isDevUser(currentUser)) {
    const modeDetail = cooldownMode === 'remote' ? 'remote' : null;
    setProfileCooldown(profile, actionKey, cooldownDuration, { mode: modeDetail });
  } else {
    clearProfileCooldown(profile, actionKey);
  }

  savePlayers();
  renderPlayerState();
  scheduleProfileStatsSync(profile);
  const statusType = isDefending ? 'Defended' : 'Captured';
  const pointsLabel = isDefending ? 'defend' : 'attack';
  const multiplierText = effectiveMultiplier > 1 ? ` (x${effectiveMultiplier})` : '';
  const attackModeText = !isDefending && rangedAttack ? ' (ranged)' : '';
  if (!isDefending && (contextCoords || contextPoint)) {
    showAttackHitmarker({ lngLat: contextCoords, point: contextPoint, variant: 'attack' });
  } else if (isDefending && (contextCoords || contextPoint)) {
    showAttackHitmarker({ lngLat: contextCoords, point: contextPoint, variant: 'defend' });
  }
  updateStatus(`${statusType}${attackModeText} ${districtDisplayName}. +${pointsAwarded} ${pointsLabel} pts${multiplierText}!`);
  refreshDistrictHover();
}

function handleClearHistory() {
  if (!currentUser || !players[currentUser]) {
    return;
  }
  const profile = ensurePlayerProfile(currentUser);
  profile.checkins = [];
  profile.serverCheckinCount = 0;
  savePlayers();
  renderPlayerState();
  updateStatus('Check-in history cleared.');
  scheduleProfileStatsSync(profile);
}

function handleSetHomeDistrict() {
  if (!currentUser) {
    updateStatus('Log in to choose a home district.');
    return;
  }
  openHomeDistrictModal();
}

function handleChargeAttack() {
  if (!currentUser) {
    updateStatus('Log in to charge your next attack.');
    return;
  }

  hideActionContextMenu();

  const profile = ensurePlayerProfile(currentUser);
  const now = Date.now();
  if (isActionOnCooldown(profile, COOLDOWN_KEYS.CHARGE, now)) {
    updateStatus('Charge cooldown active. Wait for it to finish before charging again.');
    return;
  }

  const locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  const locationId = locationInfo && locationInfo.id ? safeId(locationInfo.id) : null;
  const isAtHome = profile.homeDistrictId && locationId && safeId(profile.homeDistrictId) === locationId;
  profile.nextCheckinMultiplier = CHARGE_ATTACK_MULTIPLIER;
  if (!profile.skipCooldown || !isDevUser(currentUser)) {
    setProfileCooldown(profile, COOLDOWN_KEYS.CHARGE, COOLDOWN_DURATIONS.charge);
  } else {
    clearProfileCooldown(profile, COOLDOWN_KEYS.CHARGE);
  }
  savePlayers();
  renderPlayerState();
  scheduleProfileStatsSync(profile);
  const label = isAtHome ? 'defend' : 'attack';
  updateStatus(
    `Charging ${label}! In ${Math.floor(COOLDOWN_DURATIONS.charge / 60000)} minutes your next check-in will pay x${CHARGE_ATTACK_MULTIPLIER} points.`
  );
  refreshDistrictHover();
}

async function handleRangedAttack({ districtId, districtName, contextCoords = null, contextPoint = null }) {
  if (!currentUser) {
    updateStatus('Log in to launch a ranged attack.');
    return;
  }

  await ensureDistrictDataLoaded();

  const profile = ensurePlayerProfile(currentUser);
  const now = Date.now();

  let safeDistrictId = districtId ? safeId(districtId) : null;
  let name = districtName || null;

  if (!safeDistrictId && profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
    safeDistrictId = safeId(profile.lastKnownLocation.districtId);
    name = profile.lastKnownLocation.districtName || `District ${safeDistrictId}`;
  }

  if (!safeDistrictId) {
    updateStatus('Select a valid district to attack.');
    return;
  }

  if (!name) {
    name = `District ${safeDistrictId}`;
  }

  const homeDistrictId = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const lastKnownDistrictId =
    profile.lastKnownLocation && profile.lastKnownLocation.districtId
      ? safeId(profile.lastKnownLocation.districtId)
      : null;
  const locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: false });
  const locationDistrictId = locationInfo && locationInfo.id ? safeId(locationInfo.id) : null;
  const isEnemyDistrict = (districtId) => districtId && (!homeDistrictId || districtId !== homeDistrictId);
  const targetIsEnemy = isEnemyDistrict(safeDistrictId);
  const locationMatchesTarget = Boolean(locationDistrictId && locationDistrictId === safeDistrictId);
  const lastKnownMatchesTarget = Boolean(lastKnownDistrictId && lastKnownDistrictId === safeDistrictId);

  if (targetIsEnemy && (locationMatchesTarget || lastKnownMatchesTarget)) {
    updateStatus('You are in this district. Launch a melee attack instead of a ranged attack.');
    return;
  }

  const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
  if (isActionOnCooldown(profile, COOLDOWN_KEYS.ATTACK, now)) {
    updateStatus('Attack cooldown active. Wait until it finishes before attacking again.');
    return;
  }
  const pointsAwarded = 10 * chargeMultiplier;

  profile.checkins.unshift({
    timestamp: now,
    districtId: safeDistrictId,
    districtName: name,
    type: 'attack',
    multiplier: chargeMultiplier,
    ranged: true,
    melee: false,
    cooldownType: COOLDOWN_KEYS.ATTACK,
    cooldownMode: 'ranged',
  });
  profile.checkins = profile.checkins.slice(0, MAX_HISTORY_ITEMS);

  profile.points += pointsAwarded;
  profile.attackPoints += pointsAwarded;
  profile.nextCheckinMultiplier = 1;
  profile.serverCheckinCount = profile.checkins.length;

  applyDistrictScoreDelta(safeDistrictId, -pointsAwarded, name);

  if (!profile.skipCooldown || !isDevUser(currentUser)) {
    setProfileCooldown(profile, COOLDOWN_KEYS.ATTACK, COOLDOWN_DURATIONS.attack);
  } else {
    clearProfileCooldown(profile, COOLDOWN_KEYS.ATTACK);
  }

  savePlayers();
  renderPlayerState();
  scheduleProfileStatsSync(profile);
  const multiplierText = chargeMultiplier > 1 ? ` (x${chargeMultiplier})` : '';
  if (contextCoords || contextPoint) {
    showAttackHitmarker({ lngLat: contextCoords, point: contextPoint });
  }
  updateStatus(`Ranged attack on ${name}. +${pointsAwarded} attack pts${multiplierText}!`);
  refreshDistrictHover();
}

function addSourcesAndLayers() {
  if (!map) {
    return;
  }

  map.addLayer({
    id: 'background',
    type: 'background',
    paint: {
      'background-color': '#f3f4fb',
    },
  });

  if (isFileOrigin()) {
    updateStatus('Limited demo mode: Open via http://localhost or https:// to load map data and enable login.');
    // Do not add GeoJSON sources when running from file:// to avoid noisy CORS errors.
    return;
  }

  addStaticGeoSource(map, 'prague-boundary', 'prague-boundary');

  map.addLayer({
    id: 'prague-mask-fill',
    type: 'fill',
    source: 'prague-boundary',
    paint: {
      'fill-color': '#f9f9fd',
      'fill-opacity': 0.5,
    },
  });

  addStaticGeoSource(
    map,
    'prague-buildings',
    'prague-building-polygons',
    {},
    null,
    { minZoom: 13, unloadBelowMinZoom: true },
  );

  map.addLayer({
    id: 'buildings-3d',
    type: 'fill-extrusion',
    source: 'prague-buildings',
    paint: {
      'fill-extrusion-color': '#d6cbff',
      'fill-extrusion-height': [
        'max',
        [
          'coalesce',
          ['get', 'height'],
          ['get', 'HEIGHT'],
          10,
        ],
        4,
      ],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.88,
    },
  });

  map.addLayer({
    id: 'buildings-outline',
    type: 'line',
    source: 'prague-buildings',
    paint: {
      'line-color': '#8f76e6',
      'line-width': 0.4,
      'line-opacity': 0.55,
    },
  });

  map.on('click', 'buildings-3d', (event) => {
    if (!event.features || !event.features.length) {
      return;
    }

    if (mobileContextMenuSuppressClick) {
      mobileContextMenuSuppressClick = false;
      if (mobileContextMenuSuppressClickResetId !== null) {
        window.clearTimeout(mobileContextMenuSuppressClickResetId);
        mobileContextMenuSuppressClickResetId = null;
      }
      return;
    }

    const lngLat = event.lngLat;

    hideActionContextMenu();

    if (activeBuildingGifMarker) {
      activeBuildingGifMarker.remove();
      activeBuildingGifMarker = null;
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'building-gif-marker';

    const frame = document.createElement('div');
    frame.className = 'building-gif-frame';

    const img = document.createElement('img');
    img.src = resolveDataUrl('giphy-2060961323.gif');
    img.alt = '';
    frame.appendChild(img);
    markerElement.appendChild(frame);

    const marker = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
      pitchAlignment: 'viewport',
      rotationAlignment: 'viewport',
    })
      .setLngLat(lngLat)
      .addTo(map);

    activeBuildingGifMarker = marker;

    setTimeout(() => {
      if (activeBuildingGifMarker === marker) {
        marker.remove();
        activeBuildingGifMarker = null;
      } else {
        marker.remove();
      }
    }, 1200);
  });

  addStaticGeoSource(
    map,
    'prague-districts',
    'prague-districts',
    { promoteId: 'kod_mc' },
    () => {
      if (lastKnownLocation) {
        updateCurrentDistrictFromCoordinates(lastKnownLocation[0], lastKnownLocation[1]);
      }
    },
  );

  map.addLayer({
    id: 'districts-fill',
    type: 'fill',
    source: 'prague-districts',
    layout: {
      visibility: 'visible',
    },
    paint: {
      'fill-color': '#9f9be9',
      'fill-opacity': 0.18,
    },
  });

  map.addLayer({
    id: 'districts-outline',
    type: 'line',
    source: 'prague-districts',
    layout: {
      visibility: 'visible',
    },
    paint: {
      'line-color': '#514cb3',
      'line-width': 1.4,
      'line-opacity': 0.9,
    },
  });

  map.addLayer({
    id: 'district-hover-glow',
    type: 'line',
    source: 'prague-districts',
    layout: {
      visibility: 'visible',
      'line-cap': 'round',
      'line-join': 'round',
    },
    filter: DISTRICT_FILTER_NONE,
    paint: {
      'line-color': DISTRICT_GLOW_DEFAULT_COLOR,
      'line-width': DISTRICT_GLOW_GLOW_WIDTH,
      'line-opacity': 0,
      'line-blur': DISTRICT_GLOW_GLOW_BLUR,
    },
  });

  map.addLayer({
    id: 'district-hover-line',
    type: 'line',
    source: 'prague-districts',
    layout: {
      visibility: 'visible',
      'line-cap': 'round',
      'line-join': 'round',
    },
    filter: DISTRICT_FILTER_NONE,
    paint: {
      'line-color': DISTRICT_GLOW_DEFAULT_COLOR,
      'line-width': DISTRICT_GLOW_LINE_WIDTH,
      'line-opacity': 0,
    },
  });

  map.addSource(FRIEND_LOCATIONS_SOURCE_ID, {
    type: 'geojson',
    data: friendLocationsGeoJson,
  });

  map.addLayer({
    id: FRIEND_LOCATIONS_GLOW_LAYER_ID,
    type: 'circle',
    source: FRIEND_LOCATIONS_SOURCE_ID,
    paint: {
      'circle-radius': 10,
      'circle-color': ['get', 'markerColor'],
      'circle-opacity': 0.28,
      'circle-blur': 0.6,
    },
  });

  map.addLayer({
    id: FRIEND_LOCATIONS_LAYER_ID,
    type: 'circle',
    source: FRIEND_LOCATIONS_SOURCE_ID,
    paint: {
      'circle-radius': 6,
      'circle-color': ['get', 'markerColor'],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.95,
    },
  });

  map.on('mouseenter', FRIEND_LOCATIONS_LAYER_ID, () => {
    if (map && typeof map.getCanvas === 'function') {
      const canvas = map.getCanvas();
      if (canvas && canvas.style) {
        canvas.style.cursor = 'pointer';
      }
    }
  });

  map.on('mouseleave', FRIEND_LOCATIONS_LAYER_ID, () => {
    if (map && typeof map.getCanvas === 'function') {
      const canvas = map.getCanvas();
      if (canvas && canvas.style) {
        canvas.style.cursor = '';
      }
    }
  });

  map.on('click', FRIEND_LOCATIONS_LAYER_ID, (event) => {
    if (!event.features || !event.features.length) {
      return;
    }
    const feature = event.features[0];
    const props = feature && feature.properties ? feature.properties : {};
    const usernameRaw = props && typeof props.username === 'string' ? props.username : '';
    const username = usernameRaw ? `@${usernameRaw}` : 'Friend';
    const districtName =
      props && typeof props.districtName === 'string' && props.districtName.trim()
        ? props.districtName.trim()
        : null;
    const districtId =
      props && typeof props.districtId === 'string' && props.districtId.trim() ? props.districtId.trim() : null;
    const timestampRaw = props && props.timestamp !== undefined ? Number(props.timestamp) : null;
    const timestamp = Number.isFinite(timestampRaw) ? timestampRaw : null;
    const timeLabel = timestamp ? formatTimeAgo(timestamp) : 'recently';
    const locationLabel = districtName || (districtId ? `District ${districtId}` : 'their last known location');
    updateStatus(`${username} last checked in ${timeLabel} at ${locationLabel}.`);
  });

  addStaticGeoSource(map, 'prague-parks', 'prague-parks', {}, null, { minZoom: 12, unloadBelowMinZoom: true });

  map.addLayer({
    id: 'parks-fill',
    type: 'fill',
    source: 'prague-parks',
    layout: {
      visibility: parksToggle && parksToggle.checked ? 'visible' : 'none',
    },
    paint: {
      'fill-color': '#39ff14',
      'fill-opacity': 0.4,
      'fill-outline-color': '#00cc66',
    },
  });

  map.on('click', 'parks-fill', (event) => {
    if (!event.features || !event.features.length) {
      return;
    }

    const lngLat = event.lngLat;

    hideActionContextMenu();

    if (activeParkGifMarker) {
      activeParkGifMarker.remove();
      activeParkGifMarker = null;
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'building-gif-marker park-gif-marker';

    const frame = document.createElement('div');
    frame.className = 'building-gif-frame park-gif-frame';

    const img = document.createElement('img');
    img.src = TREE_GIF_URL;
    img.alt = '';
    frame.appendChild(img);
    markerElement.appendChild(frame);

    const marker = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
      pitchAlignment: 'viewport',
      rotationAlignment: 'viewport',
    })
      .setLngLat(lngLat)
      .addTo(map);

    activeParkGifMarker = marker;

    setTimeout(() => {
      if (activeParkGifMarker === marker) {
        marker.remove();
        activeParkGifMarker = null;
      } else {
        marker.remove();
      }
    }, 1200);
  });

  addStaticGeoSource(map, 'prague-urban', 'urban-planning', {}, null, { minZoom: 12, unloadBelowMinZoom: true });

  map.addLayer({
    id: 'urban-overlay',
    type: 'line',
    source: 'prague-urban',
    layout: {
      visibility: urbanToggle && urbanToggle.checked ? 'visible' : 'none',
    },
    paint: {
      'line-color': '#00fff2',
      'line-width': 2.2,
      'line-opacity': 0.85,
      'line-blur': 0.6,
    },
  });

  map.on('mousemove', 'districts-fill', (event) => {
    if (!event.features || !event.features.length) {
      hideDistrictHover();
      hideDistrictTooltip();
      clearStoredHoverState();
      if (map && typeof map.getCanvas === 'function') {
        const canvas = map.getCanvas();
        if (canvas && canvas.style) {
          canvas.style.cursor = '';
        }
      }
      return;
    }

    const feature = event.features[0];
    const hoveredId = getDistrictId(feature);
    if (!hoveredId) {
      hideDistrictHover();
      hideDistrictTooltip();
      clearStoredHoverState();
      if (map && typeof map.getCanvas === 'function') {
        const canvas = map.getCanvas();
        if (canvas && canvas.style) {
          canvas.style.cursor = '';
        }
      }
      return;
    }

    storeHoverState(feature, event.lngLat);

    if (hoveredDistrictId === hoveredId) {
      if (districtPopup) {
        districtPopup.setLngLat(event.lngLat);
      }
      if (map && typeof map.getCanvas === 'function') {
        const canvas = map.getCanvas();
        if (canvas && canvas.style) {
          canvas.style.cursor = 'pointer';
        }
      }
      return;
    }

    highlightDistrict(feature);
    showDistrictTooltip(feature, event.lngLat);

    if (map && typeof map.getCanvas === 'function') {
      const canvas = map.getCanvas();
      if (canvas && canvas.style) {
        canvas.style.cursor = 'pointer';
      }
    }
  });

  map.on('mouseleave', 'districts-fill', () => {
    hideDistrictHover();
    hideDistrictTooltip();
    clearStoredHoverState();
    if (map && typeof map.getCanvas === 'function') {
      const canvas = map.getCanvas();
      if (canvas && canvas.style) {
        canvas.style.cursor = '';
      }
    }
  });

  map.on('click', 'districts-fill', (event) => {
    if (mobileContextMenuSuppressClick) {
      return;
    }
    if (!event || !event.lngLat) {
      return;
    }
    const feature = event.features && event.features.length ? event.features[0] : null;
    const point = event.point ? { x: event.point.x, y: event.point.y } : null;
    attemptLocalMeleeAttackAt(event.lngLat.lng, event.lngLat.lat, { feature, point }).catch((error) => {
      console.warn('Failed to trigger melee attack from map click', error);
    });
  });

  map.on('contextmenu', 'buildings-3d', (event) => {
    event.preventDefault();
    hideActionContextMenu();
    if (!event.lngLat) {
      return;
    }
    const point = map.project(event.lngLat);
    showActionContextMenu(event.lngLat.lng, event.lngLat.lat, point);
  });

  // Fallback: on some setups, layer-specific contextmenu may not fire reliably.
  // In that case, intercept the map-level contextmenu and open our menu if a building is under the cursor.
  map.on('contextmenu', (event) => {
    try {
      if (!event || !event.point || !event.lngLat) return;
      const features = typeof map.queryRenderedFeatures === 'function'
        ? map.queryRenderedFeatures(event.point, { layers: ['buildings-3d'] })
        : null;
      if (features && features.length) {
        event.preventDefault();
        hideActionContextMenu();
        const pt = map.project(event.lngLat);
        showActionContextMenu(event.lngLat.lng, event.lngLat.lat, pt);
      }
    } catch (err) {
      // Non-fatal; ignore
    }
  });

  map.on('click', () => {
    hideActionContextMenu();
  });
  map.on('movestart', hideActionContextMenu);
  map.on('dragstart', hideActionContextMenu);
  map.on('zoomstart', hideActionContextMenu);
  map.on('pitchstart', hideActionContextMenu);
  map.on('rotatestart', hideActionContextMenu);

  enableMobileContextMenuLongPress();


  addStaticGeoSource(map, 'prague-streets', 'prague-streets', {}, null, { minZoom: 11, unloadBelowMinZoom: true });

  map.addLayer({
    id: 'streets-overlay',
    type: 'line',
    source: 'prague-streets',
    paint: {
      'line-color': '#8087cc',
      'line-width': 0.6,
      'line-opacity': 0.35,
    },
  });

  addStaticGeoSource(map, 'prague-cycling', 'prague-cycling-routes', {}, null, { minZoom: 12, unloadBelowMinZoom: true });

  map.addLayer({
    id: 'cycling-routes',
    type: 'line',
    source: 'prague-cycling',
    layout: {
      visibility: cyclingToggle && cyclingToggle.checked ? 'visible' : 'none',
    },
    paint: {
      'line-color': '#ff63b8',
      'line-width': 2.4,
      'line-opacity': 0.8,
      'line-blur': 0.4,
    },
  });

  if (map && typeof map.moveLayer === 'function') {
    try {
      map.moveLayer(FRIEND_LOCATIONS_LAYER_ID);
      map.moveLayer(FRIEND_LOCATIONS_GLOW_LAYER_ID, FRIEND_LOCATIONS_LAYER_ID);
    } catch (error) {
      // Layer may not be present yet; safe to ignore.
    }
  }
}

function initialiseMap() {
  if (map) {
    return;
  }

  map = new maplibregl.Map({
    container: 'map',
    style: MAP_STYLE,
    center: MAP_CENTER,
    zoom: 12.6,
    pitch: 45,
    bearing: -15,
    attributionControl: false,
    antialias: true,
  });

  map.addControl(new maplibregl.NavigationControl({ showZoom: false, showCompass: false }), 'top-right');

  geolocateControl = new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
    fitBoundsOptions: { maxZoom: 14.5 },
  });
  map.addControl(geolocateControl, 'top-right');
  geolocateControl.on('error', (error) => {
    if (!isSecureOrigin()) {
      updateStatus(GEOLOCATION_SECURE_CONTEXT_MESSAGE);
      setGeolocationUiState(false);
      return;
    }
    let message = 'Unable to retrieve your location.';
    if (error && typeof error.message === 'string' && error.message.trim()) {
      message = `Geolocation error: ${error.message}`;
    } else if (error && typeof error.code === 'number') {
      switch (error.code) {
        case 1:
          message = 'Location request denied. Enable location permissions and try again.';
          break;
        case 2:
          message = 'Location unavailable. Try moving near a window or check your GPS.';
          break;
        case 3:
          message = 'Location request timed out. Try again in a moment.';
          break;
        default:
          break;
      }
    }
    updateStatus(message);
  });

  map.on('load', () => {
    addSourcesAndLayers();
    mapReady = true;
    const secureOrigin = isSecureOrigin();
    setGeolocationUiState(secureOrigin);
    if (secureOrigin) {
      updateStatus('Map ready. Use “Find Me” to jump to your location.');
    } else {
      updateStatus('Map ready. Geolocation needs https:// or http://localhost to work.');
    }

    if (basemapSlider) {
      basemapSlider.value = '0';
      basemapSlider.disabled = true;
      basemapSlider.classList.add('locked-slider');
    }

    if (districtsToggle && !districtsToggle.checked) {
      if (map.getLayer('districts-fill')) {
        map.setLayoutProperty('districts-fill', 'visibility', 'none');
      }
      if (map.getLayer('districts-outline')) {
        map.setLayoutProperty('districts-outline', 'visibility', 'none');
      }
      if (map.getLayer('district-hover-glow')) {
        map.setLayoutProperty('district-hover-glow', 'visibility', 'none');
        map.setFilter('district-hover-glow', DISTRICT_FILTER_NONE);
        map.setPaintProperty('district-hover-glow', 'line-opacity', 0);
        map.setPaintProperty('district-hover-glow', 'line-color', DISTRICT_GLOW_DEFAULT_COLOR);
      }
      if (map.getLayer('district-hover-line')) {
        map.setLayoutProperty('district-hover-line', 'visibility', 'none');
        map.setFilter('district-hover-line', DISTRICT_FILTER_NONE);
        map.setPaintProperty('district-hover-line', 'line-opacity', 0);
        map.setPaintProperty('district-hover-line', 'line-color', DISTRICT_GLOW_DEFAULT_COLOR);
      }
      clearStoredHoverState();
    }

    applyThemeToMap(activeTheme);

    while (pendingActions.length) {
      const action = pendingActions.shift();
      action();
    }
  });

  map.on('geolocate', (position) => {
    const { coords } = position;
    const accuracy = typeof coords.accuracy === 'number' ? Math.round(coords.accuracy) : '?';
    updateStatus(`Located: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} (±${accuracy} m)`);
    lastKnownLocation = [coords.longitude, coords.latitude];
    setGeolocationUiState(true);
    ensureMap(() => {
      updateCurrentDistrictFromCoordinates(coords.longitude, coords.latitude, {
        persist: true,
        origin: 'geolocated',
        syncBackend: true,
      });
    });
    startLiveLocationWatch();
    if (map && typeof map.getSource === 'function' && map.getSource('prague-districts')) {
      const currentZoom = map.getZoom();
      if (currentZoom < 12.5) {
        map.easeTo({ zoom: 12.5, duration: 1000 });
      }
    }
  });

  map.on('error', (event) => {
    if (event && event.error) {
      const errorMessage =
        event.error && typeof event.error === 'object' && 'message' in event.error
          ? event.error.message
          : String(event.error);
      console.error('MapLibre error event:', event.error);
      updateStatus(`Map error: ${errorMessage}`);
    }
  });
}

function showMap(triggerGeolocation) {
  initialiseMap();

  if (welcomeScreen && gameScreen) {
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('welcome-active');
    document.body.classList.add('game-active');
  }

  renderPlayerState();

  ensureMap(() => {
    const profile = currentUser && players[currentUser] ? ensurePlayerProfile(currentUser) : null;
    const hasLiveLocation = profile && profile.lastKnownLocation && profile.lastKnownLocation.source === 'geolocated';
    if (!hasLiveLocation && profile && profile.lastKnownLocation) {
      const lng = Number(profile.lastKnownLocation.lng);
      const lat = Number(profile.lastKnownLocation.lat);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        updatePlayerLocationMarker(lng, lat, { source: 'profile' });
      }
    }
  });

  if (poiList && !poiList.children.length) {
    const li = document.createElement('li');
    li.textContent = '3D view active. Toggle districts to refine the scene.';
    poiList.appendChild(li);
  }

  requestAnimationFrame(() => {
    if (map) {
      map.resize();
    }
  });

  if (triggerGeolocation) {
    hasTriggeredGeolocate = true;
    ensureMap(() => {
      if (geolocateControl) {
        geolocateControl.trigger();
      }
    });
  }
}

if (findMeButton) {
  findMeButton.addEventListener('click', () => {
    ensureMap(() => {
      if (geolocateControl) {
        geolocateControl.trigger();
      }
    });
  });
}

if (mobileFindMeButton) {
  mobileFindMeButton.addEventListener('click', () => {
    ensureMap(() => {
      if (geolocateControl) {
        geolocateControl.trigger();
      }
    });
  });
}

if (mobileCheckInButton) {
  mobileCheckInButton.addEventListener('click', () => {
    handleCheckIn();
  });
}

if (currentUserTag) {
  currentUserTag.addEventListener('click', () => {
    if (currentUser) {
      openCharacterDrawer(currentUserTag);
    }
  });
  currentUserTag.addEventListener('keydown', (event) => {
    if (!currentUser) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCharacterDrawer(currentUserTag);
    }
  });
}

if (friendsButton) {
  friendsButton.setAttribute('aria-expanded', 'false');
  friendsButton.addEventListener('click', () => {
    openFriendsDrawer(friendsButton);
  });
}

if (friendsManageButton) {
  friendsManageButton.addEventListener('click', () => {
    if (!isSessionAuthenticated || !currentUser) {
      updateStatus('Sign in to manage friends.');
      return;
    }
    if (friendsManageOpen) {
      closeFriendsManagePanel();
    } else {
      openFriendsManagePanel();
    }
  });
}

if (friendManageCloseButton) {
  friendManageCloseButton.addEventListener('click', () => {
    closeFriendsManagePanel();
    if (friendsManageButton) {
      friendsManageButton.focus();
    }
  });
}

if (friendSearchForm) {
  friendSearchForm.addEventListener('submit', (event) => {
    handleFriendSearchSubmit(event);
  });
}

if (friendSearchResults) {
  friendSearchResults.addEventListener('click', (event) => {
    handleFriendSearchAction(event);
  });
}

if (friendManageList) {
  friendManageList.addEventListener('click', (event) => {
    handleFriendManageAction(event);
  });
}

if (friendsListContainer) {
  friendsListContainer.addEventListener('click', (event) => {
    const locateButton = event.target.closest('[data-friend-locate]');
    if (!locateButton) {
      return;
    }
    event.preventDefault();
    const username = locateButton.dataset.friendLocate || '';
    const lng = Number.parseFloat(locateButton.dataset.lng);
    const lat = Number.parseFloat(locateButton.dataset.lat);
    const color = locateButton.dataset.color || DEFAULT_MARKER_COLOR;
    focusFriendLocation({ username, lng, lat, color });
  });
}

if (friendRequestsPanel) {
  friendRequestsPanel.addEventListener('click', (event) => {
    handleFriendRequestAction(event);
  });
}

if (friendSearchAddDirectButton) {
  friendSearchAddDirectButton.addEventListener('click', () => {
    const username = friendSearchAddDirectButton.dataset.username;
    if (!username) {
      return;
    }
    friendSearchAddDirectButton.disabled = true;
    addFriendByUsername(username)
      .catch((error) => {
        console.warn('Failed to add friend via quick action', error);
        updateStatus('Unable to send friend request. Try again.');
      })
      .finally(() => {
        friendSearchAddDirectButton.disabled = false;
      });
  });
}

if (districtButton) {
  districtButton.setAttribute('aria-expanded', 'false');
  districtButton.addEventListener('click', () => {
    openDistrictDrawer(districtButton);
  });
}


if (drawerCheckinButton) {
  drawerCheckinButton.addEventListener('click', () => {
    handleCheckIn();
    setMobileDrawerState(false);
  });
}

if (drawerLogoutButton) {
  drawerLogoutButton.addEventListener('click', () => {
    setMobileDrawerState(false);
    performLogout();
  });
}

if (drawerHomeSelect && drawerHomeSaveButton) {
  drawerHomeSelect.addEventListener('change', () => {
    drawerHomeSaveButton.disabled = !drawerHomeSelect.value;
  });

  drawerHomeSaveButton.addEventListener('click', async () => {
    if (!currentUser) {
      updateStatus('Sign in to choose a home district.');
      return;
    }
    const selectedId = drawerHomeSelect.value;
    if (!selectedId) {
      updateStatus('Select a district before saving.');
      return;
    }
    try {
      await getHomeDistrictOptions();
    } catch (error) {
      console.warn('Failed to load districts for drawer save', error);
    }
    if (!homeDistrictOptionMap.has(selectedId)) {
      updateStatus('Selected district is unavailable. Try again.');
      return;
    }
    const option = homeDistrictOptionMap.get(selectedId);
    const profile = ensurePlayerProfile(currentUser);
    const previousId = profile.homeDistrictId;
    profile.homeDistrictId = option.id;
    profile.homeDistrictName = option.name;
    savePlayers();
    renderPlayerState();
    scheduleProfileStatsSync(profile);
    updateStatus(previousId === option.id ? `${option.name} remains your home district.` : `${option.name} is now your home district.`);
  });
}

if (drawerThemeToggleButton) {
  drawerThemeToggleButton.addEventListener('click', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.click();
    }
  });
}

if (drawerLeaderboardLink) {
  drawerLeaderboardLink.addEventListener('click', () => {
    setMobileDrawerState(false);
  });
}

if (districtsToggle) {

  districtsToggle.addEventListener('change', (event) => {
    const visible = event.target.checked;
    ensureMap(() => {
      const visibility = visible ? 'visible' : 'none';
      if (map.getLayer('districts-fill')) {
        map.setLayoutProperty('districts-fill', 'visibility', visibility);
      }
      if (map.getLayer('districts-outline')) {
        map.setLayoutProperty('districts-outline', 'visibility', visibility);
      }
      if (map.getLayer('district-hover-glow')) {
        map.setLayoutProperty('district-hover-glow', 'visibility', visibility);
        if (!visible) {
          map.setFilter('district-hover-glow', DISTRICT_FILTER_NONE);
          map.setPaintProperty('district-hover-glow', 'line-opacity', 0);
        }
      }
      if (map.getLayer('district-hover-line')) {
        map.setLayoutProperty('district-hover-line', 'visibility', visibility);
        if (!visible) {
          map.setFilter('district-hover-line', DISTRICT_FILTER_NONE);
          map.setPaintProperty('district-hover-line', 'line-opacity', 0);
        }
      }
      if (!visible) {
        hideDistrictHover();
        hideDistrictTooltip();
        clearStoredHoverState();
        if (map && typeof map.getCanvas === 'function') {
          const canvas = map.getCanvas();
          if (canvas && canvas.style) {
            canvas.style.cursor = '';
          }
        }
      }
    });
  });
}

if (parksToggle) {
  parksToggle.addEventListener('change', (event) => {
    const visible = event.target.checked;
    ensureMap(() => {
      if (map.getLayer('parks-fill')) {
        map.setLayoutProperty('parks-fill', 'visibility', visible ? 'visible' : 'none');
      }
    });
  });
}

if (urbanToggle) {
  urbanToggle.addEventListener('change', (event) => {
    const visible = event.target.checked;
    ensureMap(() => {
      if (map.getLayer('urban-overlay')) {
        map.setLayoutProperty('urban-overlay', 'visibility', visible ? 'visible' : 'none');
      }
    });
  });
}

if (cyclingToggle) {
  cyclingToggle.addEventListener('change', (event) => {
    const visible = event.target.checked;
    ensureMap(() => {
      if (map.getLayer('cycling-routes')) {
        map.setLayoutProperty('cycling-routes', 'visibility', visible ? 'visible' : 'none');
      }
    });
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (usernameInput) {
  usernameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  });
}

if (devSkipCooldownCheckbox) {
  devSkipCooldownCheckbox.addEventListener('change', () => {
    if (!currentUser || !isDevUser(currentUser) || !players[currentUser]) {
      devSkipCooldownCheckbox.checked = false;
      return;
    }
    const profile = ensurePlayerProfile(currentUser);
    profile.skipCooldown = devSkipCooldownCheckbox.checked;
    if (!profile.skipCooldown) {
      ensureProfileCooldownState(profile);
    } else {
      Object.values(COOLDOWN_KEYS).forEach((key) => {
        clearProfileCooldown(profile, key);
      });
    }
    savePlayers();
    renderPlayerState();
    scheduleProfileStatsSync(profile);
  });
}

if (devChangeUserButton) {
  devChangeUserButton.addEventListener('click', () => {
    if (!currentUser || !isDevUser(currentUser)) {
      updateStatus('Dev tools available only while signed in as dev.');
      return;
    }
    const otherUsers = Object.keys(players)
      .filter((name) => name !== currentUser && isValidUsername(name))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    if (!otherUsers.length) {
      updateStatus('No other profiles available to switch.');
      return;
    }
    const target = otherUsers[0];
    const profile = ensurePlayerProfile(target);
    completeAuthenticatedLogin(target, profile, {
      message: `Switched to ${target} via dev controls.`,
      triggerGeolocation: false,
    });
  });
}

const recentTagElements = [recentCheckinTagPrimary].filter(Boolean);
recentTagElements.forEach((tag) => {
  tag.setAttribute('role', 'button');
  tag.tabIndex = 0;
  tag.addEventListener('click', () => {
    if (!tag.classList.contains('empty')) {
      openRecentCheckinsDrawer(tag);
    }
  });
  tag.addEventListener('keydown', (event) => {
    if (tag.classList.contains('empty')) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openRecentCheckinsDrawer(tag);
    }
  });
});

if (recentCheckinsOverlay) {
  recentCheckinsOverlay.addEventListener('click', () => {
    closeRecentCheckinsDrawer();
  });
}

if (recentCheckinsCloseButton) {
  recentCheckinsCloseButton.addEventListener('click', () => {
    closeRecentCheckinsDrawer();
  });
}

if (recentCheckinsToggleButton) {
  recentCheckinsToggleButton.addEventListener('click', () => {
    toggleRecentCheckinsDrawerMore();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }
  if (document.body.classList.contains('recent-checkins-open')) {
    closeRecentCheckinsDrawer();
  }
  if (document.body.classList.contains('friends-open')) {
    closeFriendsDrawer();
  }
  if (document.body.classList.contains('district-open')) {
    closeDistrictDrawer();
  }
  if (document.body.classList.contains('character-open')) {
    closeCharacterDrawer();
  }
});

if (friendsOverlay) {
  friendsOverlay.addEventListener('click', () => {
    closeFriendsDrawer();
  });
}

if (friendsCloseButton) {
  friendsCloseButton.addEventListener('click', () => {
    closeFriendsDrawer();
  });
}

if (districtOverlay) {
  districtOverlay.addEventListener('click', () => {
    closeDistrictDrawer();
  });
}

if (districtCloseButton) {
  districtCloseButton.addEventListener('click', () => {
    closeDistrictDrawer();
  });
}

if (characterOverlay) {
  characterOverlay.addEventListener('click', () => {
    closeCharacterDrawer();
  });
}

if (characterCloseButton) {
  characterCloseButton.addEventListener('click', () => {
    closeCharacterDrawer();
  });
}

if (friendsInviteButton) {
  friendsInviteButton.addEventListener('click', () => {
    if (!currentUser) {
      updateStatus('Sign in to invite friends.');
      return;
    }
    updateStatus('Friend invites are coming soon.');
  });
}


if (devChangeUserButton) {
  devChangeUserButton.addEventListener('click', () => {
    if (!currentUser || !isDevUser(currentUser)) {
      updateStatus('Dev tools available only while signed in as dev.');
      return;
    }
    const otherUsers = Object.keys(players)
      .filter((name) => name !== currentUser && isValidUsername(name))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    if (!otherUsers.length) {
      updateStatus('No other profiles available to switch.');
      return;
    }
    const target = otherUsers[0];
    const profile = ensurePlayerProfile(target);
    completeAuthenticatedLogin(target, profile, {
      message: `Switched to ${target} via dev controls.`,
      triggerGeolocation: false,
    });
  });
}


if (devClearUsersButton) {
  devClearUsersButton.addEventListener('click', async () => {
    if (!currentUser || !isDevUser(currentUser)) {
      updateStatus('Dev tools available only while signed in as dev.');
      return;
    }
    const confirmed = window.confirm('Remove all stored players? This clears the "Jump back in" list.');
    if (!confirmed) {
      return;
    }
    players = {};
    try {
      await ensureDevAccount();
    } catch (error) {
      console.warn('Failed to reset dev account during clear', error);
    }
    currentUser = DEV_USERNAME;
    const devProfile = ensurePlayerProfile(DEV_USERNAME);
    lastKnownLocation = devProfile.lastKnownLocation && typeof devProfile.lastKnownLocation.lng === 'number' && typeof devProfile.lastKnownLocation.lat === 'number'
      ? [devProfile.lastKnownLocation.lng, devProfile.lastKnownLocation.lat]
      : null;
    currentDistrictId = null;
    currentDistrictName = null;
    setLastSignedInUser(DEV_USERNAME);
    renderKnownPlayers();
    renderPlayerState();
    updateStatus('All local players cleared. Signed in as dev.');
  });
}

if (drawerToggleButton) {
  drawerToggleButton.addEventListener('click', () => {
    if (!isMobileViewport()) {
      return;
    }
    toggleMobileDrawer();
  });
}

if (drawerCloseButton) {
  drawerCloseButton.addEventListener('click', () => {
    setMobileDrawerState(false);
  });
}

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', () => {
    setMobileDrawerState(false);
  });
}

if (setHomeDistrictButton) {
  setHomeDistrictButton.addEventListener('click', handleSetHomeDistrict);
}

if (chargeAttackButton) {
  chargeAttackButton.addEventListener('click', handleChargeAttack);
}

if (checkInButton) {
  checkInButton.addEventListener('click', handleCheckIn);
}

if (clearHistoryButton) {
  clearHistoryButton.addEventListener('click', handleClearHistory);
}

if (homeDistrictConfirmButton) {
  homeDistrictConfirmButton.addEventListener('click', confirmHomeDistrictSelection);
}

if (homeDistrictCancelButton) {
  homeDistrictCancelButton.addEventListener('click', () => {
    closeHomeDistrictModal();
  });
}

if (homeDistrictModalCloseButton) {
  homeDistrictModalCloseButton.addEventListener('click', () => {
    closeHomeDistrictModal();
  });
}

if (homeDistrictModalOverlay) {
  homeDistrictModalOverlay.addEventListener('click', () => {
    closeHomeDistrictModal();
  });
}

if (homeDistrictSearchInput) {
  homeDistrictSearchInput.addEventListener('input', handleHomeDistrictSearchInput);
  homeDistrictSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (homeDistrictConfirmButton && !homeDistrictConfirmButton.disabled) {
        confirmHomeDistrictSelection();
      }
    }
  });
}

if (homeDistrictListElement) {
  homeDistrictListElement.addEventListener('click', (event) => {
    const target = event.target;
    const button =
      target instanceof HTMLElement
        ? target.closest('.home-district-option-button')
        : null;
    if (button) {
      const districtId = button.dataset.districtId;
      if (districtId) {
        selectHomeDistrictOption(districtId);
        if (event.detail === 2 && homeDistrictConfirmButton && !homeDistrictConfirmButton.disabled) {
          confirmHomeDistrictSelection();
        }
      }
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }
  let handled = false;
  if (isHomeDistrictModalOpen()) {
    closeHomeDistrictModal();
    handled = true;
  }
  if (actionContextMenuVisible) {
    hideActionContextMenu();
    handled = true;
  }
  if (document.body.classList.contains('drawer-open')) {
    setMobileDrawerState(false);
    handled = true;
  }
  if (handled) {
    event.preventDefault();
  }
});

applyViewportUiState();
setMobileDrawerState(false);

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mobileLayoutWatcher = window.matchMedia('(max-width: 820px)');
  mobileLayoutWatcher.addEventListener('change', () => {
    applyViewportUiState();
  });
}

// Prepare the map as soon as the script loads so assets start downloading early.
setGeolocationUiState(isSecureOrigin());
ensureDistrictDataLoaded();
initialiseMap();

loadDistrictScores();
initialisePlayers();

// If the map finishes loading before the user clicks “Start”, keep status informative.
ensureMap(() => {
  if (!hasTriggeredGeolocate) {
    if (isSecureOrigin()) {
      updateStatus('Map ready. Sign in and press “Find Me” to enter the experience.');
    } else {
      updateStatus('Map ready. Geolocation needs https:// or http://localhost to work.');
    }
  }
});
