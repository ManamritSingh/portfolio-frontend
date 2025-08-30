// src/theme/homeTheme.js
import { createTheme } from '@mui/material/styles';

const homeTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: '#f5c4c5', secondary: '#5c0608', tertiary: '#000000' },
    background: { default: '#f5dadb', paper: '#ffffff' },
    text: { primary: '#5c0608', secondary: '#6b7280' },
    common: { black: '#000000', white: '#ffffff' },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
});

export default homeTheme;
