import React, { createContext, useState, useCallback } from 'react';
import { COLORS } from '../../shared/constants';

export const ThemeContext = createContext(null);

/**
 * Theme Context Provider
 * Manages app theme (light/dark mode)
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
  };

  const value = {
    ...theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Light theme colors
const lightColors = {
  ...COLORS,
  background: '#FFFFFF',
  text: '#1A1A1A',
  card: '#FFFFFF',
};

// Dark theme colors
const darkColors = {
  ...COLORS,
  background: '#1F1B24',
  text: '#FFFFFF',
  card: '#2A2530',
};

export default ThemeProvider;
