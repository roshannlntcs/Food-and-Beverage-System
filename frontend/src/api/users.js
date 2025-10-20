import { api } from "./client";

export const fetchUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  const queryString = query.toString();
  const res = await api(queryString ? `/users?${queryString}` : "/users", "GET");
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res)) return res;
  return res?.users ? res.users : [];
};

export const createUser = (payload) => api("/users", "POST", payload);

export const updateUser = (id, payload) =>
  api(`/users/${id}`, "PUT", payload);

export const deleteUser = (id) => api(`/users/${id}`, "DELETE");

export const changePassword = (id, oldPassword, newPassword) =>
    api(`/users/${id}/password`, "PUT", { oldPassword, newPassword });