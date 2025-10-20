import { api } from "./client";

export const fetchCurrentUser = async () => {
  const res = await api("/auth/me", "GET");
  return res?.user ?? res ?? null;
};

export const updateCurrentUser = async (payload = {}) => {
  const res = await api("/auth/me", "PUT", payload);
  return res?.user ?? res ?? null;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const payload = {
    currentPassword,
    newPassword,
  };
  return api("/auth/change-password", "POST", payload);
};
