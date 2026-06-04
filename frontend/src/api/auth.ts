import api from './axios';

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (data: {
  name: string; email: string; password: string; address: string;
}) => api.post('/auth/register', data);
