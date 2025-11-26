export const notificationKey = (notif) => {
  if (!notif) return "";
  const raw =
    notif.id ??
    [
      notif.type || "notification",
      notif.transactionId || notif.orderDbId || "",
      notif.stockId || "",
      notif.text || "",
      notif.timestamp || "",
    ]
      .filter(Boolean)
      .join("|");
  const key = typeof raw === "string" ? raw : String(raw || "");
  return key.trim();
};

export const normalizeNotifications = (list = []) => {
  return [...list]
    .filter(Boolean)
    .map((item) => {
      const baseType = item.type || "general";
      const text = item.text || "";
      const timestamp =
        item.timestamp ||
        (item.time ? new Date(item.time).toISOString() : null) ||
        new Date().toISOString();
      const fallbackId = [baseType, text, timestamp].filter(Boolean).join("|");
      const rawId =
        item.id !== undefined && item.id !== null && item.id !== ""
          ? item.id
          : fallbackId;
      const id = String(rawId || fallbackId || "");

      return {
        ...item,
        type: baseType,
        text,
        id,
        timestamp,
        time: item.time || new Date(timestamp).toLocaleString(),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )
    .slice(0, 10);
};

export const RESTOCK_STORE_KEY = "__dashboardRestockNotifications";
export const READ_STORE_KEY = "__dashboardReadNotifications";
const READ_STORE_DEFAULT_SCOPE = "__global__";

const buildReadStoreKey = (scope = READ_STORE_DEFAULT_SCOPE) => {
  const normalized = String(scope || READ_STORE_DEFAULT_SCOPE).trim();
  return `${READ_STORE_KEY}:${normalized || READ_STORE_DEFAULT_SCOPE}`;
};

export const getRestockStore = () => {
  if (typeof window === "undefined") return null;
  if (!Array.isArray(window[RESTOCK_STORE_KEY])) {
    let seed = [];
    try {
      const raw = sessionStorage.getItem(RESTOCK_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          seed = parsed;
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to parse restock store:", err);
    }
    window[RESTOCK_STORE_KEY] = seed;
  }
  return window[RESTOCK_STORE_KEY];
};

export const persistRestockStore = (list = []) => {
  if (typeof window === "undefined") return;
  const safeList = Array.isArray(list) ? list : [];
  window[RESTOCK_STORE_KEY] = safeList;
  try {
    sessionStorage.setItem(RESTOCK_STORE_KEY, JSON.stringify(safeList));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to persist restock store:", err);
  }
};

export const mergeNotificationLists = (primary = [], secondary = []) => {
  const seen = new Set();
  const merged = [];
  [...primary, ...secondary].forEach((notif) => {
    if (!notif) return;
    const key = notificationKey(notif);
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(notif);
    }
  });
  return merged;
};

export const notificationListSignature = (list = []) =>
  list.map((item) => notificationKey(item)).join("::");

export const getReadStore = (scope = READ_STORE_DEFAULT_SCOPE) => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(buildReadStoreKey(scope));
    if (!raw) {
      // migrate legacy unscoped store if present
      const legacy = sessionStorage.getItem(READ_STORE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          const migrated = new Set(parsedLegacy);
          persistReadStore(migrated, scope);
          sessionStorage.removeItem(READ_STORE_KEY);
          return migrated;
        }
      }
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to parse read store:", err);
  }
  return new Set();
};

const normalizeReadKeys = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (input instanceof Set) return Array.from(input);
  if (typeof input === "string") return [input];
  if (typeof input[Symbol.iterator] === "function") {
    return Array.from(input);
  }
  return [];
};

export const persistReadStore = (
  keys = [],
  scope = READ_STORE_DEFAULT_SCOPE
) => {
  if (typeof window === "undefined") return;
  const normalized = normalizeReadKeys(keys);
  const arr = Array.from(new Set(normalized.filter(Boolean).map(String)));
  try {
    sessionStorage.setItem(buildReadStoreKey(scope), JSON.stringify(arr));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to persist read store:", err);
  }
};

export const clearReadStore = (scope = READ_STORE_DEFAULT_SCOPE) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(buildReadStoreKey(scope));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to clear read store:", err);
  }
};
