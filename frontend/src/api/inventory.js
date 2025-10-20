import { api } from './client';

export const fetchInventory = () => api('/products');

export const fetchInventoryLogs = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.take) query.set('take', String(params.take));
  if (params.cursor) query.set('cursor', String(params.cursor));
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.search) query.set('search', params.search);
  if (params.userId) query.set('userId', String(params.userId));
  if (params.productId) query.set('productId', params.productId);

  const qs = query.toString();
  return api(qs ? `/inventory/logs?${qs}` : '/inventory/logs');
};
