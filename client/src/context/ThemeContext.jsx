import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('consentlog_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false; // Pristine, high-end light mode by default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('consentlog_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('consentlog_theme', 'light');
    }
    // Clean up any old multi-theme leftover keys
    localStorage.removeItem('consentlog_active_theme');
    root.removeAttribute('data-theme');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        theme: darkMode ? 'dark' : 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
