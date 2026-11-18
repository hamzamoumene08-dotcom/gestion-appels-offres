import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => {
  const d = e.response?.data;
  if (d?.errors) return Object.values(d.errors).flat().join(' ');
  return d?.message || 'Erreur de connexion au serveur.';
};

export default api;
