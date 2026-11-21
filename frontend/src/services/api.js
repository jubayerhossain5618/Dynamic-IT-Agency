import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'X-Auth-Token-Response': 'true',
  },
});

export const getStoredAuthToken = () =>
  sessionStorage.getItem('dyit_token') || localStorage.getItem('dyit_token');

// Primary auth uses HTTP-only cookies, with Authorization Bearer fallback for cross-origin browsers (e.g., vercel.app -> onrender.com)
api.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setStoredAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem('dyit_token', token);
    localStorage.setItem('dyit_token', token);
  } else {
    sessionStorage.removeItem('dyit_token');
    localStorage.removeItem('dyit_token');
  }
};

export default api;
