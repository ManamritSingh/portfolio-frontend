// src/theme/colors.js

// 1) Brand tokens (raw hex)
export const brand = {
  primary: '#f5c4c5',
  primaryDark: '#e60b13',
  secondary: '#7e57c2',
  accent: '#FF6D00',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  // Neutral/text
  textPrimary: '#ffffff',
  textSecondary: '#ffffff',
  divider: 'rgba(0,0,0,0.12)',
  paper: '#ffffff',
  background: '#f7f7f9',
  black: '#000000',
  white: '#ffffff',
};

// 2) MUI theme factory using tokens
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: brand.primary,
      dark: brand.primaryDark,
      contrastText: brand.white,
    },
    secondary: {
      main: brand.secondary,
      contrastText: brand.white,
    },
    success: { main: brand.success },
    warning: { main: brand.warning },
    error: { main: brand.error },
    info: { main: brand.info },
    text: {
      primary: brand.textPrimary,
      secondary: brand.textSecondary,
    },
    divider: brand.divider,
    background: {
      default: brand.background,
      paper: brand.paper,
    },
    common: {
      black: brand.black,
      white: brand.white,
    },
    // Optional: custom brand slot
    accent: {
      main: brand.accent,
      contrastText: brand.white,
    },
  },
});
