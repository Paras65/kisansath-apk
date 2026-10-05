import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1b7a2d', // Vibrant modern agricultural green
      light: '#38a14b',
      dark: '#114f1d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Warm harvest gold
      light: '#fbbf24',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8faf6', // Soft organic off-white
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Deep high-contrast slate
      secondary: '#475569',
    },
    info: {
      main: '#0284c7',
      light: '#e0f2fe',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
    },
    error: {
      main: '#dc2626',
      light: '#fee2e2',
    },
  },
  typography: {
    fontFamily: "'Mukta', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 700,
    },
    subtitle2: {
      fontWeight: 700,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '0.92rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1b7a2d 0%, #125420 100%)',
          boxShadow: '0 2px 8px rgba(27, 122, 45, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #156d25 0%, #0d4418 100%)',
            boxShadow: '0 4px 14px rgba(27, 122, 45, 0.35)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
          border: '1px solid #e7eee2',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 20,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          minHeight: 44,
          borderRadius: 12,
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 54,
          padding: '6px 0',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#1b7a2d',
          },
        },
        label: {
          fontSize: '0.72rem',
          fontWeight: 600,
          '&.Mui-selected': {
            fontSize: '0.78rem',
            fontWeight: 800,
          },
        },
      },
    },
  },
});

