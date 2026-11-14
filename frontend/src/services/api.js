import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach Bearer token from sessionStorage/localStorage if present for multi-session support
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('dyit_token') || localStorage.getItem('dyit_token');
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
