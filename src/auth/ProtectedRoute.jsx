// auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const normalizeRole = (raw) => {
  if (!raw) return null;
  return String(raw).toLowerCase().replace(/^role_/, '');
};

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole) {
    const required = String(requiredRole).toLowerCase();
    const userRole = normalizeRole(user.role);
    if (userRole !== required) {
      // Optionally show a "Not authorized" page instead of redirect
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
