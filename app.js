'use strict';
const backButton = document.getElementById('back-button');
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
const checkInCooldownElement = document.getElementById('check-in-cooldown');
const checkInCooldownFill = document.getElementById('check-in-cooldown-fill');
const checkInCooldownLabel = document.getElementById('check-in-cooldown-label');
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
const floatingCheckInButton = document.getElementById('floating-checkin-button');
const mobileFindMeButton = document.getElementById('mobile-find-me-button');
const mobileCheckInButton = document.getElementById('mobile-checkin-button');
const drawerCheckinButton = document.getElementById('drawer-checkin-button');
const drawerLogoutButton = document.getElementById('drawer-logout-button');
const drawerThemeToggleButton = document.getElementById('drawer-theme-toggle');
const drawerLeaderboardLink = document.getElementById('drawer-leaderboard');
const cooldownBadge = document.getElementById('cooldown-badge');
const recentCheckinTagPrimary = document.getElementById('recent-checkin-1');
const currentUserTag = document.getElementById('current-user-tag');
if (currentUserTag) {
  updateCurrentUserTag(null);
}

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
const API_BASE_URL = '/api';
const CSRF_HEADER_NAME = 'X-CSRFToken';

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

const GEOLOCATION_SECURE_CONTEXT_MESSAGE =
  'Geolocation is blocked on insecure connections. Open the app via https:// or http://localhost to enable location.';

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

function stopCheckInCooldownTimer() {
  if (checkInCooldownTimerId !== null) {
    window.clearInterval(checkInCooldownTimerId);
    checkInCooldownTimerId = null;
  }
}

function hideCheckInCooldownUI() {
  if (checkInCooldownElement) {
    checkInCooldownElement.classList.add('hidden');
  }
  if (checkInCooldownFill) {
    checkInCooldownFill.style.transform = 'scaleX(1)';
  }
  if (checkInCooldownLabel) {
    checkInCooldownLabel.textContent = '';
  }
}

function formatCooldownTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopCheckInCooldown(enableButton = true) {
  stopCheckInCooldownTimer();
  checkInCooldownDeadline = null;
  hideCheckInCooldownUI();
  updateCooldownBadge(0, false);
  if (enableButton && checkInButton) {
    checkInButton.disabled = false;
    checkInButton.title = '';
  }
  if (mobileCheckInButton) {
    if (enableButton) {
      mobileCheckInButton.removeAttribute('disabled');
    } else {
      mobileCheckInButton.setAttribute('disabled', 'disabled');
    }
  }
  if (enableButton && chargeAttackButton) {
    if (currentUser && players[currentUser]) {
      const profile = ensurePlayerProfile(currentUser);
      const fallbackInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
      const locationId = fallbackInfo && fallbackInfo.id ? safeId(fallbackInfo.id) : null;
      const isAtHome = profile.homeDistrictId && locationId && safeId(profile.homeDistrictId) === locationId;
      const baseText = isAtHome ? 'Charge Defend' : 'Charge Attack';
      const chargedText = isAtHome ? 'Recharge Defend' : 'Recharge Attack';
      chargeAttackButton.disabled = false;
      chargeAttackButton.textContent = profile.nextCheckinMultiplier > 1 ? chargedText : baseText;
      chargeAttackButton.title = profile.nextCheckinMultiplier > 1
        ? `Charged: next check-in worth x${profile.nextCheckinMultiplier} points. Recharge to reset the timer.`
        : isAtHome
        ? 'Charge to defend your district with a boosted check-in.'
        : 'Charge to start a countdown and multiply your next attack.';
    } else {
      chargeAttackButton.disabled = true;
      chargeAttackButton.textContent = 'Charge Attack';
      chargeAttackButton.title = 'Log in to charge your next attack.';
    }
  }
}

function updateCheckInCooldownUI() {
  if (!checkInCooldownDeadline) {
    stopCheckInCooldown();
    return;
  }

  const remaining = checkInCooldownDeadline - Date.now();
  if (remaining <= 0) {
    updateCooldownBadge(0, false);
    stopCheckInCooldown(true);
    if (currentUser && players[currentUser] && players[currentUser].cooldownUntil) {
      delete players[currentUser].cooldownUntil;
      savePlayers();
    }
    if (currentUser && players[currentUser]) {
      const profile = ensurePlayerProfile(currentUser);
      if (profile.nextCheckinMultiplier > 1) {
        updateStatus(`Charge complete! Next check-in pays x${profile.nextCheckinMultiplier} points.`);
      }
    }
    renderPlayerState();
    return;
  }

  if (checkInButton) {
    checkInButton.disabled = true;
    checkInButton.title = 'Check-in available once the cooldown completes.';
  }
  if (mobileCheckInButton) {
    mobileCheckInButton.setAttribute('disabled', 'disabled');
  }
  if (chargeAttackButton) {
    chargeAttackButton.disabled = true;
    chargeAttackButton.title = 'Cooldown active. Wait until it completes to charge again.';
  }
  if (checkInCooldownElement) {
    checkInCooldownElement.classList.remove('hidden');
  }
  if (checkInCooldownFill) {
    const ratio = Math.max(0, Math.min(1, remaining / CHECK_IN_COOLDOWN_MS));
    checkInCooldownFill.style.transform = `scaleX(${ratio})`;
  }
  if (checkInCooldownLabel) {
    checkInCooldownLabel.textContent = `Ready in ${formatCooldownTime(remaining)}`;
  }
  updateCooldownBadge(Math.max(0, Math.ceil(remaining / 1000)), true);
}

function startCheckInCooldown(deadline) {
  const profile = currentUser ? players[currentUser] && ensurePlayerProfile(currentUser) : null;
  if (profile && profile.skipCooldown && isDevUser(currentUser)) {
    profile.cooldownUntil = null;
    stopCheckInCooldown(true);
    savePlayers();
    return;
  }

  if (!deadline || Number.isNaN(deadline)) {
    stopCheckInCooldown();
    return;
  }

  if (checkInCooldownDeadline === deadline && checkInCooldownTimerId !== null) {
    updateCheckInCooldownUI();
    return;
  }

  checkInCooldownDeadline = deadline;
  stopCheckInCooldownTimer();

  updateCooldownBadge(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)), true);

  if (checkInButton) {
    checkInButton.disabled = true;
    checkInButton.title = 'Check-in available once the cooldown completes.';
  }
  if (mobileCheckInButton) {
    mobileCheckInButton.setAttribute('disabled', 'disabled');
  }
  if (chargeAttackButton) {
    chargeAttackButton.disabled = true;
    chargeAttackButton.title = 'Cooldown active. Wait until it completes to charge again.';
  }
  if (checkInCooldownElement) {
    checkInCooldownElement.classList.remove('hidden');
  }
  if (checkInCooldownFill) {
    checkInCooldownFill.style.transform = 'scaleX(1)';
  }
  updateCheckInCooldownUI();
  checkInCooldownTimerId = window.setInterval(updateCheckInCooldownUI, 1000);
}

function ensureDistrictDataLoaded() {
  if (districtGeoJson || districtGeoJsonPromise || typeof fetch !== 'function') {
    return districtGeoJsonPromise || Promise.resolve(districtGeoJson);
  }
  districtGeoJsonPromise = fetch(resolveDataUrl('prague-districts.geojson'))
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data && data.type === 'FeatureCollection') {
        districtGeoJson = data;
      }
      return districtGeoJson;
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
  if (profile.cooldownUntil !== undefined && profile.cooldownUntil !== null) {
    const parsedCooldown = Number(profile.cooldownUntil);
    profile.cooldownUntil = Number.isFinite(parsedCooldown) ? parsedCooldown : null;
    if (profile.cooldownUntil && profile.cooldownUntil <= Date.now()) {
      profile.cooldownUntil = null;
    }
  } else {
    profile.cooldownUntil = null;
  }
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

  if (lng === null && lat === null && !districtId && !districtName) {
    return null;
  }

  return {
    lng,
    lat,
    districtId,
    districtName,
    timestamp,
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

  return {
    timestamp: Math.trunc(tsNumber),
    districtId,
    districtName,
    type,
    multiplier,
    ranged: Boolean(entry.ranged),
    melee: Boolean(entry.melee),
  };
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

  profile.points = Math.max(0, normaliseNumber(apiPlayer.score, profile.points || 0));
  profile.attackPoints = Math.max(0, normaliseNumber(apiPlayer.attack_points, profile.attackPoints || 0));
  profile.defendPoints = Math.max(0, normaliseNumber(apiPlayer.defend_points, profile.defendPoints || 0));

  if (Array.isArray(apiPlayer.checkin_history)) {
    profile.checkins = sanitizeApiCheckinHistory(apiPlayer.checkin_history);
  } else if (!Array.isArray(profile.checkins)) {
    profile.checkins = [];
  }

  const serverCheckinsCount = normaliseNumber(apiPlayer.checkins, profile.checkins ? profile.checkins.length : 0);
  profile.serverCheckinCount = Math.max(serverCheckinsCount, Array.isArray(profile.checkins) ? profile.checkins.length : 0);

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

  if (Object.prototype.hasOwnProperty.call(apiPlayer, 'last_known_location')) {
    profile.lastKnownLocation = normaliseApiLastKnownLocation(apiPlayer.last_known_location);
  }

  profile.backendSyncedAt = Date.now();
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

    showActionContextMenu(
      mobileContextMenuStartLngLat.lng,
      mobileContextMenuStartLngLat.lat,
      anchorPoint,
      { isTouch: true }
    );

    if (originalEvent && typeof originalEvent.preventDefault === 'function') {
      originalEvent.preventDefault();
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

function getCurrentLocationDistrictInfo(options) {
  const { profile = null, allowHomeFallback = false } = options || {};

  if (profile && profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
    return {
      id: safeId(profile.lastKnownLocation.districtId),
      name: profile.lastKnownLocation.districtName || null,
      source: 'profile',
      lng: typeof profile.lastKnownLocation.lng === 'number' ? profile.lastKnownLocation.lng : null,
      lat: typeof profile.lastKnownLocation.lat === 'number' ? profile.lastKnownLocation.lat : null,
    };
  }

  if (lastKnownLocation && Array.isArray(lastKnownLocation) && lastKnownLocation.length === 2 && districtGeoJson) {
    const feature = findDistrictFeatureByPoint(lastKnownLocation[0], lastKnownLocation[1]);
    if (feature) {
      const id = getDistrictId(feature);
      if (id) {
        return {
          id: safeId(id),
          name: getDistrictName(feature) || null,
          source: 'geolocated',
          lng: lastKnownLocation[0],
          lat: lastKnownLocation[1],
        };
      }
    }
  }

  if (currentDistrictId) {
    return {
      id: safeId(currentDistrictId),
      name: currentDistrictName || null,
      source: 'map',
      lng: null,
      lat: null,
    };
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

function saveProfileLocation(profile, data) {
  if (!profile || !data) {
    return false;
  }

  const sanitized = {
    lng: typeof data.lng === 'number' && Number.isFinite(data.lng) ? data.lng : null,
    lat: typeof data.lat === 'number' && Number.isFinite(data.lat) ? data.lat : null,
    districtId: data.districtId ? safeId(data.districtId) : null,
    districtName: data.districtName || null,
    timestamp: Date.now(),
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

  const hasChanged =
    !existing ||
    existing.districtId !== sanitized.districtId ||
    existing.lng !== sanitized.lng ||
    existing.lat !== sanitized.lat ||
    existing.districtName !== sanitized.districtName ||
    !existing.timestamp ||
    sanitized.timestamp !== existing.timestamp;

  profile.lastKnownLocation = {
    lng: sanitized.lng,
    lat: sanitized.lat,
    districtId: sanitized.districtId || null,
    districtName: sanitized.districtName || null,
    timestamp: sanitized.timestamp,
  };

  if (profile.lastKnownLocation.districtId) {
    lastPreciseLocationInfo = {
      id: profile.lastKnownLocation.districtId,
      name: profile.lastKnownLocation.districtName || `District ${profile.lastKnownLocation.districtId}`,
    };
  }

  if (hasChanged) {
    scheduleLastKnownLocationSync(profile);
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

  return {
    score,
    attack_points: attackPoints,
    defend_points: defendPoints,
    checkins: history.length,
    checkin_history: history,
    home_district_code: homeCode,
    home_district_name: homeName,
    home_district: homeName || '',
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
        saveProfileLocation(profile, {
          lng: lastKnownLocation[0],
          lat: lastKnownLocation[1],
          districtId,
          districtName,
        })
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
  const now = Date.now();

  const applyButtonStates = () => {
    if (!menu) {
      return;
    }
    const cooldownActive = profile ? Boolean(profile.cooldownUntil && profile.cooldownUntil > now) : true;
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
    const isPreciseLocal =
      matchesLastKnown && (locationSource === 'map' || locationSource === 'geolocated');
    const willDefend = profile && targetId && homeId && homeId === targetId;
    const allowCheck = profile && targetId && (willDefend || matchesLastKnown);
    const expectedLocalMultiplier = !profile
      ? 1
      : willDefend
      ? chargeMultiplier
      : isPreciseLocal
      ? chargeMultiplier * 2
      : chargeMultiplier;

    if (menu.chargeButton) {
      menu.chargeButton.style.display = 'block';
      menu.chargeButton.disabled = !profile || cooldownActive;
      if (!profile) {
        menu.chargeButton.textContent = 'Log in to charge';
        menu.chargeButton.title = 'Log in to start charging.';
      } else {
        const baseText = willDefend ? 'Charge Defend' : 'Charge Attack';
        const chargedText = willDefend ? 'Recharge Defend' : 'Recharge Attack';
        menu.chargeButton.textContent = profile.nextCheckinMultiplier > 1 ? chargedText : baseText;
        menu.chargeButton.title = willDefend
          ? 'Charge to defend your district with a boosted check-in.'
          : 'Charge to start a countdown and multiply your next attack.';
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
        menu.checkButton.disabled = cooldownActive;
        if (cooldownActive) {
          menu.checkButton.textContent = willDefend ? 'Defend (Cooldown)' : 'Check In (Cooldown)';
          menu.checkButton.title = 'Cooldown active. Wait before checking in again.';
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
      if (profile && !willDefend && !isPreciseLocal && menu.targetDistrictId) {
        menu.rangedButton.style.display = 'block';
        menu.rangedButton.disabled = cooldownActive;
        const rangedLabel = chargeMultiplier > 1 ? `Ranged Attack (x${chargeMultiplier})` : 'Ranged Attack (10 pts)';
        menu.rangedButton.textContent = cooldownActive ? 'Ranged Attack (Cooldown)' : rangedLabel;
        menu.rangedButton.title = cooldownActive
          ? 'Cooldown active. Wait before launching another ranged attack.'
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
let checkInCooldownDeadline = null;
let checkInCooldownTimerId = null;
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
let lastHoverFeature = null;
let lastHoverLngLat = null;
let lastHoverDistrictId = null;
let isPointerOverDistrict = false;
let districtScores = {};

const STORAGE_KEY = 'pragueExplorerPlayers';
const CHECK_IN_COOLDOWN_MS = 10 * 60 * 1000;
const CHARGE_ATTACK_MULTIPLIER = 3;
const MIN_PASSWORD_LENGTH = 4;
const DEV_USERNAME = 'dev';
const DEV_DEFAULT_PASSWORD = 'deve';
const LAST_SIGNED_IN_USER_KEY = 'pragueExplorerLastUser';
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

let players = {};
let currentUser = null;
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

function updateCurrentDistrictFromCoordinates(lng, lat) {
  ensureDistrictDataLoaded();

  let currentFeature = null;
  const datasetReady = Boolean(districtGeoJson && Array.isArray(districtGeoJson.features));
  const canUseMapQuery =
    mapReady &&
    map &&
    typeof map.project === 'function' &&
    typeof map.queryRenderedFeatures === 'function' &&
    map.getLayer('districts-fill') &&
    (typeof map.isSourceLoaded !== 'function' || map.isSourceLoaded('prague-districts'));

  if (canUseMapQuery) {
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

  if (!currentFeature && datasetReady) {
    currentFeature = findDistrictFeatureByPoint(lng, lat);
  }

  if (!currentFeature && !datasetReady && districtGeoJsonPromise) {
    districtGeoJsonPromise
      .then(() => {
        if (districtGeoJson) {
          updateCurrentDistrictFromCoordinates(lng, lat);
        }
      })
      .catch(() => {});
  }

  if (currentFeature) {
    const resolvedId = getDistrictId(currentFeature);
    currentDistrictId = resolvedId ? safeId(resolvedId) : null;
    currentDistrictName = getDistrictName(currentFeature);
    if (currentUser && players[currentUser] && currentDistrictId) {
      const profile = ensurePlayerProfile(currentUser);
      if (
        saveProfileLocation(profile, {
          lng,
          lat,
          districtId: currentDistrictId,
          districtName: currentDistrictName,
        })
      ) {
        savePlayers();
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
  if (!checkInCooldownDeadline || checkInCooldownDeadline <= Date.now()) {
    updateCooldownBadge(0, false);
  } else {
    updateCooldownBadge(Math.ceil((checkInCooldownDeadline - Date.now()) / 1000), true);
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
  renderPlayerState();
  switchToWelcome();
}

function performLogout() {
  return logoutCurrentSession()
    .catch(() => null)
    .finally(() => {
      completeLogoutTransition();
    });
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

function renderPlayerState() {
  if (!playerUsernameLabel || !playerPointsLabel || !playerCheckinsLabel || !checkInButton) {
    return;
  }

  if (!currentUser || !players[currentUser]) {
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
    stopCheckInCooldown(false);
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

  const profile = ensurePlayerProfile(currentUser);
  playerUsernameLabel.textContent = currentUser;
  playerPointsLabel.textContent = Math.round(profile.points).toString();
  playerCheckinsLabel.textContent = profile.checkins.length.toString();
  updateCurrentUserTag(currentUser);
  updateDrawerSummaries(profile);
  populateDrawerHomeSelect(profile);
  renderCheckins(profile.checkins);
  updateRecentCheckinsDrawerContent(profile);
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
  const isAtHome = profile.homeDistrictId && locationId && safeId(profile.homeDistrictId) === locationId;
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
    chargeAttackButton.disabled = false;
    const baseChargeText = isAtHome ? 'Charge Defend' : 'Charge Attack';
    const chargedText = isAtHome ? 'Recharge Defend' : 'Recharge Attack';
    chargeAttackButton.textContent = profile.nextCheckinMultiplier > 1 ? chargedText : baseChargeText;
    chargeAttackButton.title = profile.nextCheckinMultiplier > 1
      ? `Charged: next check-in worth x${profile.nextCheckinMultiplier} points. Recharge to reset the timer.`
      : isAtHome
      ? 'Charge to defend your district with a boosted check-in.'
      : 'Charge to start a countdown and multiply your next attack.';
  }
  if (setHomeDistrictButton) {
    setHomeDistrictButton.disabled = false;
    setHomeDistrictButton.title = profile.homeDistrictId
      ? `Current home: ${homeDescription}. Click to change.`
      : 'Click to choose your home district from the list.';
  }
  const cooldownUntil =
    typeof profile.cooldownUntil === 'number' && Number.isFinite(profile.cooldownUntil)
      ? profile.cooldownUntil
      : null;
  const now = Date.now();
  const cooldownActive = Boolean(cooldownUntil && cooldownUntil > now);
  if (cooldownActive) {
    startCheckInCooldown(cooldownUntil);
  } else {
    stopCheckInCooldown(true);
    if (profile.cooldownUntil) {
      delete profile.cooldownUntil;
      savePlayers();
    }
  }
  if (checkInButton) {
    const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
    const baseMultiplier = !profile || !preciseId ? 1 : isAtHome ? 1 : 2;
    const effectiveMultiplier = chargeMultiplier * baseMultiplier;
    checkInButton.textContent = effectiveMultiplier > 1 ? `Check In (x${effectiveMultiplier})` : 'Check In';
    if (cooldownActive) {
      checkInButton.title = 'Wait for the cooldown to finish.';
    } else if (chargeMultiplier > 1) {
      checkInButton.title = `Charged! Next check-in pays x${chargeMultiplier}.`;
    } else if (baseMultiplier > 1) {
      checkInButton.title = `Earn x${baseMultiplier} points for this local attack.`;
    } else {
      checkInButton.title = 'Log a check-in to earn points.';
    }
    checkInButton.disabled = cooldownActive;
  }
  if (chargeAttackButton) {
    if (cooldownActive) {
      chargeAttackButton.disabled = true;
      chargeAttackButton.title = 'Cooldown active. Wait until it completes to charge again.';
    }
  }
  if (clearHistoryButton) {
    clearHistoryButton.disabled = !(profile.checkins && profile.checkins.length);
  }

  updateHomePresenceIndicator();
}

function createCheckinListItem(entry) {
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

  primaryEntries.forEach((entry) => {
    checkinList.appendChild(createCheckinListItem(entry));
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
      moreList.appendChild(createCheckinListItem(entry));
    });
    details.appendChild(moreList);

    details.addEventListener('toggle', () => {
      summary.textContent = details.open ? expandedLabel : collapsedLabel;
    });

    containerItem.appendChild(details);
    checkinList.appendChild(containerItem);
  }
}

function formatRecentCheckinTag(entry) {
  if (!entry) {
    return '';
  }
  const district = entry.districtName && entry.districtName.trim()
    ? entry.districtName.trim()
    : entry.districtId
    ? `District ${entry.districtId}`
    : 'Unknown district';
  const type = typeof entry.type === 'string' ? entry.type.toLowerCase() : '';
  const typeLabel = type === 'defend' ? 'Defend' : type === 'attack' ? 'Attack' : 'Check-in';
  const when = entry.timestamp ? formatTimeAgo(entry.timestamp) : '';
  return when ? `${typeLabel} • ${district} (${when})` : `${typeLabel} • ${district}`;
}

function applyRecentCheckinTagState(element, entry, { fallbackText = '', hideWhenEmpty = false } = {}) {
  if (!element) {
    return;
  }
  element.classList.remove('attack', 'defend', 'neutral', 'empty');

  if (entry) {
    element.textContent = formatRecentCheckinTag(entry);
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
    currentUserTag.textContent = '@Guest';
    currentUserTag.classList.add('empty');
    currentUserTag.setAttribute('aria-hidden', 'true');
    currentUserTag.disabled = true;
    return;
  }
  currentUserTag.textContent = `@${username}`;
  currentUserTag.classList.remove('empty');
  currentUserTag.removeAttribute('aria-hidden');
  currentUserTag.disabled = false;
}

function updateRecentCheckinTags(history) {
  if (!recentCheckinTagPrimary) {
    return;
  }
  const first = history && history.length ? history[0] : null;

  applyRecentCheckinTagState(recentCheckinTagPrimary, first, { fallbackText: 'No check-ins yet' });
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
    meta.textContent = metaParts.join(' • ');
    li.appendChild(meta);

    recentCheckinsList.appendChild(li);
  });

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

function updateCooldownBadge(secondsRemaining, active) {
  if (!cooldownBadge) {
    return;
  }
  if (!active) {
    cooldownBadge.classList.add('hidden');
    cooldownBadge.textContent = 'Cooldown: 00:00';
    return;
  }
  const clamped = Math.max(0, secondsRemaining);
  cooldownBadge.classList.remove('hidden');
  cooldownBadge.textContent = `Cooldown: ${formatCooldownTime(clamped * 1000)}`;
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
    drawerLocationSummary.classList.remove('home', 'away', 'fallback');
    if (fallbackInfo && fallbackInfo.source === 'home-fallback') {
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

  profile.cooldownUntil = null;
  currentUser = username;
  players[username] = profile;
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
  if (!profile.skipCooldown && profile.cooldownUntil && profile.cooldownUntil > now) {
    updateStatus('Cooldown active. Wait until it finishes before checking in again.');
    return;
  }
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
  const isTargetHome = Boolean(targetDistrictId && homeId && targetDistrictId === homeId);

  const isDefending = Boolean(homeId && locationContextId && homeId === locationContextId);
  const checkInType = isDefending ? 'defend' : 'attack';

  if (isTargetHome && isDefending && districtId !== targetDistrictId) {
    districtId = targetDistrictId;
    const fallbackHomeDescription = describeHomeDistrict(profile);
    const fallbackHomeName =
      fallbackHomeDescription && fallbackHomeDescription !== 'Unset' ? fallbackHomeDescription : null;
    districtDisplayName =
      (targetDistrictName && targetDistrictName.trim()) ||
      (profile.homeDistrictName && profile.homeDistrictName.trim()) ||
      fallbackHomeName ||
      `District ${targetDistrictId}`;
    if (!(contextIsLocal && (locationSource === 'map' || locationSource === 'geolocated'))) {
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

  const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
  const isPreciseLocal =
    locationSource &&
    (locationSource === 'map' || locationSource === 'geolocated') &&
    locationContextId === districtId;
  const isLocalAttack = !isDefending && (isPreciseLocal || locationSource === 'profile');

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
  });
  profile.checkins = profile.checkins.slice(0, MAX_HISTORY_ITEMS);
  profile.points += pointsAwarded;
  if (isDefending) {
    profile.defendPoints += pointsAwarded;
  } else {
    profile.attackPoints += pointsAwarded;
  }
  profile.serverCheckinCount = profile.checkins.length;
  if (
    (locationSource === 'map' || locationSource === 'geolocated' || locationSource === 'profile') &&
    saveProfileLocation(profile, {
      lng: locationLng,
      lat: locationLat,
      districtId: locationContextId,
      districtName: locationDisplayName,
    })
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
    const cooldownUntil = now + CHECK_IN_COOLDOWN_MS;
    profile.cooldownUntil = cooldownUntil;
    startCheckInCooldown(cooldownUntil);
  } else {
    profile.cooldownUntil = null;
    stopCheckInCooldown(true);
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
  if (!profile.skipCooldown && profile.cooldownUntil && profile.cooldownUntil > now) {
    updateStatus('Cooldown already in progress. Wait for it to finish before charging again.');
    return;
  }

  const locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  const locationId = locationInfo && locationInfo.id ? safeId(locationInfo.id) : null;
  const isAtHome = profile.homeDistrictId && locationId && safeId(profile.homeDistrictId) === locationId;
  profile.nextCheckinMultiplier = CHARGE_ATTACK_MULTIPLIER;
  if (!profile.skipCooldown || !isDevUser(currentUser)) {
    const cooldownUntil = now + CHECK_IN_COOLDOWN_MS;
    profile.cooldownUntil = cooldownUntil;
    startCheckInCooldown(cooldownUntil);
  } else {
    profile.cooldownUntil = null;
    stopCheckInCooldown(true);
  }
  savePlayers();
  renderPlayerState();
  const label = isAtHome ? 'defend' : 'attack';
  updateStatus(
    `Charging ${label}! In ${Math.floor(CHECK_IN_COOLDOWN_MS / 60000)} minutes your next check-in will pay x${CHARGE_ATTACK_MULTIPLIER} points.`
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
  if (!profile.skipCooldown && profile.cooldownUntil && profile.cooldownUntil > now) {
    updateStatus('Cooldown already in progress. Wait until it finishes before attacking again.');
    return;
  }

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

  const chargeMultiplier = profile.nextCheckinMultiplier > 1 ? profile.nextCheckinMultiplier : 1;
  const pointsAwarded = 10 * chargeMultiplier;

  profile.checkins.unshift({
    timestamp: now,
    districtId: safeDistrictId,
    districtName: name,
    type: 'attack',
    multiplier: chargeMultiplier,
    ranged: true,
    melee: false,
  });
  profile.checkins = profile.checkins.slice(0, MAX_HISTORY_ITEMS);

  profile.points += pointsAwarded;
  profile.attackPoints += pointsAwarded;
  profile.nextCheckinMultiplier = 1;
  profile.serverCheckinCount = profile.checkins.length;

  applyDistrictScoreDelta(safeDistrictId, -pointsAwarded, name);

  if (!profile.skipCooldown || !isDevUser(currentUser)) {
    const cooldownUntil = now + CHECK_IN_COOLDOWN_MS;
    profile.cooldownUntil = cooldownUntil;
    startCheckInCooldown(cooldownUntil);
  } else {
    profile.cooldownUntil = null;
    stopCheckInCooldown(true);
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

  map.addSource('prague-boundary', {
    type: 'geojson',
    data: resolveDataUrl('prague-boundary.geojson'),
  });

  map.addLayer({
    id: 'prague-mask-fill',
    type: 'fill',
    source: 'prague-boundary',
    paint: {
      'fill-color': '#f9f9fd',
      'fill-opacity': 0.5,
    },
  });

  map.addSource('prague-buildings', {
    type: 'geojson',
    data: resolveDataUrl('prague-building-polygons.geojson'),
  });

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

  map.addSource('prague-districts', {
    type: 'geojson',
    data: resolveDataUrl('prague-districts.geojson'),
    promoteId: 'kod_mc',
  });

  const handleDistrictSourceLoad = (event) => {
    if (event.sourceId === 'prague-districts' && event.isSourceLoaded) {
      map.off('sourcedata', handleDistrictSourceLoad);
      if (lastKnownLocation) {
        updateCurrentDistrictFromCoordinates(lastKnownLocation[0], lastKnownLocation[1]);
      }
    }
  };
  map.on('sourcedata', handleDistrictSourceLoad);

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

  map.addSource('prague-parks', {
    type: 'geojson',
    data: resolveDataUrl('prague-parks.geojson'),
  });

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

  map.addSource('prague-urban', {
    type: 'geojson',
    data: resolveDataUrl('urban-planning.geojson'),
  });

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

  map.on('contextmenu', 'buildings-3d', (event) => {
    event.preventDefault();
    hideActionContextMenu();
    if (!event.lngLat) {
      return;
    }
    const point = map.project(event.lngLat);
    showActionContextMenu(event.lngLat.lng, event.lngLat.lat, point);
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


  map.addSource('prague-streets', {
    type: 'geojson',
    data: resolveDataUrl('prague-streets.geojson'),
  });

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

  map.addSource('prague-cycling', {
    type: 'geojson',
    data: resolveDataUrl('prague-cycling-routes.geojson'),
  });

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
      updateCurrentDistrictFromCoordinates(coords.longitude, coords.latitude);
    });
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

if (backButton) {
  backButton.addEventListener('click', () => {
    performLogout();
  });
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
      setMobileDrawerState(true);
    }
  });
  currentUserTag.addEventListener('keydown', (event) => {
    if (!currentUser) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setMobileDrawerState(true);
    }
  });
}


if (floatingCheckInButton) {
  floatingCheckInButton.addEventListener('click', () => {
    handleCheckIn();
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
      if (profile.cooldownUntil && profile.cooldownUntil < Date.now()) {
        profile.cooldownUntil = null;
      }
    }
    savePlayers();
    if (profile.skipCooldown) {
      stopCheckInCooldown(true);
    }
    renderPlayerState();
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

const recentTagsContainer = document.querySelector('.recent-tags');
if (recentTagsContainer) {
  recentTagsContainer.addEventListener('click', (event) => {
    const target = event.target.closest('.recent-tag');
    if (!target || target.classList.contains('empty')) {
      return;
    }
    if (target.classList.contains('user-tag')) {
      if (currentUser) {
        setMobileDrawerState(true);
      }
      return;
    }
    openRecentCheckinsDrawer(target);
  });
}

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
  if (event.key === 'Escape' && document.body.classList.contains('recent-checkins-open')) {
    closeRecentCheckinsDrawer();
  }
});


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
