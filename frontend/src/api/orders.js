import { api, BASE_URL } from "./client";

export const fetchOrders = async ({
  status,
  cashierId,
  from,
  to,
  search,
  take,
  cursor,
} = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (cashierId) params.set("cashierId", cashierId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (search) params.set("search", search);
  if (take) params.set("take", String(take));
  if (cursor) params.set("cursor", String(cursor));

  const query = params.toString();
  const path = query ? `/orders?${query}` : "/orders";
  return api(path, "GET");
};

export const fetchOrderById = async (orderId) => {
  if (!orderId) throw new Error("orderId is required");
  const { order } = await api(`/orders/${orderId}`, "GET");
  return order;
};

export const createOrder = async (payload) => {
  const { order } = await api("/orders", "POST", payload);
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  const { order } = await api(`/orders/${orderId}/status`, "PATCH", { status });
  return order;
};

export const voidOrder = async (orderId, payload) => {
  const { order } = await api(`/orders/${orderId}/void`, "POST", payload);
  return order;
};

export const voidOrderWithToken = async (orderId, payload, token) => {
  if (!orderId) throw new Error("orderId is required");
  if (!token) throw new Error("Manager token is required");

  const path = `/orders/${orderId}/void`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data?.order ?? data;
};

export const fetchVoidLogs = async ({
  type,
  cashierId,
  managerId,
  from,
  to,
  search,
  take,
  cursor,
} = {}) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (cashierId) params.set("cashierId", cashierId);
  if (managerId) params.set("managerId", managerId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (search) params.set("search", search);
  if (take) params.set("take", String(take));
  if (cursor) params.set("cursor", String(cursor));

  const query = params.toString();
  const path = query ? `/voids?${query}` : "/voids";
  return api(path, "GET");
};

export const createVoidLog = async (payload) => {
  const { voidLog } = await api("/voids", "POST", payload);
  return voidLog;
};
