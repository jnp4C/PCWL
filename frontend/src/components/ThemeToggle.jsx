import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'prague-explorer-theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function setStoredTheme(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    /* ignore storage issues */
  }
}

export default function ThemeToggle() {
  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const [theme, setTheme] = useState(() => {
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return mediaQuery?.matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    window.__pragueExplorerTheme = theme;
    document.dispatchEvent(new CustomEvent('prague-themechange', { detail: { theme } }));
    setStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!mediaQuery) {
      return undefined;
    }
    const listener = (event) => {
      const stored = getStoredTheme();
      if (!stored) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mediaQuery]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle"
      className="theme-toggle"
      type="button"
      aria-pressed={isDark}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-text">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
