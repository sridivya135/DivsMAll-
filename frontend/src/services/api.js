import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const ACCESS_KEY = 'divsmall.access';
const REFRESH_KEY = 'divsmall.refresh';
const USER_KEY = 'divsmall.user';

export const authStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  setSession: ({ access, refresh, user }) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach((key) => localStorage.removeItem(key));
  },
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

const humanize = (field) => field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

function normalizeError(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
    return 'Unable to connect to the server. Please check your connection.';
  }

  const data = error.response.data;
  if (data?.detail) {
    return typeof data.detail === 'string' ? data.detail : data.detail[0];
  }
  if (data?.message) return data.message;

  if (data && typeof data === 'object') {
    for (const [field, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length) return `${humanize(field)}: ${value[0]}`;
      if (typeof value === 'string') return `${humanize(field)}: ${value}`;
      if (value && typeof value === 'object') {
        for (const [nested, messages] of Object.entries(value)) {
          if (Array.isArray(messages) && messages.length) {
            return `${humanize(nested)}: ${messages[0]}`;
          }
        }
      }
    }
  }

  if (error.response.status === 500) {
    return 'Something went wrong. Please try again later.';
  }
  return `Request failed (${error.response.status}).`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = new Error(normalizeError(error));
    normalized.status = error.response?.status;
    normalized.data = error.response?.data;

    // Clear stale/invalid tokens without forcing navigation away from the single-page store.
    if (error.response?.status === 401) {
      authStorage.clear();
    }
    return Promise.reject(normalized);
  },
);

export const authApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  signup: (payload) => api.post('/auth/signup/', payload),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
};

export default api;
