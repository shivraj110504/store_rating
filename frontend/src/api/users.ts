import api from './axios';

export const getUsers = (params?: Record<string, string>) =>
  api.get('/users', { params });

export const getUser = (id: string) => api.get(`/users/${id}`);

export const createUser = (data: any) => api.post('/users', data);

export const updatePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.patch('/users/password', data);

export const getMe = () => api.get('/users/me');
