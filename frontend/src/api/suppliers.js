import { api } from './client';

export const listSuppliers = () => api('/suppliers', 'GET');
export const createSupplier = (payload) => api('/suppliers', 'POST', payload);
export const updateSupplier = (id, payload) => api(`/suppliers/${id}`, 'PUT', payload);
export const deleteSupplier = (id) => api(`/suppliers/${id}`, 'DELETE');