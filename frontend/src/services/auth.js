import api from './api';

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return api.post('/api/auth/logout');
};

export const getProfile = async () => {
  const response = await api.get('/api/user/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/user/profile', data);
  return response.data;
};

export const getBalance = async () => {
  const response = await api.get('/api/user/balance');
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post('/api/user/change-password', data);
  return response.data;
};
