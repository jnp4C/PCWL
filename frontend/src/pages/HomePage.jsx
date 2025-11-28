import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/sessionSlice';
import { fetchFriends } from '../store/friendsSlice';
import { fetchFriendRequests } from '../store/friendRequestsSlice';
import { playersThunks } from '../store/playersSlice';
import { fetchParty } from '../store/partySlice';
import { fetchDistrictCatalog } from '../store/districtsSlice';

function useVersionText(config) {
  return useMemo(() => {
    if (config?.app?.git_tag) return config.app.git_tag;
    if (config?.app?.version) return config.app.version;
    if (config?.app?.snapshot) return config.app.snapshot;
    return 'dev';
  }, [config]);
}

function WelcomePanel({ staticBase, createAccountUrl, onLogin, loading, error, version }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, password, remember });
  };

  return (
    <section id="welcome-screen" className="panel">
      <div id="app-version-badge" className="app-version-badge" aria-hidden="true">
        {version}
      </div>
      <img
        src={`${staticBase}data/Prague_Civil_War_Live.png`}
        alt="Prague Explorer logo"
        className="welcome-logo"
      />
      <form id="login-form" className="login-form" autoComplete="off" onSubmit={handleSubmit}>
        <label htmlFor="username-input">Username</label>
        <div className="login-row">
          <input
            type="text"
            id="username-input"
            name="username"
            placeholder="e.g. PragueWalker"
            maxLength="32"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <label htmlFor="password-input">Password</label>
        <div className="login-row">
          <input
            type="password"
            id="password-input"
            name="password"
            placeholder="At least 4 characters"
            minLength="4"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" id="login-button" className="primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Enter Prague'}
          </button>
        </div>
        <div className="remember-row">
          <label className="control checkbox remember-control">
            <input
              type="checkbox"
              id="remember-password-input"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember on this device</span>
          </label>
        </div>
        <p className="account-hint">
          Don&apos;t have an account?{' '}
          <a className="account-link" href={createAccountUrl}>
            Create one here
          </a>
        </p>
        <div className="login-row login-help">
          <button type="button" id="howto-open" className="secondary">
            How to
          </button>
        </div>
        {error && (
          <div className="form-message danger" role="alert">
            {error.message || 'Unable to sign in.'}
          </div>
        )}
      </form>
      <div id="known-players" className="known-players hidden">
        <h2>Jump back in</h2>
        <div id="known-players-list" />
      </div>
    </section>
  );
}

function GamePanel({ player, onLogout }) {
  return (
    <section id="game-screen" className="panel">
      <header className="top-bar">
        <div className="nav-group"></div>
        <div className="top-actions" aria-label="Quick actions">
          <div className="recent-tags" aria-live="polite">
            <span className="recent-tag" id="recent-checkin-1">
              No check-ins yet
            </span>
            <div className="user-shortcuts" role="group" aria-label="Player shortcuts">
              <button type="button" className="user-shortcut user-shortcut-primary" id="current-user-tag" aria-expanded="false">
                {player?.username || 'Guest'}
              </button>
              <button type="button" className="user-shortcut" id="friends-button">
                Friends
              </button>
              <button type="button" className="user-shortcut" id="district-button">
                District
              </button>
            </div>
          </div>
          <div id="cooldown-strip" className="cooldown-strip hidden" aria-live="polite"></div>
        </div>
        <div className="player-box">
          <div className="player-heading">
            <div className="player-identity">
              <h2 id="player-username">{player?.username || 'Username'}</h2>
              <button id="set-home-district-button" className="secondary small">
                Set Home
              </button>
            </div>
            <div className="player-actions">
              <button id="charge-attack-button" className="secondary small">
                Charge Attack
              </button>
              <button id="find-me-button" className="secondary small">
                Find Me
              </button>
              <button id="check-in-button" className="primary small">
                Check In
              </button>
            </div>
          </div>
          <div className="home-district-row">
            <span className="home-district-label">Home District:</span>
            <span id="home-district-value" className="home-district-value">
              {player?.home_district_name || 'Unset'}
            </span>
            <span id="home-presence-indicator" className="home-presence neutral">
              Unknown location
            </span>
          </div>
          <div id="dev-options" className="dev-options hidden">
            <label className="control checkbox">
              <input type="checkbox" id="dev-skip-cooldown" />
              <span>Skip cooldown</span>
            </label>
            <button type="button" id="dev-change-user" className="secondary small">
              Change User
            </button>
            <button type="button" id="dev-clear-users" className="secondary small danger">
              Clear Users
            </button>
          </div>
          <div className="player-stats">
            <div className="stat">
              <span className="stat-label">Points</span>
              <span className="stat-value" id="player-points">
                {player?.score ?? 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Check-ins</span>
              <span className="stat-value" id="player-checkins-count">
                {player?.checkins ?? 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">A/D Ratio</span>
              <span className="stat-value" id="player-ad-ratio">
                {player?.attack_ratio ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="layout">
        <div id="map"></div>
        <aside className="sidebar" id="mobile-drawer" aria-hidden="true">
          <header className="drawer-header mobile-only">
            <span className="drawer-title">Character &amp; Settings</span>
            <button id="drawer-close" className="icon-button" type="button" aria-label="Close panel">
              &times;
            </button>
          </header>
          <section className="drawer-block">
            <h2 className="drawer-heading">Character</h2>
            <div className="drawer-quick-actions">
              <button id="drawer-checkin-button" className="primary small" type="button">
                Check In
              </button>
              <button id="drawer-logout-button" className="secondary small" type="button" onClick={onLogout}>
                Log Out
              </button>
            </div>
          </section>
          <section className="drawer-block drawer-summary">
            <h2 className="drawer-heading">Player Info</h2>
            <div className="drawer-info">
              <div className="drawer-info-item">
                <span className="label">Player</span>
                <span className="value" id="drawer-player-username">
                  {player?.username || 'Not signed in'}
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="label">A/D Ratio</span>
                <span className="value" id="drawer-ad-ratio-summary">
                  {player?.attack_ratio ?? '—'}
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="label">Home strength</span>
                <span className="value" id="drawer-home-strength">
                  {player?.defend_points ?? '—'}
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="label">Home</span>
                <span className="value" id="drawer-home-summary">
                  {player?.home_district_name || 'Not set'}
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="label">Location</span>
                <span className="value" id="drawer-location-summary">
                  Unknown
                </span>
              </div>
            </div>
          </section>
          <section className="drawer-block">
            <h2 className="drawer-heading">Check-ins</h2>
            <div className="drawer-checkins">
              <div id="drawer-checkin-list" className="drawer-checkin-list"></div>
            </div>
          </section>
          <section className="drawer-block drawer-settings">
            <h2 className="drawer-heading">Settings</h2>
            <div className="drawer-control">
              <span className="label">Home district</span>
              <div className="control">
                <input
                  type="text"
                  id="drawer-home-select"
                  placeholder="Search district"
                  aria-label="Search home district"
                />
                <button type="button" id="drawer-home-save" className="secondary">
                  Save
                </button>
              </div>
            </div>
            <div className="drawer-control">
              <span className="label">Marker color</span>
              <select id="drawer-marker-color" defaultValue={player?.map_marker_color || '#3b82f6'}>
                <option value="#3b82f6">Sky blue</option>
                <option value="#ef4444">Cherry red</option>
                <option value="#22c55e">Neon green</option>
                <option value="#f97316">Sunset orange</option>
                <option value="#a855f7">Royal purple</option>
                <option value="#facc15">Solar yellow</option>
              </select>
            </div>
            <div className="drawer-control">
              <span className="label">Theme</span>
              <button type="button" id="drawer-theme-toggle" className="secondary">
                Toggle theme
              </button>
            </div>
            <div className="drawer-links">
              <a id="drawer-leaderboard" className="button-link" href="/leaderboard.html">
                View Leaderboards
              </a>
            </div>
          </section>
        </aside>
      </div>
      <div id="status" className="status hidden" aria-live="polite"></div>
      <div className="controls">
        <div className="control-group">
          <button id="back-button" className="secondary small" type="button">
            ← Back
          </button>
          <button id="clear-history-button" className="secondary small" type="button">
            Reset
          </button>
        </div>
        <div className="toggle-group">
          <label className="control toggle">
            <input type="checkbox" id="districts-toggle" />
            <span>Show districts</span>
          </label>
          <label className="control toggle">
            <input type="checkbox" id="parks-toggle" />
            <span>Show parks</span>
          </label>
          <label className="control toggle">
            <input type="checkbox" id="urban-toggle" />
            <span>Show urban planning</span>
          </label>
          <label className="control toggle">
            <input type="checkbox" id="cycling-toggle" />
            <span>Show cycling</span>
          </label>
        </div>
        <div className="slider-group">
          <label htmlFor="basemap-slider" className="control slider">
            Basemap
            <input type="range" id="basemap-slider" min="0" max="100" defaultValue="100" />
          </label>
        </div>
      </div>
      <section className="sidebar secondary-panel">
        <header className="sidebar-header">
          <div className="player-summary">
            <div className="player-avatar" id="player-avatar-dot"></div>
            <div className="player-summary-info">
              <h3 className="player-name" id="player-name">
                {player?.username || 'Player'}
              </h3>
              <p className="player-meta">
                Points: <span id="player-points-sidebar">{player?.score ?? 0}</span> · Check-ins:{' '}
                <span id="player-checkins">{player?.checkins ?? 0}</span>
              </p>
            </div>
          </div>
          <div className="sidebar-actions">
            <button id="drawer-toggle" className="secondary" type="button">
              Menu
            </button>
            <button id="recent-checkins-toggle" className="secondary" type="button">
              Recent Check-ins
            </button>
          </div>
        </header>
        <section className="status-card">
          <div className="status-card-heading">
            <h3>Status</h3>
            <span id="home-presence-chip" className="chip neutral">
              Checking…
            </span>
          </div>
          <div className="status-metrics">
            <div className="metric">
              <span className="metric-label">A/D Ratio</span>
              <span className="metric-value" id="status-ad-ratio">
                {player?.attack_ratio ?? '—'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Home Strength</span>
              <span className="metric-value" id="status-home-strength">
                {player?.defend_points ?? '—'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Attack Points</span>
              <span className="metric-value" id="status-attack-points">
                {player?.attack_points ?? 0}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Defend Points</span>
              <span className="metric-value" id="status-defend-points">
                {player?.defend_points ?? 0}
              </span>
            </div>
          </div>
        </section>
        <section className="panel-block">
          <header className="panel-block-header">
            <h3>Check-in history</h3>
            <div className="panel-actions">
              <button id="find-me-button-2" className="secondary small" type="button">
                Find Me
              </button>
              <button id="check-in-button-2" className="primary small" type="button">
                Check In
              </button>
            </div>
          </header>
          <div id="checkin-list" className="checkin-list"></div>
        </section>
        <section className="panel-block">
          <header className="panel-block-header">
            <h3>Points of Interest</h3>
            <div className="panel-actions">
              <button id="poi-sort" className="secondary small" type="button">
                Sort
              </button>
            </div>
          </header>
          <div id="poi-list" className="poi-list"></div>
        </section>
      </section>
      <div id="floating-controls" className="floating-controls">
        <button id="floating-checkin-button" className="primary floating" type="button">
          Check In
        </button>
        <button id="floating-gps-button" className="secondary floating" type="button">
          Find Me
        </button>
      </div>
      <div id="drawer-overlay" className="overlay hidden" role="presentation"></div>
      <div id="recent-checkins-overlay" className="overlay hidden" role="presentation"></div>
      <div id="home-district-modal-overlay" className="overlay hidden" role="presentation"></div>
      <div id="recent-checkins-drawer" className="drawer drawer-right hidden" role="dialog" aria-labelledby="recent-checkins-title">
        <div className="drawer-header">
          <h2 id="recent-checkins-title">Recent Check-ins</h2>
          <button type="button" id="recent-checkins-close" className="icon-button" aria-label="Close recent check-ins">
            &times;
          </button>
        </div>
        <div id="recent-checkins-content">
          <div id="recent-checkins-empty" className="empty-state">
            <p>No check-ins yet. Explore Prague and check in to start tracking your journey.</p>
          </div>
          <ul id="recent-checkins-list" className="recent-checkins-list"></ul>
        </div>
      </div>
      <div id="home-district-modal" className="modal hidden" role="dialog" aria-labelledby="home-district-title">
        <div className="modal-content">
          <header className="modal-header">
            <h2 id="home-district-title">Choose Home District</h2>
            <button type="button" id="home-district-modal-close" className="icon-button" aria-label="Close home district picker">
              &times;
            </button>
          </header>
          <div className="modal-body">
            <label className="control">
              <span>Search</span>
              <input type="text" id="home-district-search" placeholder="Type district name" />
            </label>
            <div id="home-district-list" className="home-district-list" role="listbox"></div>
          </div>
          <footer className="modal-footer">
            <button type="button" id="home-district-cancel" className="secondary">
              Cancel
            </button>
            <button type="button" id="home-district-confirm" className="primary">
              Confirm
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const config = useSelector((state) => state.config.data);
  const isAuthenticated = session.authenticated && !!session.player;
  const staticBase = (config?.assets?.static_url || '/').replace(/\/?$/, '/');
  const createAccountUrl = config?.links?.create_account || '/create-account.html';
  const version = useVersionText(config);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(playersThunks.list());
      dispatch(fetchFriends());
      dispatch(fetchFriendRequests());
      dispatch(fetchParty());
      dispatch(fetchDistrictCatalog());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogin = (form) => {
    dispatch(login({ username: form.username, password: form.password }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <main className="app">
      {!isAuthenticated ? (
        <WelcomePanel
          staticBase={staticBase}
          createAccountUrl={createAccountUrl}
          onLogin={handleLogin}
          loading={session.status === 'loading'}
          error={session.error}
          version={version}
        />
      ) : (
        <GamePanel player={session.player} onLogout={handleLogout} />
      )}
    </main>
  );
}
