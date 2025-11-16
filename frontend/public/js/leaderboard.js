'use strict';

const PLAYER_STORAGE_KEY = 'pcwlPlayers';
const LEGACY_PLAYER_STORAGE_KEYS = ['pragueExplorerPlayers'];
const DISTRICT_STORAGE_KEY = 'pcwlDistrictScores';
const LEGACY_DISTRICT_STORAGE_KEYS = ['pragueExplorerDistrictScores'];
const DISTRICT_BASE_SCORE = 2000;
const LEADERBOARD_API_URL = '/api/leaderboard/';

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const changeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  signDisplay: 'always',
});

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
  lastPlayers: [],
  lastDistricts: [],
};

const playerSortToggle = document.getElementById('player-sort-toggle');
const playerShowToggle = document.getElementById('player-show-toggle');
const districtSortToggle = document.getElementById('district-sort-toggle');
const districtShowToggle = document.getElementById('district-show-toggle');

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
  if (playerSortToggle) {
    playerSortToggle.textContent =
      leaderboardState.players.order === 'asc' ? 'Show highest' : 'Show lowest';
  }
  if (districtSortToggle) {
    districtSortToggle.textContent =
      leaderboardState.districts.order === 'asc' ? 'Show highest' : 'Show lowest';
  }
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

  const appendCell = (row, { text = '', html = null, className = '', label = '' }) => {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
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

    const rankValue =
      Number.isFinite(player.rank) && player.rank > 0 ? player.rank : index + 1;
    appendCell(row, { text: String(rankValue), label: '#' });

    const nameWrapper = document.createElement('span');
    nameWrapper.className = 'leaderboard-player-name';

    const displayLabel = document.createElement('span');
    displayLabel.className = 'leaderboard-player-label';
    const safeDisplay = typeof player.displayName === 'string' ? player.displayName.trim() : '';
    displayLabel.textContent = safeDisplay || player.username;
    nameWrapper.appendChild(displayLabel);

    const shouldShowHandle =
      safeDisplay && safeDisplay.toLowerCase() !== player.username.toLowerCase();
    if (shouldShowHandle) {
      const usernameLabel = document.createElement('span');
      usernameLabel.className = 'leaderboard-player-handle';
      usernameLabel.textContent = `@${player.username}`;
      nameWrapper.appendChild(usernameLabel);
    }

    appendCell(row, { html: nameWrapper.outerHTML, label: 'Player' });

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.points),
      label: 'Points',
    });
    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.attackPoints),
      label: 'Attack',
    });
    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(player.defendPoints),
      label: 'Defend',
    });
    appendCell(row, {
      className: 'numeric',
      text: formatRatio(player.attackPoints, player.defendPoints),
      label: 'A : D Ratio',
    });

    tbody.appendChild(row);
  });

  setEmptyState(visible.length > 0, table, empty);
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

  const appendCell = (row, { text = '', className = '', label = '' }) => {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
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
    });

    const defendedValue = district.defended > 0 ? changeFormatter.format(district.defended) : '0';
    const defendedCell = appendCell(row, {
      className: 'numeric',
      text: defendedValue,
      label: 'Defended',
    });
    if (district.defended > 0) {
      defendedCell.classList.add('positive');
    }

    const attackedValue = district.attacked > 0 ? changeFormatter.format(-district.attacked) : '0';
    const attackedCell = appendCell(row, {
      className: 'numeric',
      text: attackedValue,
      label: 'Attacked',
    });
    if (district.attacked > 0) {
      attackedCell.classList.add('negative');
    }

    appendCell(row, {
      className: 'numeric',
      text: integerFormatter.format(district.checkins),
      label: 'Check-ins',
    });

    tbody.appendChild(row);
  });

  setEmptyState(visible.length > 0, table, empty);
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
  } catch (error) {
    console.warn('Falling back to local leaderboard data', error);
    renderFallbackLeaderboards();
  }
}

function initialiseLeaderboardPage() {
  refreshLeaderboardsFromApi();
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

refreshToggleLabels();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseLeaderboardPage);
} else {
  initialiseLeaderboardPage();
}
