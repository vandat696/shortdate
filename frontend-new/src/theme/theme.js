import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Xanh lá
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FF9800', // Cam
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#FF5252', // Đỏ
      light: '#EF5350',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Myriad Condensed", "Montserrat", "Inter", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontFamily: '"Myriad Condensed", sans-serif',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      fontFamily: '"Myriad Condensed", sans-serif',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontFamily: '"Inter", sans-serif',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
