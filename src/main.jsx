import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// --- 🔒 GLOBAL FETCH OVERRIDE (adds JWT for /api/admin routes) ---
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = (localStorage.getItem('authToken') || '').trim();

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Only attach Authorization header for admin-protected routes
  if (typeof url === 'string' && url.includes('/api/admin/') && token) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Optional debug logging (you can remove this later)
  console.log('[Global Fetch] →', url);
  if (headers.Authorization) {
    console.log('[Global Fetch] Using token:', headers.Authorization.slice(0, 30) + '...');
  }

  return originalFetch(url, { ...options, headers });
};
// --- END GLOBAL FETCH OVERRIDE ---

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
