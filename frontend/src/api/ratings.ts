import api from './axios';

export const createRating = (storeId: string, value: number) =>
  api.post('/ratings', { storeId, value });

export const updateRating = (ratingId: string, value: number) =>
  api.patch(`/ratings/${ratingId}`, { value });
