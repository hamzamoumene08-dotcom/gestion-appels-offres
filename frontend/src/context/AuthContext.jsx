import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { UNAUTHORIZED_EVENT } from '../lib/api';

const AuthContext = createContext(null);

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const save = useCallback(({ token, user: u }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => save((await api.post('/login', { email, password })).data), [save]);
  const register = useCallback(async (payload) => save((await api.post('/register', payload)).data), [save]);

  const logout = useCallback(async () => {
    try { await api.post('/logout'); } catch { /* token déjà invalide */ }
    clearSession();
    setUser(null);
  }, []);

  // Token expiré ou révoqué côté serveur : on vide la session, le routeur renvoie vers la connexion.
  useEffect(() => {
    const onUnauthorized = () => { clearSession(); setUser(null); };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
};
