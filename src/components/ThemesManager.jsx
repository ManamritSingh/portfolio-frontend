import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ThemeManager = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('ThemeManager: Current path:', location.pathname);
    
    if (location.pathname === '/') {
      console.log('ThemeManager: Setting theme-light');
      document.body.className = 'theme-light';
    } else if (location.pathname === '/vscode') {
      console.log('ThemeManager: Setting theme-dark');
      document.body.className = 'theme-dark';
    } else {
      console.log('ThemeManager: Clearing themes');  
      document.body.className = '';
    }
  }, [location]);

  return null;
};

export default ThemeManager;
