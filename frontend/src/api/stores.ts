import api from './axios';

export const getStores = (params?: Record<string, string>) =>
  api.get('/stores', { params });

export const getStore = (id: string) => api.get(`/stores/${id}`);

export const createStore = (data: any) => api.post('/stores', data);

export const getMyStore = () => api.get('/stores/my-store');
