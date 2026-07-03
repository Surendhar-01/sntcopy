import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext as ThemeContextValue } from './useTheme';

const THEME_STORAGE_KEY = 'sri_nikil_theme';
const THEME_OPTIONS = ['light', 'dark', 'system'];
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value) {
  return THEME_OPTIONS.includes(value);
}

function readStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : 'system';
  } catch {
    return 'system';
  }
}

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children, onThemeChange }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  const setTheme = useCallback((nextTheme) => {
    const selectedTheme = isTheme(nextTheme) ? nextTheme : 'system';
    setThemeState(selectedTheme);

    if (typeof onThemeChange === 'function') {
      onThemeChange(selectedTheme);
    }
  }, [onThemeChange]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const themeQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const updateSystemTheme = () => {
      setSystemTheme(themeQuery.matches ? 'dark' : 'light');
    };

    updateSystemTheme();
    themeQuery.addEventListener('change', updateSystemTheme);
    return () => themeQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.dataset.themePreference = theme;
    document.documentElement.style.colorScheme = effectiveTheme;
  }, [effectiveTheme, theme]);

  const value = useMemo(() => ({
    effectiveTheme,
    setTheme,
    systemTheme,
    theme,
    themeOptions: THEME_OPTIONS
  }), [effectiveTheme, setTheme, systemTheme, theme]);

  return (
    <ThemeContextValue.Provider value={value}>
      {children}
    </ThemeContextValue.Provider>
  );
}
