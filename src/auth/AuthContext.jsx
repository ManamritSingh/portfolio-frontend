// auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ADMIN_API } from '../utils/api';

const AuthContext = createContext(null);

const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const r = String(rawRole).toLowerCase().trim();
  // strip an optional "role_" prefix
  return r.replace(/^role_/, '');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.role = normalizeRole(parsed.role);
        setUser(parsed);
        setToken(storedToken);
      } catch (e) {
        console.warn('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(ADMIN_API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Login failed');
    }

    const data = await response.json();

    // backend may return .token or .jwt; handle both
    const tokenFromBackend = data.token || data.jwt || data.accessToken;
    if (!tokenFromBackend) throw new Error('No token returned from backend');

    const userFromBackend = data.user || data; // tolerate different shapes
    const normalizedUser = {
      ...userFromBackend,
      role: normalizeRole(userFromBackend.role),
    };

    localStorage.setItem('authToken', tokenFromBackend);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(tokenFromBackend);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
