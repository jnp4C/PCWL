'use strict';

const PLAYER_STORAGE_KEY = 'pragueExplorerPlayers';
const DISTRICT_STORAGE_KEY = 'pragueExplorerDistrictScores';
const DISTRICT_BASE_SCORE = 2000;

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
    const stored = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!stored) {
      return [];
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
    const stored = window.localStorage.getItem(DISTRICT_STORAGE_KEY);
    if (!stored) {
      return [];
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
          return {
            id,
            name: null,
            adjustment,
            defended: adjustment > 0 ? adjustment : 0,
            attacked: adjustment < 0 ? Math.abs(adjustment) : 0,
          };
        }
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const adjustment = Number(entry.adjustment) || 0;
        return {
          id,
          name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : null,
          adjustment,
          defended: Number(entry.defended) || 0,
          attacked: Number(entry.attacked) || 0,
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

function renderPlayerLeaderboard() {
  const tbody = document.getElementById('player-leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  const empty = document.getElementById('player-leaderboard-empty');
  if (!tbody || !table || !empty) {
    return;
  }

  const players = loadPlayerData()
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.defendPoints !== a.defendPoints) {
        return b.defendPoints - a.defendPoints;
      }
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    })
    .slice(0, 50);

  tbody.innerHTML = '';

  players.forEach((player, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);
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

  setEmptyState(players.length > 0, table, empty);
}

function renderDistrictLeaderboard() {
  const tbody = document.getElementById('district-leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  const empty = document.getElementById('district-leaderboard-empty');
  if (!tbody || !table || !empty) {
    return;
  }

  const districts = loadDistrictData()
    .map((entry) => {
      const change = Number(entry.adjustment) || 0;
      return {
        id: entry.id,
        name: entry.name || `District ${entry.id}`,
        score: DISTRICT_BASE_SCORE + change,
        change,
        defended: Number(entry.defended) || 0,
        attacked: Number(entry.attacked) || 0,
      };
    })
    .filter((entry) => entry.defended > 0 || entry.attacked > 0 || entry.change !== 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.defended !== a.defended) {
        return b.defended - a.defended;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    })
    .slice(0, 50);

  tbody.innerHTML = '';

  districts.forEach((district, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);
    row.appendChild(rankCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = district.name;
    row.appendChild(nameCell);

    const scoreCell = document.createElement('td');
    scoreCell.className = 'numeric';
    scoreCell.textContent = integerFormatter.format(district.score);
    row.appendChild(scoreCell);

    const changeCell = document.createElement('td');
    changeCell.className = 'numeric';
    changeCell.textContent =
      district.change === 0 ? '0' : changeFormatter.format(district.change);
    if (district.change > 0) {
      changeCell.classList.add('positive');
    } else if (district.change < 0) {
      changeCell.classList.add('negative');
    }
    row.appendChild(changeCell);

    const defendedCell = document.createElement('td');
    defendedCell.className = 'numeric';
    defendedCell.textContent = integerFormatter.format(district.defended);
    row.appendChild(defendedCell);

    const attackedCell = document.createElement('td');
    attackedCell.className = 'numeric';
    if (district.attacked > 0) {
      attackedCell.classList.add('negative');
    }
    attackedCell.textContent = integerFormatter.format(district.attacked);
    row.appendChild(attackedCell);

    tbody.appendChild(row);
  });

  setEmptyState(districts.length > 0, table, empty);
}

function renderLeaderboards() {
  renderPlayerLeaderboard();
  renderDistrictLeaderboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderLeaderboards);
} else {
  renderLeaderboards();
}
