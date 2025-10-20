import { api } from './client';

export const resetSystem = (scope = "all") =>
  api("/admin/reset", "POST", { scope });

export const importUsers = (users) =>
  api("/admin/import-users", "POST", { users });
