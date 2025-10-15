'use strict';

(function () {
  const STORAGE_KEY = 'prague-explorer-theme';
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    return;
  }

  const textElement = toggle.querySelector('.theme-toggle-text');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredPreference = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const setStoredPreference = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
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
    window.__pragueExplorerTheme = theme;
    document.dispatchEvent(
      new CustomEvent('prague-themechange', {
        detail: { theme },
      })
    );
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
