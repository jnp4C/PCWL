'use strict';

(function () {
  const THEME_STORAGE_KEY = 'pcwl-theme';
  const LEGACY_THEME_STORAGE_KEYS = ['prague-explorer-theme'];
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    return;
  }

  const textElement = toggle.querySelector('.theme-toggle-text');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredPreference = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      let keyUsed = THEME_STORAGE_KEY;
      let stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        for (const legacyKey of LEGACY_THEME_STORAGE_KEYS) {
          const legacyValue = localStorage.getItem(legacyKey);
          if (legacyValue) {
            stored = legacyValue;
            keyUsed = legacyKey;
            break;
          }
        }
      }
      if (stored && keyUsed !== THEME_STORAGE_KEY) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, stored);
          localStorage.removeItem(keyUsed);
        } catch (migrationError) {
          // ignore write failures during migration
        }
      }
      return stored;
    } catch (error) {
      return null;
    }
  };

  const setStoredPreference = (value) => {
    try {
      if (value) {
        localStorage.setItem(THEME_STORAGE_KEY, value);
      } else {
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
      for (const legacyKey of LEGACY_THEME_STORAGE_KEYS) {
        if (legacyKey !== THEME_STORAGE_KEY) {
          localStorage.removeItem(legacyKey);
        }
      }
    } catch (error) {
      // ignore storage errors (private mode, etc.)
    }
  };

  const updateToggleUi = (isDark) => {
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (textElement) {
      textElement.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
  };

  const broadcastThemeChange = (theme) => {
    window.__pcwlTheme = theme;
    window.__pragueExplorerTheme = theme;
    const detail = { theme };
    document.dispatchEvent(new CustomEvent('pcwl-themechange', { detail }));
    document.dispatchEvent(new CustomEvent('prague-themechange', { detail }));
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    updateToggleUi(isDark);
    broadcastThemeChange(theme);
  };

  let activeTheme = getStoredPreference();
  if (activeTheme !== 'dark' && activeTheme !== 'light') {
    activeTheme = prefersDark.matches ? 'dark' : 'light';
  }

  applyTheme(activeTheme);

  toggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    setStoredPreference(nextTheme);
  });

  prefersDark.addEventListener('change', (event) => {
    const storedPreference = getStoredPreference();
    if (storedPreference !== 'dark' && storedPreference !== 'light') {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
})();
