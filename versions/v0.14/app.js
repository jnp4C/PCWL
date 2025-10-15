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

const DATA_PREFIX = 'data/';
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

const TREE_GIF_URL = resolveDataUrl('tree.gif?v=2');
const HITMARKER_GIF_URL = resolveDataUrl('attack_hitmarker.gif?v=1');
const DEFEND_HITMARKER_GIF_URL = resolveDataUrl('defend_hitmarker.gif?v=1');

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
  if (enableButton && checkInButton) {
    checkInButton.disabled = false;
    checkInButton.title = '';
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

  if (checkInButton) {
    checkInButton.disabled = true;
    checkInButton.title = 'Check-in available once the cooldown completes.';
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
  if (profile.auth && typeof profile.auth === 'object') {
    const passwordHash = typeof profile.auth.passwordHash === 'string' ? profile.auth.passwordHash : null;
    const salt = typeof profile.auth.salt === 'string' ? profile.auth.salt : null;
    const createdAt = normaliseNumber(profile.auth.createdAt, Date.now());
    const rememberOnDevice = Boolean(profile.auth.rememberOnDevice);
    profile.auth = passwordHash && salt ? { passwordHash, salt, createdAt, rememberOnDevice } : null;
  } else {
    profile.auth = null;
  }
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

function getCurrentLocationDistrictInfo(options) {
  const { profile = null, allowHomeFallback = false } = options || {};

  if (currentDistrictId) {
    return {
      id: safeId(currentDistrictId),
      name: currentDistrictName || null,
      source: 'map',
      lng: null,
      lat: null,
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

  if (profile && profile.lastKnownLocation && profile.lastKnownLocation.districtId) {
    return {
      id: safeId(profile.lastKnownLocation.districtId),
      name: profile.lastKnownLocation.districtName || null,
      source: 'profile',
      lng: typeof profile.lastKnownLocation.lng === 'number' ? profile.lastKnownLocation.lng : null,
      lat: typeof profile.lastKnownLocation.lat === 'number' ? profile.lastKnownLocation.lat : null,
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
  const districtId = data.districtId ? safeId(data.districtId) : null;
  if (!districtId) {
    return false;
  }
  const sanitized = {
    lng: typeof data.lng === 'number' && Number.isFinite(data.lng) ? data.lng : null,
    lat: typeof data.lat === 'number' && Number.isFinite(data.lat) ? data.lat : null,
    districtId,
    districtName: data.districtName || null,
    timestamp: Date.now(),
  };

  const existing = profile.lastKnownLocation || {};
  if (sanitized.lng === null && typeof existing.lng === 'number' && Number.isFinite(existing.lng)) {
    sanitized.lng = existing.lng;
  }
  if (sanitized.lat === null && typeof existing.lat === 'number' && Number.isFinite(existing.lat)) {
    sanitized.lat = existing.lat;
  }
  if (!sanitized.districtName && existing.districtName) {
    sanitized.districtName = existing.districtName;
  }
  if (
    existing &&
    existing.districtId === sanitized.districtId &&
    existing.lng === sanitized.lng &&
    existing.lat === sanitized.lat
  ) {
    sanitized.timestamp = existing.timestamp || sanitized.timestamp;
  }

  profile.lastKnownLocation = sanitized;
  return true;
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
      const info = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
      if (!info || !info.id) {
        statusText = 'Unknown location';
        titleText = 'No recent location data available.';
      } else {
        const atHome = safeId(profile.homeDistrictId) === safeId(info.id);
        if (atHome) {
          statusText = 'Last known: Home district';
          statusClass = 'home';
          titleText = 'Based on your last confirmed position.';
        } else {
          const label = info.name || `District ${info.id}`;
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

function showActionContextMenu(lng, lat, point) {
  const menu = ensureActionContextMenu();
  if (!menu || !mapContainer) {
    return;
  }

  actionContextMenuLngLat = [lng, lat];
  actionContextMenuPoint = { x: point.x, y: point.y };
  const element = menu.element;
  element.classList.remove('hidden');
  element.style.left = '0px';
  element.style.top = '0px';

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
    const menuWidth = element.offsetWidth;
    const menuHeight = element.offsetHeight;
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    const padding = 8;

    let left = Math.round(point.x);
    let top = Math.round(point.y);

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
let lastHoverFeature = null;
let lastHoverLngLat = null;
let lastHoverDistrictId = null;
let isPointerOverDistrict = false;
let districtScores = {};

const STORAGE_KEY = 'pragueExplorerPlayers';
const POINTS_PER_CHECKIN = 10;
const MAX_HISTORY_ITEMS = 15;
const CHECK_IN_COOLDOWN_MS = 10 * 60 * 1000;
const CHARGE_ATTACK_MULTIPLIER = 3;
const MIN_PASSWORD_LENGTH = 4;
const DEV_USERNAME = 'dev';
const DEV_DEFAULT_PASSWORD = 'dev';
const LAST_SIGNED_IN_USER_KEY = 'pragueExplorerLastUser';
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

let players = {};
let currentUser = null;

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
  if (profile.auth && typeof profile.auth.passwordHash === 'string' && typeof profile.auth.salt === 'string') {
    return;
  }
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

async function initialisePlayers() {
  loadPlayers();
  try {
    await ensureDevAccount();
  } catch (error) {
    console.warn('Failed to finalise player initialisation', error);
  }
  renderKnownPlayers();
  renderPlayerState();
  prefillLastSignedInUser();
  autoLoginRememberedUser();
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
    return;
  }

  const profile = ensurePlayerProfile(currentUser);
  playerUsernameLabel.textContent = currentUser;
  playerPointsLabel.textContent = Math.round(profile.points).toString();
  playerCheckinsLabel.textContent = profile.checkins.length.toString();
  renderCheckins(profile.checkins);
  if (devOptionsContainer && devSkipCooldownCheckbox && devChangeUserButton) {
    if (isDevUser(currentUser)) {
      devOptionsContainer.classList.remove('hidden');
      devSkipCooldownCheckbox.checked = Boolean(profile.skipCooldown);
      devChangeUserButton.hidden = false;
      devChangeUserButton.disabled = false;
    } else {
      devOptionsContainer.classList.add('hidden');
      devSkipCooldownCheckbox.checked = false;
      devChangeUserButton.hidden = true;
      devChangeUserButton.disabled = true;
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
  const isAtHome = profile.homeDistrictId && fallbackId && safeId(profile.homeDistrictId) === fallbackId;
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
  if (!checkinList) {
    return;
  }
  checkinList.innerHTML = '';

  if (!history || !history.length) {
    const li = document.createElement('li');
    li.className = 'checkin-item empty';
    li.textContent = currentUser ? 'No check-ins yet. Explore the city and log your first stop!' : 'Sign in to track your check-ins.';
    checkinList.appendChild(li);
    return;
  }

  const allEntries = history.slice(0, MAX_HISTORY_ITEMS);
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
  if (!isValidUsername(username)) {
    updateStatus('Invalid username. Use 3-32 characters with letters, numbers, or underscores.');
    usernameInput.focus();
    return;
  }
  if (!username || !password) {
    updateStatus('Enter both username and password to continue.');
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    updateStatus(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    return;
  }

  const existingPlayer = Object.prototype.hasOwnProperty.call(players, username);
  const profile = ensurePlayerProfile(username);
  const hasAuth = profile.auth && typeof profile.auth.passwordHash === 'string' && typeof profile.auth.salt === 'string';
  let statusMessage = null;

  try {
    if (hasAuth) {
      const hashedAttempt = await hashPassword(password, profile.auth.salt);
      if (hashedAttempt !== profile.auth.passwordHash) {
        updateStatus('Incorrect password. Please try again.');
        passwordInput.value = '';
        passwordInput.focus();
        return;
      }
      statusMessage = `Welcome back, ${username}.`;
    } else {
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      profile.auth = {
        passwordHash,
        salt,
        createdAt: Date.now(),
        rememberOnDevice: rememberRequested,
      };
      statusMessage = existingPlayer ? 'Password set. Welcome back!' : 'New explorer registered. Welcome!';
    }
  } catch (error) {
    console.error('Failed to process credentials', error);
    updateStatus('Unable to verify credentials. Try again.');
    return;
  }

  if (profile.auth) {
    profile.auth.rememberOnDevice = rememberRequested;
  }

  usernameInput.value = '';
  passwordInput.value = '';

  completeAuthenticatedLogin(username, profile, {
    message: statusMessage,
    triggerGeolocation: true,
  });
}

function completeAuthenticatedLogin(username, profile, options = {}) {
  if (!username || !profile) {
    return;
  }

  profile.cooldownUntil = null;
  currentUser = username;
  if (
    profile.lastKnownLocation &&
    typeof profile.lastKnownLocation.lng === 'number' &&
    typeof profile.lastKnownLocation.lat === 'number'
  ) {
    lastKnownLocation = [profile.lastKnownLocation.lng, profile.lastKnownLocation.lat];
  }

  const rememberState = Boolean(profile.auth && profile.auth.rememberOnDevice);
  if (rememberPasswordInput) {
    rememberPasswordInput.checked = rememberState;
  }

  setLastSignedInUser(username);
  savePlayers();
  renderKnownPlayers();
  renderPlayerState();

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

  const locationInfo = getCurrentLocationDistrictInfo({ profile, allowHomeFallback: true });
  if (!locationInfo || !locationInfo.id) {
    updateStatus('Allow geolocation and stand inside a district to check in.');
    return;
  }

  const locationContextId = safeId(locationInfo.id);
  let districtId = locationContextId;
  let locationSource = locationInfo.source || null;
  let districtDisplayName = locationInfo.name || currentDistrictName || `District ${districtId}`;
  let locationLng = typeof locationInfo.lng === 'number' && Number.isFinite(locationInfo.lng) ? locationInfo.lng : null;
  let locationLat = typeof locationInfo.lat === 'number' && Number.isFinite(locationInfo.lat) ? locationInfo.lat : null;
  const homeId = profile.homeDistrictId ? safeId(profile.homeDistrictId) : null;
  const isTargetHome = Boolean(targetDistrictId && homeId && targetDistrictId === homeId);

  if (isTargetHome && districtId !== targetDistrictId) {
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
    currentDistrictId = districtId;
    currentDistrictName = districtDisplayName;
  }
  updateHomePresenceIndicator();

  const isDefending = Boolean(homeId && districtId && homeId === districtId);
  const checkInType = isDefending ? 'defend' : 'attack';

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
  if (
    (locationSource === 'map' || locationSource === 'geolocated') &&
    saveProfileLocation(profile, {
      lng: locationLng,
      lat: locationLat,
      districtId,
      districtName: districtDisplayName,
    })
  ) {
    savePlayers();
  } else if (locationSource !== 'home-remote' && profile.lastKnownLocation && safeId(profile.lastKnownLocation.districtId) === districtId) {
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
  savePlayers();
  renderPlayerState();
  updateStatus('Check-in history cleared.');
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

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

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
    currentUser = null;
    renderPlayerState();
    switchToWelcome();
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
  if (handled) {
    event.preventDefault();
  }
});

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
