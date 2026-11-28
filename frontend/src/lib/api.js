import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Session expirée : le contexte d'authentification s'en charge (voir AuthContext).
export const UNAUTHORIZED_EVENT = 'app-unauthorized';
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = /\/(login|register)$/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

export const errMsg = (e) => {
  if (e.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre.';
  if (!e.response) return 'Erreur de connexion au serveur.';
  const d = e.response.data;
  if (d?.errors) return Object.values(d.errors).flat().join(' ');
  return d?.message || 'Une erreur est survenue.';
};

export const fileUrl = (path) => `${API_URL.replace(/\/api\/?$/, '')}/storage/${path}`;

export default api;
