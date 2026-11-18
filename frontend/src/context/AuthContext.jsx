import { createContext, useState, useContext } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const save = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => save((await api.post('/login', { email, password })).data);
  const register = async (payload) => save((await api.post('/register', payload)).data);

  const logout = async () => {
    try { await api.post('/logout'); } catch { /* token déjà invalide */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
