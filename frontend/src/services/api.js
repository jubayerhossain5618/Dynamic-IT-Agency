import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Primary auth uses HTTP-only cookies. Optional sessionStorage fallback supports cross-origin ITP browsers without persisting tokens in localStorage.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('dyit_token');
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
  } else {
    sessionStorage.removeItem('dyit_token');
    localStorage.removeItem('dyit_token');
  }
};

export default api;
