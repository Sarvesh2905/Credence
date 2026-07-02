import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('credence_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('credence_token');
      localStorage.removeItem('credence_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  checkUsername: (username) => api.post('/auth/check-username', { username }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ===== PROFILE API =====
export const profileAPI = {
  create: (formData) => api.post('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// ===== ASSESSMENT API =====
export const assessmentAPI = {
  start: (data) => api.post('/assessments/start', data),
  getAll: () => api.get('/assessments'),
  getById: (id) => api.get(`/assessments/${id}`),
  submitSection: (id, data) => api.post(`/assessments/${id}/submit-section`, data),
  submit: (id) => api.post(`/assessments/${id}/submit`),
};

// ===== DASHBOARD API =====
export const dashboardAPI = {
  getData: () => api.get('/dashboard/data'),
  getPassport: () => api.get('/dashboard/passport'),
  getStreak: () => api.get('/dashboard/streak'),
  getSubscriptions: () => api.get('/dashboard/subscriptions'),
  purchaseSubscription: (plan) => api.post('/dashboard/subscriptions/purchase', { plan }),
};

export default api;
