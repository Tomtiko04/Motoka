import { api } from './apiClient';

export const getLadipoCategories = () =>
  api.get('/ladipo/categories').then((r) => r.data.data);

export const getLadipoParts = (params = {}) =>
  api.get('/ladipo/parts', { params }).then((r) => r.data.data);

export const getLadipoPartBySlug = (slug) =>
  api.get(`/ladipo/parts/${slug}`).then((r) => r.data.data);

export const getPartCompatibility = (partId) =>
  api.get(`/ladipo/parts/${partId}/compatibility`).then((r) => r.data.data);

export const createLadipoOrder = (data) =>
  api.post('/ladipo/orders', data).then((r) => r.data.data);

export const payLadipoOrder = (orderNumber, { payment_gateway = 'paystack' } = {}) =>
  api.post(`/ladipo/orders/${orderNumber}/pay`, { payment_gateway }).then((r) => r.data.data);

export const verifyLadipoPayment = (reference) =>
  api.post('/ladipo/orders/verify-payment', { reference }).then((r) => r.data.data);

export const getUserLadipoOrders = () =>
  api.get('/ladipo/orders').then((r) => r.data.data);

export const getLadipoOrder = (orderNumber) =>
  api.get(`/ladipo/orders/${orderNumber}`).then((r) => r.data.data);

export const getLadipoCart = () =>
  api.get('/ladipo/cart').then((r) => r.data.data);

export const addLadipoCartItem = (data) =>
  api.post('/ladipo/cart', data).then((r) => r.data.data);

export const updateLadipoCartItem = (id, data) =>
  api.patch(`/ladipo/cart/${id}`, data).then((r) => r.data.data);

export const removeLadipoCartItem = (id) =>
  api.delete(`/ladipo/cart/${id}`).then((r) => r.data);
