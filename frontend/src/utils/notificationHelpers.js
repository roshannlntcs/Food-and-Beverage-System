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
const READ_CACHE_KEY = "__dashboardReadCache";

const getStorageHandles = () => {
  if (typeof window === "undefined") return [];
  const stores = [];
  try {
    if (window.sessionStorage) stores.push(window.sessionStorage);
  } catch (_err) {
    // ignore
  }
  try {
    if (window.localStorage) stores.push(window.localStorage);
  } catch (_err) {
    // ignore
  }
  return stores;
};

const readStorageValue = (key) => {
  const stores = getStorageHandles();
  for (const store of stores) {
    try {
      const raw = store.getItem(key);
      if (raw) return raw;
    } catch (_err) {
      // ignore and try next
    }
  }
  return null;
};

const writeStorageValue = (key, value) => {
  const stores = getStorageHandles();
  stores.forEach((store) => {
    try {
      if (value === null) store.removeItem(key);
      else store.setItem(key, value);
    } catch (_err) {
      // ignore storage quota errors
    }
  });
};

const getReadCache = () => {
  if (typeof window === "undefined") return null;
  if (!window[READ_CACHE_KEY]) {
    window[READ_CACHE_KEY] = {};
  }
  return window[READ_CACHE_KEY];
};

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
  const cache = getReadCache();
  const cacheKey = buildReadStoreKey(scope);
  if (cache?.[cacheKey]) {
    return new Set(cache[cacheKey]);
  }
  try {
    let raw = readStorageValue(cacheKey);
    if (!raw) {
      // migrate legacy unscoped store if present
      raw = readStorageValue(READ_STORE_KEY);
      if (raw) {
        const parsedLegacy = JSON.parse(raw);
        if (Array.isArray(parsedLegacy)) {
          persistReadStore(new Set(parsedLegacy), scope);
          writeStorageValue(READ_STORE_KEY, null);
          return new Set(parsedLegacy);
        }
      }
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (cache) cache[cacheKey] = parsed;
      return new Set(parsed);
    }
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
  const key = buildReadStoreKey(scope);
  const payload = JSON.stringify(arr);
  writeStorageValue(key, payload);
  const cache = getReadCache();
  if (cache) cache[key] = arr;
};

export const clearReadStore = (scope = READ_STORE_DEFAULT_SCOPE) => {
  if (typeof window === "undefined") return;
  const key = buildReadStoreKey(scope);
  writeStorageValue(key, null);
  const cache = getReadCache();
  if (cache) {
    delete cache[key];
  }
};
