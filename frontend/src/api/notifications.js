import { api } from "./client";

export async function fetchReadNotifications() {
  const res = await api("/notifications/read", "GET");
  return Array.isArray(res?.ids) ? res.ids : Array.isArray(res) ? res : [];
}

export async function markNotificationsRead(ids = []) {
  if (!Array.isArray(ids) || !ids.length) return;
  await api("/notifications/mark-read", "POST", { ids });
}
