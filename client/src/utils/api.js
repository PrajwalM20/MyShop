import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect to login on 401 if NOT on a public page
    if (err.response?.status === 401) {
      const publicPaths = ['/', '/order', '/track', '/portfolio', '/calendar', '/about', '/login'];
      const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith(p + '/'));
      if (!isPublic) {
        localStorage.removeItem('cq_token');
        localStorage.removeItem('cq_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;