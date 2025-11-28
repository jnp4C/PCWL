'use strict';

(function () {
  const pageKey = typeof window !== 'undefined' && window.__PCWL_PAGE__ ? window.__PCWL_PAGE__ : 'home';
  const config =
    (typeof window !== 'undefined' &&
      window.__PCWL_PAGE_CONFIG__ &&
      typeof window.__PCWL_PAGE_CONFIG__ === 'object' &&
      window.__PCWL_PAGE_CONFIG__) ||
    {};

  function normalizePrefix(value, fallback) {
    if (value === null || value === undefined) {
      return fallback;
    }
    let normalized = String(value).trim();
    if (!normalized) {
      return fallback;
    }
    if (!normalized.endsWith('/')) {
      normalized = `${normalized}/`;
    }
    return normalized;
  }

  function normalizeApiBase(value) {
    if (value === null || value === undefined) {
      return '/api';
    }
    let normalized = String(value).trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.replace(/\/+$/, '');
    }
    return normalized || '/api';
  }

  function mergeConfig(payload) {
    if (!payload || typeof payload !== 'object') {
      return config;
    }
    if (payload.app && typeof payload.app === 'object') {
      if (payload.app.version) {
        config.appVersion = payload.app.version;
      }
      if (payload.app.snapshot) {
        config.appSnapshot = payload.app.snapshot;
      }
    }
    if (payload.api && typeof payload.api === 'object' && payload.api.base_url) {
      config.apiBaseUrl = normalizeApiBase(payload.api.base_url);
    }
    if (payload.assets && typeof payload.assets === 'object' && payload.assets.static_url) {
      config.staticUrl = normalizePrefix(payload.assets.static_url, '/');
    }
    if (payload.links && typeof payload.links === 'object') {
      if (payload.links.home) {
        config.homeUrl = payload.links.home;
      }
      if (payload.links.leaderboard) {
        config.leaderboardUrl = payload.links.leaderboard;
      }
      if (payload.links.create_account) {
        config.createAccountUrl = payload.links.create_account;
      }
    }
    if (payload.leaderboard) {
      config.leaderboard = payload.leaderboard;
      if (typeof window !== 'undefined') {
        window.__PCWL_LEADERBOARD_PAYLOAD__ = payload.leaderboard;
      }
    }
    return config;
  }

  async function fetchConfig(endpoint) {
    try {
      const response = await fetch(endpoint, { credentials: 'include', cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Config request failed (${response.status})`);
      }
      const data = await response.json();
      return mergeConfig(data);
    } catch (error) {
      console.warn('[pcwl] Failed to load page config', error);
      return config;
    }
  }

  function applyConfigIfReady(payload) {
    const handler = typeof window !== 'undefined' ? window.__applyPageConfig : null;
    if (typeof handler === 'function') {
      try {
        handler(payload);
      } catch (error) {
        console.warn('[pcwl] applyPageConfig failed', error);
      }
    }
  }

  const endpoint = pageKey === 'leaderboard' ? '/api/pages/leaderboard/' : '/api/pages/home/';
  const readyPromise = fetchConfig(endpoint).then((latest) => {
    applyConfigIfReady(latest);
    if (latest && latest.leaderboard) {
      const leaderboardHandler =
        typeof window !== 'undefined' ? window.__applyLeaderboardBootstrap : null;
      if (typeof leaderboardHandler === 'function') {
        leaderboardHandler(latest.leaderboard);
      }
    }
    return latest;
  });

  if (typeof window !== 'undefined') {
    window.__PCWL_PAGE_CONFIG__ = config;
    window.__PCWL_CONFIG_READY__ = readyPromise;
  }
})();

