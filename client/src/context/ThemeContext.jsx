import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'obsidian',
    name: 'Obsidian Ledger',
    tagline: 'Surgical OLED Dark',
    isDark: true,
    accent: '#10B981',
    accentSecondary: '#06B6D4',
    bgPreview: '#08090C',
    dotColor: '#10B981',
  },
  {
    id: 'frost',
    name: 'Nordic Frost',
    tagline: 'Clean Alpine Light',
    isDark: false,
    accent: '#2563EB',
    accentSecondary: '#0284C7',
    bgPreview: '#F8FAFC',
    dotColor: '#2563EB',
  },
  {
    id: 'cyber',
    name: 'Tokyo Midnight',
    tagline: 'Phosphor Matrix',
    isDark: true,
    accent: '#00FF9D',
    accentSecondary: '#00E5FF',
    bgPreview: '#030508',
    dotColor: '#00FF9D',
  },
  {
    id: 'ivory',
    name: 'Executive Ivory',
    tagline: 'Regulator Luxury',
    isDark: false,
    accent: '#C2410C',
    accentSecondary: '#D97706',
    bgPreview: '#FAF7F2',
    dotColor: '#C2410C',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('consentlog_active_theme');
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    const legacy = localStorage.getItem('consentlog_theme');
    if (legacy === 'light') return 'frost';
    if (legacy === 'dark') return 'obsidian';
    return 'obsidian';
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
