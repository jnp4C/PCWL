'use strict';

const PLAYER_STORAGE_KEY = 'pcwlPlayers';
const LEGACY_PLAYER_STORAGE_KEYS = ['pragueExplorerPlayers'];
const DISTRICT_STORAGE_KEY = 'pcwlDistrictScores';
const LEGACY_DISTRICT_STORAGE_KEYS = ['pragueExplorerDistrictScores'];
const DISTRICT_BASE_SCORE = 2000;
const pageConfig =
  typeof window !== 'undefined' &&
  window.__PCWL_PAGE_CONFIG__ &&
  typeof window.__PCWL_PAGE_CONFIG__ === 'object'
    ? window.__PCWL_PAGE_CONFIG__
    : null;

function normalizeApiBase(base) {
  if (!base) {
    return '/api';
  }
  let normalized = String(base).trim();
  if (normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/, '');
  }
  return normalized || '/api';
}

function buildLeaderboardApiUrl(config) {
  const base =
    (config && config.apiBaseUrl) ||
    (config && config.api && config.api.base_url) ||
    '/api';
  return `${normalizeApiBase(base)}/leaderboard/`;
}

let LEADERBOARD_API_URL = buildLeaderboardApiUrl(pageConfig);
let API_BASE_URL =
  (pageConfig && normalizeApiBase(pageConfig.apiBaseUrl || (pageConfig.api && pageConfig.api.base_url))) ||
  '/api';
let bootstrapLeaderboard =
  (pageConfig && pageConfig.leaderboard) ||
  (typeof window !== 'undefined' && window.__PCWL_LEADERBOARD_PAYLOAD__) ||
  null;

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const changeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  signDisplay: 'always',
});

const MOBILE_ACCORDION_QUERY = '(max-width: 640px)';
const DESKTOP_ACCORDION_ENABLED = true;

const decimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const LEADERBOARD_REFRESH_DEBOUNCE_MS = 1500;
let scheduledLeaderboardRefresh = 0;
const LEADERBOARD_COMPACT_LIMIT = 10;
const LEADERBOARD_MAX_LIMIT = 50;

const leaderboardState = {
  players: {
    order: 'desc',
    showAll: false,
  },
  districts: {
    order: 'desc',
    showAll: false,
  },
  parties: {
    order: 'desc',
    showAll: false,
  },
  lastPlayers: [],
  lastDistricts: [],
  lastParties: [],
};

function applyLeaderboardBootstrap(payload) {
  if (!payload || typeof payload !== 'object') {
    return;
  }
  bootstrapLeaderboard = payload;
  renderPlayerLeaderboard(payload.players || []);
  renderDistrictLeaderboard(payload.districts || []);
  renderPartyLeaderboard(payload.parties || []);
}

function applyPageConfig(config) {
  if (config && typeof config === 'object') {
    LEADERBOARD_API_URL = buildLeaderboardApiUrl(config);
    if (config.apiBaseUrl || (config.api && config.api.base_url)) {
      API_BASE_URL = normalizeApiBase(config.apiBaseUrl || (config.api && config.api.base_url));
    }
    if (config.leaderboard) {
      applyLeaderboardBootstrap(config.leaderboard);
    }
  }
}

if (typeof window !== 'undefined') {
  window.__applyPageConfig = applyPageConfig;
  window.__applyLeaderboardBootstrap = applyLeaderboardBootstrap;
}

const playerSortToggle = document.getElementById('player-sort-toggle');
const playerShowToggle = document.getElementById('player-show-toggle');
const districtSortToggle = document.getElementById('district-sort-toggle');
const districtShowToggle = document.getElementById('district-show-toggle');
const partySortToggle = document.getElementById('party-sort-toggle');
const partyShowToggle = document.getElementById('party-show-toggle');
const friendProfileDrawer = document.getElementById('friend-profile-drawer');
const friendProfileOverlay = document.getElementById('friend-profile-overlay');
const friendProfileContent = document.getElementById('friend-profile-content');
const friendProfileBody = document.getElementById('friend-profile-body');
const friendProfileClose = document.getElementById('friend-profile-close');
const friendProfileTitle = document.getElementById('friend-profile-title');
const partyProfileDrawer = document.getElementById('party-profile-drawer');
const partyProfileOverlay = document.getElementById('party-profile-overlay');
const partyProfileContent = document.getElementById('party-profile-content');
const partyProfileBody = document.getElementById('party-profile-body');
const partyProfileClose = document.getElementById('party-profile-close');
const partyProfileTitle = document.getElementById('party-profile-title');
const playerSearchForm = document.getElementById('player-search-form');
const playerSearchInput = document.getElementById('player-search-input');
const partySearchForm = document.getElementById('party-search-form');
const partySearchInput = document.getElementById('party-search-input');
const leaderboardSearchStatus = document.getElementById('leaderboard-search-status');

function isCompactLeaderboardView() {
  return (
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 720px)').matches
  );
}

function refreshToggleLabels() {
  if (playerShowToggle) {
    playerShowToggle.textContent = leaderboardState.players.showAll ? 'Show top 10' : 'Show all';
  }
  if (districtShowToggle) {
    districtShowToggle.textContent = leaderboardState.districts.showAll ? 'Show top 10' : 'Show all';
  }
  if (partyShowToggle) {
    partyShowToggle.textContent = leaderboardState.parties.showAll ? 'Show top 10' : 'Show all';
  }
  if (playerSortToggle) {
    playerSortToggle.textContent =
      leaderboardState.players.order === 'asc' ? 'Show highest' : 'Show lowest';
  }
  if (districtSortToggle) {
    districtSortToggle.textContent =
      leaderboardState.districts.order === 'asc' ? 'Show highest' : 'Show lowest';
  }
  if (partySortToggle) {
    partySortToggle.textContent =
      leaderboardState.parties.order === 'asc' ? 'Show highest' : 'Show lowest';
  }
}

function buildApiUrl(path) {
  const cleanPath = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
  return `${API_BASE_URL}/${cleanPath}`;
}

function resetLeaderboardAccordions() {
  const playerTable = document.querySelector('.leaderboard-table--players');
  const districtTable = document.querySelector('.leaderboard-table--districts');
  const partyTable = document.querySelector('.leaderboard-table--parties');
  [playerTable, districtTable, partyTable].forEach((table) => {
    if (table) {
      applyAccordionBehavior(table);
    }
  });
}

async function fetchJson(path) {
  const response = await fetch(buildApiUrl(path), { credentials: 'same-origin' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text || 'unknown error'}`);
  }
  return response.json();
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = Math.max(0, now - (typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()));
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function setLeaderboardSearchStatus(message = '') {
  if (leaderboardSearchStatus) {
    leaderboardSearchStatus.textContent = message || '';
  }
}

function focusLeaderboardRow(row) {
  if (!row || !(row instanceof HTMLElement)) return;
  row.classList.add('leaderboard-row-focus');
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => row.classList.remove('leaderboard-row-focus'), 2000);
}

function sanitizePublicProfile(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const username = typeof raw.username === 'string' && raw.username.trim() ? raw.username.trim() : '';
  if (!username) {
    return null;
  }
  return {
    username,
    displayName: typeof raw.display_name === 'string' ? raw.display_name : '',
    profileBio: typeof raw.profile_bio === 'string' ? raw.profile_bio.slice(0, 50) : '',
    mapMarkerColor: typeof raw.map_marker_color === 'string' ? raw.map_marker_color : '',
    streakDays: Math.max(0, Number(raw.streak_days) || 0),
    streakMultiplier: Math.max(1, Number(raw.streak_multiplier) || 1),
  };
}

function sanitizePartyProfile(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const party = raw.party || {};
  const code = typeof party.code === 'string' ? party.code : '';
  if (!code) return null;
  return {
    party: {
      code,
      name: typeof party.name === 'string' ? party.name : '',
      leader: typeof party.leader === 'string' ? party.leader : '',
      member_count: Number(party.member_count) || 0,
      lifetime_member_count: Number(party.lifetime_member_count) || Number(party.member_count) || 0,
      prestige_total: Number(party.prestige_total) || 0,
    },
    active_members: Array.isArray(raw.active_members) ? raw.active_members : [],
  };
}

function closeFriendProfileDrawer({ restoreFocus = true } = {}) {
  if (!friendProfileDrawer || !document.body.classList.contains('friend-profile-open')) {
    return;
  }
  document.body.classList.remove('friend-profile-open');
  friendProfileDrawer.setAttribute('aria-hidden', 'true');
  if (friendProfileOverlay) {
    friendProfileOverlay.classList.add('hidden');
    friendProfileOverlay.setAttribute('aria-hidden', 'true');
  }
  if (restoreFocus && closeFriendProfileDrawer.lastTrigger && typeof closeFriendProfileDrawer.lastTrigger.focus === 'function') {
    closeFriendProfileDrawer.lastTrigger.focus({ preventScroll: true });
  }
  closeFriendProfileDrawer.lastTrigger = null;
  if (friendProfileBody) {
    friendProfileBody.innerHTML = '';
  }
  resetLeaderboardAccordions();
}

function closePartyProfileDrawer({ restoreFocus = true } = {}) {
  if (!partyProfileDrawer || !document.body.classList.contains('party-profile-open')) {
    return;
  }
  document.body.classList.remove('party-profile-open');
  partyProfileDrawer.setAttribute('aria-hidden', 'true');
  if (partyProfileOverlay) {
    partyProfileOverlay.classList.add('hidden');
    partyProfileOverlay.setAttribute('aria-hidden', 'true');
  }
  if (restoreFocus && closePartyProfileDrawer.lastTrigger && typeof closePartyProfileDrawer.lastTrigger.focus === 'function') {
    closePartyProfileDrawer.lastTrigger.focus({ preventScroll: true });
  }
  closePartyProfileDrawer.lastTrigger = null;
  if (partyProfileBody) {
    partyProfileBody.innerHTML = '';
  }
  resetLeaderboardAccordions();
}

function loadPlayerData() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    let keyUsed = PLAYER_STORAGE_KEY;
    let stored = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!stored) {
      for (const legacyKey of LEGACY_PLAYER_STORAGE_KEYS) {
        const legacyValue = window.localStorage.getItem(legacyKey);
        if (legacyValue) {
          stored = legacyValue;
          keyUsed = legacyKey;
          break;
        }
      }
    }
    if (!stored) {
      return [];
    }
    if (keyUsed !== PLAYER_STORAGE_KEY) {
      try {
        window.localStorage.setItem(PLAYER_STORAGE_KEY, stored);
        window.localStorage.removeItem(keyUsed);
      } catch (migrationError) {
        // ignore write failures; legacy data is already loaded in-memory
      }
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return [];
    }
    return Object.entries(parsed).map(([username, profile]) => {
      const safeProfile = profile && typeof profile === 'object' ? profile : {};
      const points = Number(safeProfile.points) || 0;
      const attackPoints = Number(safeProfile.attackPoints) || 0;
      const defendPoints = Number(safeProfile.defendPoints) || 0;
      const checkins = Array.isArray(safeProfile.checkins) ? safeProfile.checkins.length : 0;
      return {
        username,
        points,
        attackPoints,
        defendPoints,
        checkins,
      };
    });
  } catch (error) {
    console.warn('Failed to load player leaderboard', error);
    return [];
  }
}

function loadDistrictData() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    let keyUsed = DISTRICT_STORAGE_KEY;
    let stored = window.localStorage.getItem(DISTRICT_STORAGE_KEY);
    if (!stored) {
      for (const legacyKey of LEGACY_DISTRICT_STORAGE_KEYS) {
        const legacyValue = window.localStorage.getItem(legacyKey);
        if (legacyValue) {
          stored = legacyValue;
          keyUsed = legacyKey;
          break;
        }
      }
    }
    if (!stored) {
      return [];
    }
    if (keyUsed !== DISTRICT_STORAGE_KEY) {
      try {
        window.localStorage.setItem(DISTRICT_STORAGE_KEY, stored);
        window.localStorage.removeItem(keyUsed);
      } catch (migrationError) {
        // ignore write failures; legacy data is already loaded in-memory
      }
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return [];
    }
    return Object.entries(parsed)
      .map(([id, entry]) => {
        if (!id) {
          return null;
        }
        if (typeof entry === 'number') {
          const adjustment = Number(entry) || 0;
          const defended = adjustment > 0 ? adjustment : 0;
          const attacked = adjustment < 0 ? Math.abs(adjustment) : 0;
          return {
            id,
            name: null,
            strength: DISTRICT_BASE_SCORE + adjustment,
            defended,
            attacked,
            checkins: defended + attacked,
          };
        }
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const adjustment = Number(entry.adjustment) || 0;
        const defended = Number(entry.defended) || (adjustment > 0 ? adjustment : 0);
        const attacked = Number(entry.attacked) || (adjustment < 0 ? Math.abs(adjustment) : 0);
        const strengthValue = Number(entry.strength);
        const checkins = Number(entry.checkins) || defended + attacked;
        return {
          id,
          name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : null,
          strength: Number.isFinite(strengthValue)
            ? strengthValue
            : DISTRICT_BASE_SCORE + adjustment,
          defended,
          attacked,
          checkins,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn('Failed to load district leaderboard', error);
    return [];
  }
}

function formatRatio(attack, defend) {
  const attackValue = Number(attack) || 0;
  const defendValue = Number(defend) || 0;
  if (attackValue === 0 && defendValue === 0) {
    return '—';
  }
  if (defendValue === 0) {
    return '∞';
  }
  const ratio = attackValue / defendValue;
  const precision = ratio >= 10 ? 1 : 2;
  return decimalFormatter.format(Number(ratio.toFixed(precision)));
}

function setEmptyState(hasRows, tableElement, emptyElement) {
  if (!tableElement || !emptyElement) {
    return;
  }
  if (hasRows) {
    tableElement.classList.remove('hidden');
    emptyElement.classList.add('hidden');
  } else {
    tableElement.classList.add('hidden');
    emptyElement.classList.remove('hidden');
  }
}

function shouldUseAccordionLayout() {
  if (DESKTOP_ACCORDION_ENABLED) {
    return true;
  }
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia(MOBILE_ACCORDION_QUERY).matches;
}

function applyAccordionBehavior(table) {
  if (!table) {
    return;
  }
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const enableAccordion = shouldUseAccordionLayout();
  rows.forEach((row) => {
    // Clear previous listeners
    if (row.__accordionHandler) {
      row.removeEventListener('click', row.__accordionHandler);
    }
    row.classList.remove('collapsed', 'expanded', 'collapsible-row');
    row.style.maxHeight = '';
    if (!enableAccordion) {
      return;
    }
    row.classList.add('collapsible-row', 'collapsed');
    const handler = () => {
      const isCollapsed = row.classList.contains('collapsed');
      const startHeight = row.scrollHeight;
      if (isCollapsed) {
        row.classList.remove('collapsed');
        row.classList.add('expanded');
      } else {
        row.classList.remove('expanded');
        row.classList.add('collapsed');
      }
      const targetHeight = row.scrollHeight;
      row.style.maxHeight = `${startHeight}px`;
      requestAnimationFrame(() => {
        row.style.maxHeight = `${targetHeight}px`;
      });
    };
    row.__accordionHandler = handler;
    row.addEventListener('click', handler);
    // Set initial height with extras hidden
    row.style.maxHeight = `${row.scrollHeight}px`;
  });
}

function renderPlayerLeaderboard(players) {
  leaderboardState.lastPlayers = Array.isArray(players) ? players.slice() : [];
  const tbody = document.getElementById('player-leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  const empty = document.getElementById('player-leaderboard-empty');
  if (!tbody || !table || !empty) {
    return;
  }

  const ranked = (players || [])
    .filter((entry) => entry && entry.username)
    .map((entry) => ({
      username: entry.username,
      displayName: typeof entry.display_name === 'string' ? entry.display_name : entry.displayName,
      points: Number(entry.score ?? entry.points) || 0,
      attackPoints: Number(entry.attack_points ?? entry.attackPoints) || 0,
      defendPoints: Number(entry.defend_points ?? entry.defendPoints) || 0,
      checkins: Number(entry.checkins) || 0,
      rank: Number(entry.rank),
    }))
    .sort((a, b) => {
      const primary = b.points - a.points;
      if (primary !== 0) {
        return leaderboardState.players.order === 'asc' ? -primary : primary;
      }
      const attackDiff = b.attackPoints - a.attackPoints;
      if (attackDiff !== 0) {
        return leaderboardState.players.order === 'asc' ? -attackDiff : attackDiff;
      }
      const defendDiff = b.defendPoints - a.defendPoints;
      if (defendDiff !== 0) {
        return leaderboardState.players.order === 'asc' ? -defendDiff : defendDiff;
      }
      const nameCompare = a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
      return leaderboardState.players.order === 'asc' ? -nameCompare : nameCompare;
    });

  const isCompact = isCompactLeaderboardView();
  const limit = leaderboardState.players.showAll || !isCompact ? LEADERBOARD_MAX_LIMIT : LEADERBOARD_COMPACT_LIMIT;
  const visible = ranked.slice(0, limit);

  tbody.innerHTML = '';

  const appendCell = (row, { text = '', html = null, className = '', label = '', extra = false }) => {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
    }
    if (extra) {
      cell.classList.add('leaderboard-extra');
    }
    if (label) {
      cell.dataset.label = label;
    }
    if (html !== null) {
      cell.innerHTML = html;
    } else {
      cell.textContent = text;
    }
    row.appendChild(cell);
    return cell;
  };

  visible.forEach((player, index) => {
    const row = document.createElement('tr');
    const usernameKey = player.username ? player.username.toLowerCase() : '';
    if (usernameKey) {
      row.dataset.username = usernameKey;
      row.id = `leaderboard-player-${usernameKey}`;
    }

    const rankValue =
      Number.isFinite(player.rank) && player.rank > 0 ? player.rank : index + 1;
    appendCell(row, { text: String(rankValue), label: '#' });

    const nameWrapper = document.createElement('span');
    nameWrapper.className = 'leaderboard-player-name';
    const nameButton = document.createElement('button');
    nameButton.type = 'button';
    nameButton.className = 'leaderboard-link';
    nameButton.dataset.username = player.username;
    const displayLabel = document.createElement('span');
    displayLabel.className = 'leaderboard-player-label';
    const safeDisplay = typeof player.displayName === 'string' ? player.displayName.trim() : '';
    displayLabel.textContent = safeDisplay || player.username;
    nameButton.appendChild(displayLabel);
    const shouldShowHandle =
      safeDisplay && safeDisplay.toLowerCase() !== player.username.toLowerCase();
    if (shouldShowHandle) {
      const usernameLabel = document.createElement('span');
      usernameLabel.className = 'leaderboard-player-handle';
      usernameLabel.textContent = `@${player.username}`;
      nameButton.appendChild(usernameLabel);
    }
    nameWrapper.appendChild(nameButton);
    const nameCell = appendCell(row, { label: 'Player' });
    nameCell.appendChild(nameWrapper);

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.points),
      label: 'Points',
      extra: true,
    });
    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.attackPoints),
      label: 'Attack',
      extra: true,
    });
    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.defendPoints),
      label: 'Defend',
      extra: true,
    });
    appendCell(row, {
      className: 'numeric',
      text: formatRatio(player.attackPoints, player.defendPoints),
      label: 'A : D Ratio',
      extra: true,
    });

    tbody.appendChild(row);
  });

  setEmptyState(visible.length > 0, table, empty);
  applyAccordionBehavior(table);
}

function renderDistrictLeaderboard(districts) {
  leaderboardState.lastDistricts = Array.isArray(districts) ? districts.slice() : [];
  const tbody = document.getElementById('district-leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  const empty = document.getElementById('district-leaderboard-empty');
  if (!tbody || !table || !empty) {
    return;
  }

  const ranked = (districts || [])
    .map((district) => {
      const strength = Number.isFinite(district.strength)
        ? Number(district.strength)
        : (Number.isFinite(district.score) ? Number(district.score) : DISTRICT_BASE_SCORE);
      const defended = Number(district.defended) || 0;
      const attacked = Number(district.attacked) || 0;
      const checkins = Number.isFinite(district.checkins)
        ? Number(district.checkins)
        : defended + attacked;
      return {
        id: district.id,
        name: district.name || (district.id ? `District ${district.id}` : 'Unknown district'),
        strength,
        defended,
        attacked,
        checkins,
        rank: Number(district.rank),
      };
    })
    .sort((a, b) => {
      const primary = b.strength - a.strength;
      if (primary !== 0) {
        return leaderboardState.districts.order === 'asc' ? -primary : primary;
      }
      const defendedDiff = b.defended - a.defended;
      if (defendedDiff !== 0) {
        return leaderboardState.districts.order === 'asc' ? -defendedDiff : defendedDiff;
      }
      const nameCompare = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return leaderboardState.districts.order === 'asc' ? -nameCompare : nameCompare;
    });

  const isCompact = isCompactLeaderboardView();
  const limit =
    leaderboardState.districts.showAll || !isCompact ? LEADERBOARD_MAX_LIMIT : LEADERBOARD_COMPACT_LIMIT;
  const visible = ranked.slice(0, limit);

  tbody.innerHTML = '';

  const appendCell = (row, { text = '', className = '', label = '', extra = false }) => {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
    }
    if (extra) {
      cell.classList.add('leaderboard-extra');
    }
    if (label) {
      cell.dataset.label = label;
    }
    cell.textContent = text;
    row.appendChild(cell);
    return cell;
  };

  visible.forEach((district, index) => {
    const row = document.createElement('tr');

    const rankValue =
      Number.isFinite(district.rank) && district.rank > 0 ? district.rank : index + 1;
    appendCell(row, { text: String(rankValue), label: '#' });

    appendCell(row, { text: district.name, label: 'District' });

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(district.strength),
      label: 'Strength',
      extra: true,
    });

    const defendedValue = district.defended > 0 ? changeFormatter.format(district.defended) : '0';
    const defendedCell = appendCell(row, {
      className: 'numeric',
      text: defendedValue,
      label: 'Defended',
      extra: true,
    });
    if (district.defended > 0) {
      defendedCell.classList.add('positive');
    }

    const attackedValue = district.attacked > 0 ? changeFormatter.format(-district.attacked) : '0';
    const attackedCell = appendCell(row, {
      className: 'numeric',
      text: attackedValue,
      label: 'Attacked',
      extra: true,
    });
    if (district.attacked > 0) {
      attackedCell.classList.add('negative');
    }

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(district.checkins),
      label: 'Check-ins',
      extra: true,
    });

    tbody.appendChild(row);
  });

  setEmptyState(visible.length > 0, table, empty);
  applyAccordionBehavior(table);
}

function renderPartyLeaderboard(parties) {
  leaderboardState.lastParties = Array.isArray(parties) ? parties.slice() : [];
  const tbody = document.getElementById('party-leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  const empty = document.getElementById('party-leaderboard-empty');
  if (!tbody || !table || !empty) {
    return;
  }

  const ranked = (parties || [])
    .map((entry) => {
      const members = Array.isArray(entry.members) ? entry.members : [];
      const partyCode = (typeof entry.party_code === 'string' && entry.party_code.trim()) ||
        (typeof entry.partyCode === 'string' && entry.partyCode.trim()) ||
        '';
      const memberCount = Number(entry.member_count ?? entry.memberCount) || members.length;
      return {
        partyCode,
        partyName:
          (typeof entry.party_name === 'string' && entry.party_name.trim()) ||
          (typeof entry.partyName === 'string' && entry.partyName.trim()) ||
          (entry.party_code || entry.partyCode ? `Party ${entry.party_code || entry.partyCode}` : 'Party'),
        leader:
          (typeof entry.leader_display_name === 'string' && entry.leader_display_name.trim()) ||
          entry.leader ||
          '',
        leaderHandle: entry.leader || '',
        prestige: Number(entry.prestige_points ?? entry.prestigePoints) || 0,
        memberCount,
        members,
        rank: Number(entry.rank),
      };
    })
    .sort((a, b) => {
      const primary = b.prestige - a.prestige;
      if (primary !== 0) {
        return leaderboardState.parties.order === 'asc' ? -primary : primary;
      }
      const memberDiff = b.memberCount - a.memberCount;
      if (memberDiff !== 0) {
        return leaderboardState.parties.order === 'asc' ? -memberDiff : memberDiff;
      }
      const nameCompare = a.partyName.localeCompare(b.partyName, undefined, { sensitivity: 'base' });
      return leaderboardState.parties.order === 'asc' ? -nameCompare : nameCompare;
    });

  const isCompact = isCompactLeaderboardView();
  const limit =
    leaderboardState.parties.showAll || !isCompact ? LEADERBOARD_MAX_LIMIT : LEADERBOARD_COMPACT_LIMIT;
  const visible = ranked.slice(0, limit);

  tbody.innerHTML = '';

  const appendCell = (row, { text = '', className = '', label = '', extra = false }) => {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
    }
    if (extra) {
      cell.classList.add('leaderboard-extra');
    }
    if (label) {
      cell.dataset.label = label;
    }
    cell.textContent = text;
    row.appendChild(cell);
    return cell;
  };

  visible.forEach((party, index) => {
    const row = document.createElement('tr');
    const partyKey = party.partyCode ? party.partyCode.toLowerCase() : '';
    if (partyKey) {
      row.dataset.partyCode = partyKey;
      row.id = `leaderboard-party-${partyKey}`;
    }
    const rankValue =
      Number.isFinite(party.rank) && party.rank > 0 ? party.rank : index + 1;
    appendCell(row, { text: String(rankValue), label: '#' });

    const partyCell = appendCell(row, { label: 'Party' });
    const partyButton = document.createElement('button');
    partyButton.type = 'button';
    partyButton.className = 'leaderboard-link';
    if (party.partyCode) {
      partyButton.dataset.partyCode = party.partyCode;
    }
    partyButton.textContent = party.partyName;
    partyCell.appendChild(partyButton);

    const leaderLabel = party.leaderHandle && party.leader && party.leader !== party.leaderHandle
      ? `${party.leader} (@${party.leaderHandle})`
      : (party.leader || (party.leaderHandle ? `@${party.leaderHandle}` : ''));
    appendCell(row, { text: leaderLabel || '—', label: 'Leader' });

    const memberNames = party.members
      .map((member) => {
        const display = typeof member.display_name === 'string' ? member.display_name.trim() : '';
        const username = typeof member.username === 'string' ? member.username.trim() : '';
        return display || username;
      })
      .filter(Boolean);
    const maxNames = 4;
    let memberText = integerFormatter.format(party.memberCount);
    if (memberNames.length) {
      const preview = memberNames.slice(0, maxNames).join(', ');
      const remaining = memberNames.length - maxNames;
      memberText += ` (${preview}${remaining > 0 ? `, +${remaining} more` : ''})`;
    }
    appendCell(row, { text: memberText, label: 'Members', extra: true });

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(party.prestige),
      label: 'Prestige',
      extra: true,
    });

    tbody.appendChild(row);
  });

  setEmptyState(visible.length > 0, table, empty);
  applyAccordionBehavior(table);
}

function renderFriendProfileDrawer(profile, meta = '') {
  if (!friendProfileBody) return;
  friendProfileBody.innerHTML = '';
  const summary = document.createElement('div');
  summary.className = 'character-summary friend-profile-summary public-profile-grid';

  const identityCard = document.createElement('div');
  identityCard.className = 'character-card character-identity friend-profile-identity-card';
  const avatar = document.createElement('div');
  avatar.className = 'character-avatar';
  avatar.textContent = (profile.username || 'P').charAt(0).toUpperCase();
  if (profile.mapMarkerColor) {
    identityCard.style.setProperty('--player-marker-color', profile.mapMarkerColor);
  }
  const metaBlock = document.createElement('div');
  metaBlock.className = 'character-meta';
  const nameEl = document.createElement('h3');
  nameEl.className = 'public-identity-name';
  nameEl.textContent = profile.displayName || `@${profile.username}`;
  const tagline = document.createElement('p');
  tagline.className = 'character-tagline';
  tagline.textContent = profile.username ? `@${profile.username}` : '';
  const bio = document.createElement('p');
  bio.className = 'character-tagline public-bio-preview';
  bio.textContent = profile.profileBio || meta || 'Tap to view message';
  metaBlock.appendChild(nameEl);
  if (tagline.textContent) metaBlock.appendChild(tagline);
  metaBlock.appendChild(bio);
  identityCard.appendChild(avatar);
  identityCard.appendChild(metaBlock);
  summary.appendChild(identityCard);

  const infoCard = document.createElement('div');
  infoCard.className = 'character-card friend-profile-streak';
  const infoTitle = document.createElement('h3');
  infoTitle.textContent = 'Profile';
  infoCard.appendChild(infoTitle);
  const infoList = document.createElement('ul');
  infoList.className = 'friend-profile-stats';
  const addRow = (label, value) => {
    const li = document.createElement('li');
    const labelEl = document.createElement('span');
    labelEl.className = 'friend-profile-stat-label';
    labelEl.textContent = label;
    const valueEl = document.createElement('span');
    valueEl.className = 'friend-profile-stat-value';
    valueEl.textContent = value || '—';
    li.appendChild(labelEl);
    li.appendChild(valueEl);
    infoList.appendChild(li);
  };
  addRow('Score', Number.isFinite(profile.score) ? profile.score.toLocaleString() : '—');
  addRow('Home district', profile.homeDistrictName || profile.homeDistrict || 'Not set');
  addRow('Party', profile.activePartyName || profile.activeParty || 'None');
  infoCard.appendChild(infoList);
  summary.appendChild(infoCard);

  friendProfileBody.appendChild(summary);
}

function renderPartyProfileDrawer(profile) {
  if (!partyProfileBody) return;
  partyProfileBody.innerHTML = '';
  if (!profile || !profile.party) {
    partyProfileBody.innerHTML = '<p class="friend-profile-empty">Unable to load this party.</p>';
    return;
  }
  const party = profile.party;
  const summary = document.createElement('div');
  summary.className = 'character-summary friend-profile-summary';

  const identityCard = document.createElement('div');
  identityCard.className = 'character-card friend-profile-party';
  const labelRow = document.createElement('div');
  labelRow.className = 'streak-label-row';
  const chip = document.createElement('span');
  chip.className = 'streak-chip';
  chip.textContent = party.name || (party.code ? `Party ${party.code}` : 'Party');
  const leader = document.createElement('span');
  leader.className = 'streak-days';
  leader.textContent = party.leader ? `Leader @${party.leader}` : 'Leader unknown';
  labelRow.appendChild(chip);
  labelRow.appendChild(leader);
  const prestige = document.createElement('div');
  prestige.className = 'streak-value';
  prestige.textContent = `+${Number(party.prestige_total || 0).toLocaleString()} pts`;
  const hint = document.createElement('p');
  hint.className = 'streak-hint';
  hint.textContent = `Members joined: ${Number(party.lifetime_member_count || party.member_count || 0).toLocaleString()}`;
  identityCard.appendChild(labelRow);
  identityCard.appendChild(prestige);
  identityCard.appendChild(hint);
  summary.appendChild(identityCard);

  if (Array.isArray(profile.active_members) && profile.active_members.length) {
    const membersCard = document.createElement('div');
    membersCard.className = 'character-card party-profile-card';
    const title = document.createElement('h3');
    title.textContent = 'Members';
    membersCard.appendChild(title);
    const list = document.createElement('ul');
    list.className = 'party-top-contributors-list';
    profile.active_members.forEach((member) => {
      if (!member || !member.username) return;
      const li = document.createElement('li');
      li.textContent = member.display_name || member.username;
      list.appendChild(li);
    });
    membersCard.appendChild(list);
    summary.appendChild(membersCard);
  }

  partyProfileBody.appendChild(summary);
}

async function openLeaderboardProfile(username, displayName = '', trigger = null) {
  const cleanUsername = typeof username === 'string' ? username.replace(/^@/, '').trim() : '';
  if (!cleanUsername || !friendProfileDrawer || !friendProfileOverlay) {
    return;
  }
  closeFriendProfileDrawer.lastTrigger = trigger instanceof HTMLElement ? trigger : null;
  friendProfileBody.innerHTML = '<p class="friend-profile-empty">Loading profile…</p>';
  document.body.classList.add('friend-profile-open');
  friendProfileDrawer.setAttribute('aria-hidden', 'false');
  friendProfileOverlay.classList.remove('hidden');
  friendProfileOverlay.setAttribute('aria-hidden', 'false');
  if (friendProfileTitle) {
    friendProfileTitle.textContent = displayName || `@${cleanUsername}`;
  }
  if (friendProfileContent && typeof friendProfileContent.focus === 'function') {
    window.setTimeout(() => friendProfileContent.focus(), 0);
  }
  try {
    const data = await fetchJson(`players/${encodeURIComponent(cleanUsername)}/public-profile/`);
    const profile = sanitizePublicProfile(data);
    if (!profile) {
      throw new Error('Invalid profile payload');
    }
    renderFriendProfileDrawer(profile, displayName);
  } catch (error) {
    friendProfileBody.innerHTML =
      '<p class="friend-profile-empty">Unable to load this profile right now.</p>';
    console.warn('Failed to open profile from leaderboard', error);
  }
}

async function openLeaderboardPartyProfile(partyCode, trigger = null) {
  const cleanCode = typeof partyCode === 'string' ? partyCode.trim() : '';
  if (!cleanCode || !partyProfileDrawer || !partyProfileOverlay) {
    return;
  }
  closePartyProfileDrawer.lastTrigger = trigger instanceof HTMLElement ? trigger : null;
  partyProfileBody.innerHTML = '<p class="friend-profile-empty">Loading party…</p>';
  document.body.classList.add('party-profile-open');
  partyProfileDrawer.setAttribute('aria-hidden', 'false');
  partyProfileOverlay.classList.remove('hidden');
  partyProfileOverlay.setAttribute('aria-hidden', 'false');
  if (partyProfileTitle) {
    partyProfileTitle.textContent = 'Party Profile';
  }
  if (partyProfileContent && typeof partyProfileContent.focus === 'function') {
    window.setTimeout(() => partyProfileContent.focus(), 0);
  }
  try {
    const data = await fetchJson(`party/${encodeURIComponent(cleanCode)}/profile/`);
    const profile = sanitizePartyProfile(data) || data;
    renderPartyProfileDrawer(profile);
  } catch (error) {
    partyProfileBody.innerHTML =
      '<p class="friend-profile-empty">Unable to load this party right now.</p>';
    console.warn('Failed to open party from leaderboard', error);
  }
}

async function fetchLeaderboardData() {
  const response = await fetch(LEADERBOARD_API_URL, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Leaderboard request failed (${response.status})`);
  }
  return response.json();
}

function renderFallbackLeaderboards() {
  renderPlayerLeaderboard(loadPlayerData());
  const fallbackDistricts = loadDistrictData().map((entry) => ({
    id: entry.id,
    name: entry.name || `District ${entry.id}`,
    strength: Number(entry.strength) || DISTRICT_BASE_SCORE,
    score: Number(entry.strength) || DISTRICT_BASE_SCORE,
    defended: Number(entry.defended) || 0,
    attacked: Number(entry.attacked) || 0,
    checkins: Number(entry.checkins) || (Number(entry.defended) || 0) + (Number(entry.attacked) || 0),
  }));
  renderDistrictLeaderboard(fallbackDistricts);
  renderPartyLeaderboard([]);
}

function scheduleLeaderboardRefresh() {
  if (scheduledLeaderboardRefresh) {
    window.clearTimeout(scheduledLeaderboardRefresh);
  }
  scheduledLeaderboardRefresh = window.setTimeout(() => {
    scheduledLeaderboardRefresh = 0;
    refreshLeaderboardsFromApi();
  }, LEADERBOARD_REFRESH_DEBOUNCE_MS);
}

async function refreshLeaderboardsFromApi() {
  try {
    const data = await fetchLeaderboardData();
    renderPlayerLeaderboard(data.players || []);
    renderDistrictLeaderboard(data.districts || []);
    renderPartyLeaderboard(data.parties || []);
  } catch (error) {
    console.warn('Unable to load leaderboard from API', error);
    const playerEmpty = document.getElementById('player-leaderboard-empty');
    const districtEmpty = document.getElementById('district-leaderboard-empty');
    const partyEmpty = document.getElementById('party-leaderboard-empty');
    if (playerEmpty) {
      playerEmpty.textContent = 'Unable to load leaderboard data from the server right now.';
      playerEmpty.classList.remove('hidden');
    }
    if (districtEmpty) {
      districtEmpty.textContent = 'Unable to load leaderboard data from the server right now.';
      districtEmpty.classList.remove('hidden');
    }
    if (partyEmpty) {
      partyEmpty.textContent = 'Unable to load leaderboard data from the server right now.';
      partyEmpty.classList.remove('hidden');
    }
    renderPlayerLeaderboard([]);
    renderDistrictLeaderboard([]);
    renderPartyLeaderboard([]);
  }
}

function initialiseLeaderboardPage() {
  const startWithApi = () => refreshLeaderboardsFromApi();

  if (bootstrapLeaderboard) {
    applyLeaderboardBootstrap(bootstrapLeaderboard);
    scheduleLeaderboardRefresh();
    return;
  }

  if (window.__PCWL_CONFIG_READY__ && typeof window.__PCWL_CONFIG_READY__.then === 'function') {
    window.__PCWL_CONFIG_READY__
      .then((config) => {
        if (config && typeof config === 'object' && config.leaderboard) {
          applyLeaderboardBootstrap(config.leaderboard);
          scheduleLeaderboardRefresh();
          return;
        }
        startWithApi();
      })
      .catch(startWithApi);
    return;
  }

  startWithApi();
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event && (event.key === PLAYER_STORAGE_KEY || event.key === DISTRICT_STORAGE_KEY)) {
      scheduleLeaderboardRefresh();
    }
  });
}

if (playerShowToggle) {
  playerShowToggle.addEventListener('click', () => {
    leaderboardState.players.showAll = !leaderboardState.players.showAll;
    refreshToggleLabels();
    renderPlayerLeaderboard(leaderboardState.lastPlayers);
  });
}

if (districtShowToggle) {
  districtShowToggle.addEventListener('click', () => {
    leaderboardState.districts.showAll = !leaderboardState.districts.showAll;
    refreshToggleLabels();
    renderDistrictLeaderboard(leaderboardState.lastDistricts);
  });
}

if (partyShowToggle) {
  partyShowToggle.addEventListener('click', () => {
    leaderboardState.parties.showAll = !leaderboardState.parties.showAll;
    refreshToggleLabels();
    renderPartyLeaderboard(leaderboardState.lastParties);
  });
}

if (playerSortToggle) {
  playerSortToggle.addEventListener('click', () => {
    leaderboardState.players.order = leaderboardState.players.order === 'asc' ? 'desc' : 'asc';
    refreshToggleLabels();
    renderPlayerLeaderboard(leaderboardState.lastPlayers);
  });
}

if (districtSortToggle) {
  districtSortToggle.addEventListener('click', () => {
    leaderboardState.districts.order = leaderboardState.districts.order === 'asc' ? 'desc' : 'asc';
    refreshToggleLabels();
    renderDistrictLeaderboard(leaderboardState.lastDistricts);
  });
}

if (partySortToggle) {
  partySortToggle.addEventListener('click', () => {
    leaderboardState.parties.order = leaderboardState.parties.order === 'asc' ? 'desc' : 'asc';
    refreshToggleLabels();
    renderPartyLeaderboard(leaderboardState.lastParties);
  });
}

if (playerSearchForm) {
  playerSearchForm.addEventListener('submit', handlePlayerSearch);
}

if (partySearchForm) {
  partySearchForm.addEventListener('submit', handlePartySearch);
}

if (friendProfileOverlay) {
  friendProfileOverlay.addEventListener('click', () => closeFriendProfileDrawer({ restoreFocus: true }));
}
if (friendProfileClose) {
  friendProfileClose.addEventListener('click', () => closeFriendProfileDrawer({ restoreFocus: true }));
}
if (partyProfileOverlay) {
  partyProfileOverlay.addEventListener('click', () => closePartyProfileDrawer({ restoreFocus: true }));
}
if (partyProfileClose) {
  partyProfileClose.addEventListener('click', () => closePartyProfileDrawer({ restoreFocus: true }));
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;
  const userButton = target.closest('[data-username]');
  if (userButton && userButton.dataset.username) {
    event.preventDefault();
    openLeaderboardProfile(userButton.dataset.username, userButton.textContent || '', userButton);
    return;
  }
  const partyButton = target.closest('[data-party-code]');
  if (partyButton && partyButton.dataset.partyCode) {
    event.preventDefault();
    openLeaderboardPartyProfile(partyButton.dataset.partyCode, partyButton);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeFriendProfileDrawer({ restoreFocus: false });
    closePartyProfileDrawer({ restoreFocus: false });
  }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;
  if (target.dataset && target.dataset.username) {
    event.preventDefault();
    openLeaderboardProfile(target.dataset.username, target.textContent || '', target);
  } else if (target.dataset && target.dataset.partyCode) {
    event.preventDefault();
    openLeaderboardPartyProfile(target.dataset.partyCode, target);
  }
});

async function handlePlayerSearch(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  const term = playerSearchInput && typeof playerSearchInput.value === 'string' ? playerSearchInput.value.trim() : '';
  const cleaned = term.replace(/^@/, '').trim();
  if (!cleaned) {
    setLeaderboardSearchStatus('Enter a player handle or display name.');
    return;
  }
  if (!leaderboardState.lastPlayers.length) {
    await refreshLeaderboardsFromApi().catch(() => null);
  }
  leaderboardState.players.showAll = true;
  refreshToggleLabels();
  renderPlayerLeaderboard(leaderboardState.lastPlayers);
  const key = cleaned.toLowerCase();
  const match =
    (leaderboardState.lastPlayers || []).find(
      (entry) =>
        entry &&
        ((entry.username && entry.username.toLowerCase() === key) ||
          (entry.display_name && entry.display_name.toLowerCase().includes(key)) ||
          (entry.displayName && entry.displayName.toLowerCase().includes(key))),
    ) || null;
  if (!match || !match.username) {
    setLeaderboardSearchStatus(`No player found for "${term}".`);
    return;
  }
  const targetKey = match.username.toLowerCase();
  const row = document.querySelector(`#player-leaderboard-body tr[data-username="${targetKey}"]`);
  if (!row) {
    setLeaderboardSearchStatus(`No player found for "${term}".`);
    return;
  }
  focusLeaderboardRow(row);
  const trigger = row.querySelector('[data-username]');
  if (trigger instanceof HTMLElement) {
    trigger.click();
  }
  setLeaderboardSearchStatus(`Opening ${match.display_name || `@${match.username}`}…`);
}

async function handlePartySearch(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  const term = partySearchInput && typeof partySearchInput.value === 'string' ? partySearchInput.value.trim() : '';
  if (!term) {
    setLeaderboardSearchStatus('Enter a party code or name.');
    return;
  }
  if (!leaderboardState.lastParties.length) {
    await refreshLeaderboardsFromApi().catch(() => null);
  }
  leaderboardState.parties.showAll = true;
  refreshToggleLabels();
  renderPartyLeaderboard(leaderboardState.lastParties);
  const key = term.toLowerCase();
  const match =
    (leaderboardState.lastParties || []).find((entry) => {
      const code =
        (entry.party_code && String(entry.party_code).toLowerCase()) ||
        (entry.partyCode && String(entry.partyCode).toLowerCase()) ||
        '';
      const name =
        (entry.party_name && String(entry.party_name).toLowerCase()) ||
        (entry.partyName && String(entry.partyName).toLowerCase()) ||
        '';
      return (code && code === key) || (name && name.includes(key));
    }) || null;
  const resolvedCode =
    (match &&
      ((match.party_code && String(match.party_code)) ||
        (match.partyCode && String(match.partyCode)) ||
        '')) ||
    '';
  if (!match || !resolvedCode) {
    setLeaderboardSearchStatus(`No party found for "${term}".`);
    return;
  }
  const targetKey = resolvedCode.toLowerCase();
  const row = document.querySelector(`#party-leaderboard-body tr[data-party-code="${targetKey}"]`);
  if (!row) {
    setLeaderboardSearchStatus(`No party found for "${term}".`);
    return;
  }
  focusLeaderboardRow(row);
  const trigger = row.querySelector('[data-party-code]');
  if (trigger instanceof HTMLElement) {
    trigger.click();
  }
  setLeaderboardSearchStatus(`Opening party ${resolvedCode}…`);
}

refreshToggleLabels();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseLeaderboardPage);
} else {
  initialiseLeaderboardPage();
}
