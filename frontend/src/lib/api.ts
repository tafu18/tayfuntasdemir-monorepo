import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  let path = url;
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  if (!path.startsWith('/uploads/')) {
    path = '/uploads' + path;
  }
  
  return `${cleanBase}${path}`;
};
