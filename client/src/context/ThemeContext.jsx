import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'frost',
    name: 'Nordic Frost',
    tagline: 'Clean Architectural Alpine Light',
    isDark: false,
    accent: '#2563EB',
    accentSecondary: '#0284C7',
    bgPreview: '#F8FAFC',
    dotColor: '#2563EB',
  },
  {
    id: 'ivory',
    name: 'Executive Ivory',
    tagline: 'Warm Regulatory & Swiss Luxury',
    isDark: false,
    accent: '#C2410C',
    accentSecondary: '#D97706',
    bgPreview: '#F7F4EE',
    dotColor: '#C2410C',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Ledger',
    tagline: 'Surgical Cryptographic Deep Slate',
    isDark: true,
    accent: '#10B981',
    accentSecondary: '#06B6D4',
    bgPreview: '#080B11',
    dotColor: '#10B981',
  },
  {
    id: 'cyber',
    name: 'Tokyo Midnight',
    tagline: 'Phosphor Matrix Cyber Terminal',
    isDark: true,
    accent: '#00FF9D',
    accentSecondary: '#00E5FF',
    bgPreview: '#030508',
    dotColor: '#00FF9D',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('consentlog_active_theme');
    // If user was previously stuck on dark obsidian or legacy dark, default to fresh frost
    if (saved === 'obsidian' || saved === 'dark' || !saved) {
      return 'frost';
    }
    if (THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'frost';
  });

  const activeThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];
  const darkMode = activeThemeMeta.isDark;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('consentlog_active_theme', theme);
    localStorage.setItem('consentlog_theme', darkMode ? 'dark' : 'light');

    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, darkMode]);

  const setTheme = (newTheme) => {
    if (THEMES.some((t) => t.id === newTheme)) {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      const nextIdx = (idx + 1) % THEMES.length;
      return THEMES[nextIdx].id;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEMES,
        activeThemeMeta,
        darkMode,
        toggleTheme,
        cycleTheme: toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
