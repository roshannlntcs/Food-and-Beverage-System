import { api } from './client';

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  if (!entries.length) return '';
  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `?${query}`;
};

export const listSuppliers = () => api('/suppliers', 'GET');
export const createSupplier = (payload) => api('/suppliers', 'POST', payload);
export const updateSupplier = (id, payload) => api(`/suppliers/${id}`, 'PUT', payload);
export const deleteSupplier = (id) => api(`/suppliers/${id}`, 'DELETE');

export const listSupplierLogs = (params) =>
  api(`/suppliers/logs${buildQuery(params)}`, 'GET');

export const listSupplierLogsBySupplier = (id, params) =>
  api(`/suppliers/${id}/logs${buildQuery(params)}`, 'GET');

export const createSupplierLog = (supplierId, payload) =>
  api(`/suppliers/${supplierId}/logs`, 'POST', payload);
