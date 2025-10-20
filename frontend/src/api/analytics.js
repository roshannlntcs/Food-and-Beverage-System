// frontend/src/api/analytics.js
import { api } from "./client";

/**
 * Fetches the admin summary used by HomeDashboard cards.
 * Falls back to safe zeros if the backend route isn't available.
 */
export async function fetchAdminSummary({ from, to } = {}) {
  try {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const path = params.toString()
      ? `/analytics/admin?${params}`
      : `/analytics/admin`;

    const res = await api(path, "GET");
    // Expect either { summary: {...} } or direct object
    return res?.summary ?? res ?? fallbackSummary();
  } catch {
    return fallbackSummary();
  }
}

export async function fetchCashierSummary(cashierId, { from, to } = {}) {
  if (!cashierId) return null;
  try {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const query = params.toString();
    const path = `/analytics/cashier/${cashierId}${query ? `?${query}` : ""}`;
    return await api(path, "GET");
  } catch (error) {
    console.error("fetchCashierSummary failed:", error);
    return null;
  }
}
function fallbackSummary() {
  return {
    revenueToday: 0,
    ordersToday: 0,
    voidsToday: 0,
    topItem: "—",
    revenueChangePct: 0,
    ordersChangePct: 0,
    voidsChangePct: 0,
    topItemChangePct: 0,
  };
}
