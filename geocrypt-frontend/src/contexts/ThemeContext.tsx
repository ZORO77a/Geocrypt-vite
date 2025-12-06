import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { amber, blue, grey, deepOrange, deepPurple } from '@mui/material/colors';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = 'blue' | 'purple' | 'orange' | 'green' | 'red';

interface ThemeSettings {
  mode: ThemeMode;
  color: ThemeColor;
  compactMode: boolean;
  highContrast: boolean;
  reduceAnimations: boolean;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  changeThemeColor: (color: ThemeColor) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  resetThemeSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getDefaultThemeSettings = (): ThemeSettings => ({
  mode: 'light',
  color: 'blue',
  compactMode: false,
  highContrast: false,
  reduceAnimations: false,
});

const getSystemThemeMode = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getColorPalette = (color: ThemeColor) => {
  switch (color) {
    case 'blue':
      return {
        primary: blue,
        secondary: amber,
      };
    case 'purple':
      return {
        primary: deepPurple,
        secondary: amber,
      };
    case 'orange':
      return {
        primary: deepOrange,
        secondary: blue,
      };
    case 'green':
      return {
        primary: {
          main: '#2e7d32',
          light: '#4caf50',
          dark: '#1b5e20',
          contrastText: '#fff',
        },
        secondary: amber,
      };
    case 'red':
      return {
        primary: {
          main: '#d32f2f',
          light: '#ef5350',
          dark: '#c62828',
          contrastText: '#fff',
        },
        secondary: amber,
      };
    default:
      return {
        primary: blue,
        secondary: amber,
      };
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    // Load saved theme settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('geocrypt_theme_settings');
      if (savedSettings) {
        return { ...getDefaultThemeSettings(), ...JSON.parse(savedSettings) };
      }
    }
    return getDefaultThemeSettings();
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const mode = themeSettings.mode;
    return mode === 'system' ? getSystemThemeMode() === 'dark' : mode === 'dark';
  });

  // Update isDarkMode when themeSettings.mode changes
  useEffect(() => {
    const mode = themeSettings.mode;
    setIsDarkMode(mode === 'system' ? getSystemThemeMode() === 'dark' : mode === 'dark');
  }, [themeSettings.mode]);

  // Save theme settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('geocrypt_theme_settings', JSON.stringify(themeSettings));
    }
  }, [themeSettings]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeSettings.mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSettings.mode]);

  const createAppTheme = () => {
    const colorPalette = getColorPalette(themeSettings.color);
    
    return createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: colorPalette.primary,
        secondary: colorPalette.secondary,
        background: {
          default: isDarkMode ? grey[900] : grey[50],
          paper: isDarkMode ? grey[800] : '#ffffff',
        },
        ...(themeSettings.highContrast && {
          contrastThreshold: 4.5,
          tonalOffset: 0.2,
        }),
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        ...(themeSettings.compactMode && {
          fontSize: 13,
          h1: { fontSize: '2.5rem' },
          h2: { fontSize: '2rem' },
          h3: { fontSize: '1.75rem' },
          h4: { fontSize: '1.5rem' },
          h5: { fontSize: '1.25rem' },
          h6: { fontSize: '1rem' },
        }),
      },
      shape: {
        borderRadius: themeSettings.compactMode ? 6 : 8,
      },
      spacing: themeSettings.compactMode ? 6 : 8,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              ...(themeSettings.compactMode && {
                padding: '4px 12px',
                fontSize: '0.875rem',
              }),
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              ...(themeSettings.compactMode && {
                padding: '12px',
              }),
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              ...(themeSettings.highContrast && {
                border: `1px solid ${isDarkMode ? grey[700] : grey[300]}`,
              }),
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              ...(themeSettings.reduceAnimations && {
                '@media (prefers-reduced-motion: reduce)': {
                  '*, *::before, *::after': {
                    animationDuration: '0.01ms !important',
                    animationIterationCount: '1 !important',
                    transitionDuration: '0.01ms !important',
                  },
                },
              }),
            },
          },
        },
      },
      transitions: {
        ...(themeSettings.reduceAnimations && {
          create: () => 'none',
        }),
      },
    });
  };

  const toggleDarkMode = () => {
    setThemeSettings(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  const changeThemeColor = (color: ThemeColor) => {
    setThemeSettings(prev => ({
      ...prev,
      color,
    }));
  };

  const updateThemeSettings = (settings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  const resetThemeSettings = () => {
    setThemeSettings(getDefaultThemeSettings());
  };

  const theme = createAppTheme();

  const value: ThemeContextType = {
    themeSettings,
    isDarkMode,
    toggleDarkMode,
    changeThemeColor,
    updateThemeSettings,
    resetThemeSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;