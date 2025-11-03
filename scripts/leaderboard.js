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
      points: Number(entry.score ?? entry.points) || 0,
      attackPoints: Number(entry.attack_points ?? entry.attackPoints) || 0,
      defendPoints: Number(entry.defend_points ?? entry.defendPoints) || 0,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.attackPoints !== a.attackPoints) {
        return b.attackPoints - a.attackPoints;
      }
      if (b.defendPoints !== a.defendPoints) {
        return b.defendPoints - a.defendPoints;
      }
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    })
    .slice(0, 50);

  tbody.innerHTML = '';

  ranked.forEach((player, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    const rankValue = Number.isFinite(Number(district.rank))
      ? Number(district.rank)
      : index + 1;
    rankCell.textContent = String(rankValue);
    row.appendChild(rankCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = player.username;
    row.appendChild(nameCell);

    const pointsCell = document.createElement('td');
    pointsCell.className = 'numeric';
    pointsCell.textContent = integerFormatter.format(player.points);
    row.appendChild(pointsCell);

    const attackCell = document.createElement('td');
    attackCell.className = 'numeric';
    attackCell.textContent = integerFormatter.format(player.attackPoints);
    row.appendChild(attackCell);

    const defendCell = document.createElement('td');
    defendCell.className = 'numeric';
    defendCell.textContent = integerFormatter.format(player.defendPoints);
    row.appendChild(defendCell);

    const ratioCell = document.createElement('td');
    ratioCell.className = 'numeric';
    ratioCell.textContent = formatRatio(player.attackPoints, player.defendPoints);
    row.appendChild(ratioCell);

    tbody.appendChild(row);
  });

  setEmptyState(ranked.length > 0, table, empty);
}

function renderDistrictLeaderboard(districts) {
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
      };
    })
    .sort((a, b) => {
      if (b.strength !== a.strength) {
        return b.strength - a.strength;
      }
      if (b.defended !== a.defended) {
        return b.defended - a.defended;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    })
    .slice(0, 50);

  tbody.innerHTML = '';

  ranked.forEach((district, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);
    row.appendChild(rankCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = district.name;
    row.appendChild(nameCell);

    const strengthCell = document.createElement('td');
    strengthCell.className = 'numeric';
    strengthCell.textContent = integerFormatter.format(district.strength);
    row.appendChild(strengthCell);

    const defendedCell = document.createElement('td');
    defendedCell.className = 'numeric';
    if (district.defended > 0) {
      defendedCell.classList.add('positive');
      defendedCell.textContent = changeFormatter.format(district.defended);
    } else {
      defendedCell.textContent = '0';
    }
    row.appendChild(defendedCell);

    const attackedCell = document.createElement('td');
    attackedCell.className = 'numeric';
    if (district.attacked > 0) {
      attackedCell.classList.add('negative');
      attackedCell.textContent = changeFormatter.format(-district.attacked);
    } else {
      attackedCell.textContent = '0';
    }
    row.appendChild(attackedCell);

    const checkinsCell = document.createElement('td');
    checkinsCell.className = 'numeric';
    checkinsCell.textContent = integerFormatter.format(district.checkins);
    row.appendChild(checkinsCell);

    tbody.appendChild(row);
  });

  setEmptyState(ranked.length > 0, table, empty);
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

async function initialiseLeaderboardPage() {
  try {
    const data = await fetchLeaderboardData();
    renderPlayerLeaderboard(data.players || []);
    renderDistrictLeaderboard(data.districts || []);
  } catch (error) {
    console.warn('Falling back to local leaderboard data', error);
    renderFallbackLeaderboards();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseLeaderboardPage);
} else {
  initialiseLeaderboardPage();
}
