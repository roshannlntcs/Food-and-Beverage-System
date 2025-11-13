import { api } from './client';

export const resetSystem = (payload = { scope: "all" }) =>
  api("/admin/reset", "POST", payload);

export const importUsers = (users) =>
  api("/admin/import-users", "POST", { users });
