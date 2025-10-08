// components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (e) {
      console.error('Login failed:', e);
      setErr(e.message || 'Invalid credentials');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Sign in</button>
    </form>
  );
}
