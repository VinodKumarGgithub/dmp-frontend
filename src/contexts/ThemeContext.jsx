import { createContext, useContext, useState, useEffect } from 'react';
import { theme } from 'antd';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Load theme from localStorage or default to light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return false; // Default to light theme
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;

  const value = {
    isDark,
    toggleTheme,
    algorithm,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
