import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaShoppingCart,
  FaCube,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import ProfileModal from "./modals/ProfileModal";
import useOptimizedAvatar from "../hooks/useOptimizedAvatar";
import { useInventory } from "../contexts/InventoryContext";
import { fetchOrders, fetchVoidLogs } from "../api/orders";
import {
  fetchStockAlertState as fetchStockAlertStateApi,
  updateStockAlertState as updateStockAlertStateApi,
} from "../api/stockAlerts";
import { fetchReadNotifications, markNotificationsRead } from "../api/notifications";
import {
  normalizeNotifications,
  notificationKey,
  getRestockStore,
  persistRestockStore,
  mergeNotificationLists,
  notificationListSignature,
  getReadStore,
  persistReadStore,
} from "../utils/notificationHelpers";
import { mapOrderToTx } from "../utils/mapOrder";

const DEFAULT_LOW_THRESHOLD = 10;
const STOCK_ALERT_RESET = 100;
const MAX_ORDER_FETCH = 100;
const STOCK_DETAIL_EVENT = "dashboard-stock-detail-request";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

const ANALYTICS_DEFAULT_KEY = "__global__";
const getAnalyticsStore = () => {
  if (typeof window === "undefined") return null;
  if (!window.__dashboardProfileAnalyticsStore) {
    window.__dashboardProfileAnalyticsStore = {};
  }
  return window.__dashboardProfileAnalyticsStore;
};

const resolveStockIdentifier = (item = {}) => {
  const parts = [
    item.id,
    item._id,
    item.uuid,
    item.productId,
    item.sku,
    item.code,
    item.name,
  ]
    .map((value) => (value ? String(value).trim() : ""))
    .filter(Boolean);
  if (!parts.length) return null;
  return parts.join("|").toLowerCase();
};

const MAX_RESTOCK_NOTIFICATIONS = 20;

const STOCK_ALERT_SEEN_PREFIX = "__stockAlertSeen:";
const stockAlertSeenKey = (user) => {
  const userId = user?.id;
  if (!userId && userId !== 0) return null;
  const stamp = user?.lastLogin || user?.updatedAt || "";
  return `${STOCK_ALERT_SEEN_PREFIX}${userId}:${stamp}`;
};

const hasSeenStockAlertOnce = (user) => {
  if (typeof sessionStorage === "undefined") return false;
  const key = stockAlertSeenKey(user);
  if (!key) return false;
  return sessionStorage.getItem(key) === "1";
};
const storeStockAlertSeen = (user) => {
  if (typeof sessionStorage === "undefined") return;
  const key = stockAlertSeenKey(user);
  if (!key) return;
  sessionStorage.setItem(key, "1");
};
const clearStockAlertSeen = (user) => {
  if (typeof sessionStorage === "undefined") return;
  const key = stockAlertSeenKey(user);
  if (!key) return;
  sessionStorage.removeItem(key);
};

const parseDateSafe = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const filterVoidLogsForUser = (logs, userId) => {
  if (!userId) return logs;
  const numericId = Number(userId);
  return logs.filter((log) => {
    const cashierId =
      log.cashierId ?? log.cashier?.id ?? log.cashier?.userId ?? null;
    const managerId =
      log.managerId ?? log.manager?.id ?? log.manager?.userId ?? null;
    return (
      String(cashierId ?? "") === String(userId) ||
      (Number.isFinite(numericId) && Number(managerId) === numericId) ||
      String(managerId ?? "") === String(userId)
    );
  });
};

const AdminInfoDashboard2 = ({
  notifications = [],
  profileAnalytics,
  enableStockAlerts = false,
}) => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, changePassword, logout } =
    useAuth() || {};
  const { showToast } = useToast();
  const { inventory = [], loading: inventoryLoading } = useInventory() || {};
  const rawUserId = currentUser?.id;
  const currentUserId =
    rawUserId !== undefined && rawUserId !== null && Number.isFinite(Number(rawUserId))
      ? Number(rawUserId)
      : null;
  const currentUserKey = currentUserId ? String(currentUserId) : ANALYTICS_DEFAULT_KEY;
  const readScope = currentUserKey;

  const adminName = currentUser?.fullName || "Admin";
  const { avatarSrc, avatarLoading } = useOptimizedAvatar(currentUser);
  const stableAvatarRef = useRef(null);
  const lastUserKeyRef = useRef(currentUserKey);
  useEffect(() => {
    if (currentUserKey !== lastUserKeyRef.current) {
      lastUserKeyRef.current = currentUserKey;
      stableAvatarRef.current = null;
    }
  }, [currentUserKey]);
  useEffect(() => {
    if (avatarSrc) stableAvatarRef.current = avatarSrc;
  }, [avatarSrc]);
  const displayAvatar = avatarSrc || stableAvatarRef.current;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [selectedStockNotif, setSelectedStockNotif] = useState(null);
  const [readIds, setReadIds] = useState(() => getReadStore(readScope));
  const initialNotifications = (() => {
    const restockStore = getRestockStore() || [];
    if (Array.isArray(notifications) && notifications.length) {
      return normalizeNotifications(
        mergeNotificationLists(restockStore, notifications)
      );
    }
    if (
      typeof window !== "undefined" &&
      Array.isArray(window.__dashboardNotifications)
    ) {
      return normalizeNotifications(
        mergeNotificationLists(restockStore, window.__dashboardNotifications)
      );
    }
    return normalizeNotifications(restockStore);
  })();

  const [displayNotifications, setDisplayNotifications] = useState(
    initialNotifications
  );
  const [notificationSignature, setNotificationSignature] = useState(() =>
    notificationListSignature(initialNotifications)
  );
  const [lastSeenStockSignature, setLastSeenStockSignature] = useState("");
  const [stockAlertStateLoaded, setStockAlertStateLoaded] = useState(false);
  const [stockAlertSeen, setStockAlertSeen] = useState(() =>
    hasSeenStockAlertOnce(currentUser)
  );
  const [restockVersion, setRestockVersion] = useState(0);
  const [analyticsState, setAnalyticsState] = useState(() => {
    if (profileAnalytics) return profileAnalytics;
    const store = getAnalyticsStore();
    if (store?.[currentUserKey]) return store[currentUserKey];
    const summary = currentUser?.analytics || {};
    return {
      totalSold: Number(summary.totalSold || 0),
      totalRevenue: Number(summary.totalRevenue || 0),
      totalTransactions: Number(summary.totalTransactions || 0),
      totalVoids: Number(summary.totalVoids || 0),
      avgPerTransaction: Number(summary.avgPerTransaction || 0),
      bestSeller: summary.bestSeller || null,
    };
  });

  const dropdownRef = useRef(null);
  const dropdownBtnRef = useRef(null);
  const notifRef = useRef(null);
  const previousStockSignatureRef = useRef("");
  const previousStockLevelsRef = useRef(new Map());
  const restockNotificationsRef = useRef(
    (() => {
      const store = getRestockStore();
      return store ? [...store] : [];
    })()
  );
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const readStoreRef = useRef(getReadStore(readScope));
  const dispatchNotificationUpdate = useCallback((list) => {
    if (typeof window !== "undefined") {
      window.__dashboardNotifications = list;
      window.dispatchEvent(
        new CustomEvent("dashboard-notifications-update", { detail: list })
      );
    }
  }, []);

  useEffect(() => {
    const scopedStore = getReadStore(readScope);
    readStoreRef.current = scopedStore;
    setReadIds(scopedStore);
  }, [readScope]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = await fetchReadNotifications();
        if (mounted && Array.isArray(ids)) {
          const combined = new Set([
            ...readStoreRef.current,
            ...ids.map((id) => String(id)),
          ]);
          readStoreRef.current = combined;
          persistReadStore(combined, readScope);
          setReadIds(combined);
        }
      } catch (err) {
        console.warn("Failed to load read notifications:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [readScope]);

  useEffect(() => {
    if (!Array.isArray(inventory)) return;
    const prev = previousStockLevelsRef.current;
    const updates = [];
    const seenIds = new Set();
    inventory.forEach((item) => {
      if (!item) return;
      const identifier = resolveStockIdentifier(item);
      if (!identifier) return;
      seenIds.add(identifier);
      const currentQty = Number(item.quantity ?? 0);
      const prevQty = prev.has(identifier) ? prev.get(identifier) : null;
      if (prevQty !== null && currentQty > prevQty) {
        const delta = currentQty - prevQty;
        const parsedStamp =
          parseDateSafe(item.updatedAt) ||
          parseDateSafe(item.updated_at) ||
          parseDateSafe(item.lastUpdated) ||
          parseDateSafe(item.createdAt) ||
          new Date();
        const timestamp = parsedStamp.toISOString();
        updates.push({
          type: "stock",
          severity: "restock",
          variant: "restock",
          text: `Stock replenished: ${item.name || "Item"} (+${delta})`,
          itemId: item.id ?? null,
          itemName: item.name || "Item",
          category:
            item.category ||
            item.categoryName ||
            item.categoryId ||
            item.categoryKey ||
            "Uncategorized",
          quantity: currentQty,
          threshold:
            Number(item.lowThreshold ?? DEFAULT_LOW_THRESHOLD) ||
            DEFAULT_LOW_THRESHOLD,
          timestamp,
          time: parsedStamp.toLocaleString(),
          id: `stock|restock|${identifier}|${timestamp}`,
        });
      }
      prev.set(identifier, currentQty);
    });
    prev.forEach((_, key) => {
      if (!seenIds.has(key)) {
        prev.delete(key);
      }
    });
    if (updates.length) {
      const next = [
        ...updates,
        ...(restockNotificationsRef.current || []),
      ].slice(0, MAX_RESTOCK_NOTIFICATIONS);
      restockNotificationsRef.current = next;
      persistRestockStore(next);
      setRestockVersion((version) => version + 1);
    }
  }, [inventory]);

  useEffect(() => {
    let cancelled = false;
    if (!currentUserId) {
      setLastSeenStockSignature("");
      setStockAlertStateLoaded(false);
      setShowStockAlert(false);
      return undefined;
    }
    setStockAlertStateLoaded(false);
    (async () => {
      try {
        const state = await fetchStockAlertStateApi();
        if (!cancelled) {
          setLastSeenStockSignature(state?.signature || "");
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Failed to load stock alert state:", err);
          setLastSeenStockSignature("");
        }
      } finally {
        if (!cancelled) {
          setStockAlertStateLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const persistStockAlertSignature = useCallback(
    async (signature) => {
      const normalizedSignature =
        typeof signature === "string" ? signature : "";
      if (normalizedSignature === lastSeenStockSignature) return;
      setLastSeenStockSignature(normalizedSignature);
      if (!currentUserId) return;
      try {
        await updateStockAlertStateApi(normalizedSignature);
      } catch (err) {
        console.warn("Failed to persist stock alert signature:", err);
      }
    },
    [currentUserId, lastSeenStockSignature]
  );


  const handleClickOutside = useCallback((event) => {
    if (
      dropdownRef.current &&
      dropdownBtnRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !dropdownBtnRef.current.contains(event.target)
    ) {
      setDropdownOpen(false);
    }

    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setNotifOpen(false);
    }
  }, []);


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStockDetailRequest = (event) => {
      const detail = event?.detail;
      if (detail?.type === "stock") {
        setSelectedStockNotif(detail);
        setNotifOpen(false);
      }
    };
    window.addEventListener(STOCK_DETAIL_EVENT, handleStockDetailRequest);
    return () =>
      window.removeEventListener(STOCK_DETAIL_EVENT, handleStockDetailRequest);
  }, []);

  const buildStockNotifications = useCallback(() => {
    const base = (inventory || []).reduce((acc, item) => {
      if (!item) return acc;
      const current = Number(item.quantity ?? 0);
      if (current >= STOCK_ALERT_RESET) return acc;
      const threshold =
        Number(item.lowThreshold ?? DEFAULT_LOW_THRESHOLD) || DEFAULT_LOW_THRESHOLD;
      const severity = current <= 0 ? "out" : "low";
      if (severity === "low" && current > threshold) return acc;
      const baseStamp =
        parseDateSafe(item.updatedAt) ||
        parseDateSafe(item.updated_at) ||
        parseDateSafe(item.lastUpdated) ||
        parseDateSafe(item.createdAt) ||
        new Date();
      const timestamp = baseStamp.toISOString();
      const identifier = resolveStockIdentifier(item) || "item";
      const stockId = ["stock", severity, identifier].join("|");

      acc.push({
        type: "stock",
        severity,
        text:
          severity === "out"
            ? `Out of stock: ${item.name}`
            : `Low stock: ${item.name} (${current} left)`,
        itemId: item.id ?? null,
        itemName: item.name || "Item",
        category:
          item.category ||
          item.categoryName ||
          item.categoryId ||
          item.categoryKey ||
          "Uncategorized",
        quantity: current,
        threshold,
        timestamp,
        time: baseStamp.toLocaleString(),
        id: stockId,
      });
      return acc;
    }, []);
    return [...(restockNotificationsRef.current || []), ...base];
  }, [inventory]);

  const buildOrderNotifications = useCallback((ordersList = []) => {
    const txs = ordersList
      .map((order) => {
        try {
          return mapOrderToTx(order);
        } catch (err) {
          console.warn("mapOrderToTx failed in admin header:", err);
          return null;
        }
      })
      .filter(Boolean);

    return txs.map((tx) => {
      const iso = tx.createdAt || tx.date || new Date().toISOString();
      return {
        type: "order",
        text: `Transaction ${tx.transactionID || tx.id || "Order"} - ${formatCurrency(
          tx.total || 0
        )}`,
        timestamp: iso,
        time: new Date(iso).toLocaleString(),
      };
    });
  }, []);

  useEffect(() => {
    const restocks = restockNotificationsRef.current || [];
    let baseList = [];
    if (Array.isArray(notifications) && notifications.length) {
      baseList = notifications;
    } else if (
      typeof window !== "undefined" &&
      Array.isArray(window.__dashboardNotifications)
    ) {
      baseList = window.__dashboardNotifications;
    }
    const outgoing = normalizeNotifications(
      mergeNotificationLists(restocks, baseList)
    );
    const signature = notificationListSignature(outgoing);
    if (signature !== notificationSignature) {
      setDisplayNotifications(outgoing);
      setNotificationSignature(signature);
      dispatchNotificationUpdate(outgoing);
    }
  }, [
    notifications,
    restockVersion,
    notificationSignature,
    dispatchNotificationUpdate,
  ]);

  useEffect(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      (displayNotifications || []).forEach((notif) => {
        if (notif?.read) {
          const key = notificationKey(notif);
          if (key) next.add(key);
        }
      });
      if (next.size !== prev.size) {
        readStoreRef.current = next;
        persistReadStore(next, readScope);
      }
      return next;
    });
  }, [displayNotifications, readScope]);

  useEffect(() => {
    setReadIds((prev) => {
      if (!prev.size) return prev;
      const ids = new Set(
        displayNotifications
          .map((notif) => notificationKey(notif))
          .filter(Boolean)
      );
      let changed = false;
      const next = new Set();
      prev.forEach((key) => {
        if (ids.has(key)) {
          next.add(key);
        } else {
          changed = true;
        }
      });
      if (changed) {
        readStoreRef.current = next;
        persistReadStore(next, readScope);
        return next;
      }
      return prev;
    });
  }, [displayNotifications, readScope]);

  useEffect(() => {
    if (!profileAnalytics) return;
    setAnalyticsState(profileAnalytics);
    const store = getAnalyticsStore();
    if (store) {
      store[currentUserKey] = profileAnalytics;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("dashboard-profile-analytics-update", {
          detail: { userId: currentUserKey, summary: profileAnalytics },
        })
      );
    }
  }, [profileAnalytics, currentUserKey]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      if (event?.detail && Array.isArray(event.detail)) {
        setDisplayNotifications(normalizeNotifications(event.detail));
      }
    };
    window.addEventListener("dashboard-notifications-update", handler);
    return () => window.removeEventListener("dashboard-notifications-update", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      const summary = event?.detail?.summary || event?.detail;
      const targetKey = event?.detail?.userId || ANALYTICS_DEFAULT_KEY;
      if (!summary) return;
      if (targetKey !== currentUserKey) return;
      setAnalyticsState(summary);
      const store = getAnalyticsStore();
      if (store) {
        store[currentUserKey] = summary;
      }
    };
    window.addEventListener("dashboard-profile-analytics-update", handler);
    return () =>
      window.removeEventListener("dashboard-profile-analytics-update", handler);
  }, [currentUserKey]);

  useEffect(() => {
    let active = true;
    let timer;
    const load = async () => {
      try {
        const fetchPaginatedOrders = async () => {
          const aggregated = [];
          let cursor;
          let safety = 0;
          while (true) {
            const params = { take: MAX_ORDER_FETCH };
            if (currentUserId) {
              params.cashierId = currentUserId;
            }
            if (cursor) params.cursor = cursor;
            const response = await fetchOrders(params);
            const list = Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.orders)
              ? response.orders
              : Array.isArray(response)
              ? response
              : [];
            aggregated.push(...list);
            const nextCursor =
              response?.nextCursor ??
              response?.pagination?.nextCursor ??
              response?.cursor?.next ??
              null;
            if (!nextCursor || !list.length) break;
            cursor = nextCursor;
            safety += 1;
            if (safety > 50) break;
          }
          const unique = new Map();
          aggregated.forEach((order) => {
            const key =
              order.id || order.orderCode || order.transactionId || order.uuid;
            if (!key) {
              unique.set(
                `idx-${unique.size}`,
                order
              );
            } else {
              unique.set(String(key), order);
            }
          });
          return Array.from(unique.values());
        };

        const fetchPaginatedVoidLogs = async (paramKey) => {
          const aggregated = [];
          let cursor;
          let safety = 0;
          while (true) {
            const params = { take: MAX_ORDER_FETCH };
            if (paramKey && currentUserId) {
              params[paramKey] = currentUserId;
            }
            if (cursor) params.cursor = cursor;
            const response = await fetchVoidLogs(params);
            const list = Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.voidLogs)
              ? response.voidLogs
              : Array.isArray(response)
              ? response
              : [];
            aggregated.push(...list);
            const nextCursor =
              response?.nextCursor ??
              response?.pagination?.nextCursor ??
              response?.cursor?.next ??
              null;
            if (!nextCursor || !list.length) break;
            cursor = nextCursor;
            safety += 1;
            if (safety > 50) break;
          }
          return aggregated;
        };

        const [orderList, rawVoidLogs] = await Promise.all([
          fetchPaginatedOrders(),
          currentUserId
            ? (async () => {
                const [cashierLogs, managerLogs] = await Promise.all([
                  fetchPaginatedVoidLogs("cashierId"),
                  fetchPaginatedVoidLogs("managerId"),
                ]);
                const merged = [...cashierLogs, ...managerLogs];
                const unique = new Map();
                merged.forEach((log) => {
                  const key =
                    log.id ||
                    log.voidId ||
                    `${log.transactionId || "VOID"}:${log.approvedAt || log.createdAt || unique.size}`;
                  unique.set(String(key), log);
                });
                return Array.from(unique.values());
              })()
            : fetchPaginatedVoidLogs(null),
        ]);

        const stockNotifs = buildStockNotifications();
        const orderNotifs = buildOrderNotifications(orderList);
      const combined = normalizeNotifications(
        mergeNotificationLists(restockNotificationsRef.current, [
          ...stockNotifs,
          ...orderNotifs,
        ])
      );
      if (
        active &&
        (!Array.isArray(notifications) || notifications.length === 0)
      ) {
        setDisplayNotifications(combined);
        if (typeof window !== "undefined") {
          window.__dashboardNotifications = combined;
          window.dispatchEvent(
            new CustomEvent("dashboard-notifications-update", { detail: combined })
          );
        }
      }
        const mapped = orderList
          .map((order) => {
            try {
              return mapOrderToTx(order);
            } catch (err) {
              return null;
            }
          })
          .filter(Boolean);
        const relevantOrders = currentUserId
          ? mapped.filter(
              (tx) =>
                String(tx.cashierId ?? tx.cashier?.id ?? "") ===
                String(currentUserId)
            )
          : mapped;
        const totalTransactions = relevantOrders.length;
        const totalRevenue = relevantOrders.reduce(
          (sum, tx) => sum + Number(tx.total || 0),
          0
        );
        const totalSold = relevantOrders.reduce((sum, tx) => {
          const items = Array.isArray(tx.items) ? tx.items : [];
          return (
            sum +
            items.reduce(
              (acc, item) => acc + Number(item?.quantity || item?.qty || 0),
              0
            )
          );
        }, 0);
        const filteredVoidLogs = filterVoidLogsForUser(
          rawVoidLogs,
          currentUserId ?? null
        );
        const totalVoids = filteredVoidLogs.length;
        const avgPerTransaction = totalTransactions
          ? totalRevenue / totalTransactions
          : 0;
        const itemTotals = new Map();
        relevantOrders.forEach((tx) => {
          (tx.items || []).forEach((item) => {
            if (!item) return;
            const key = item.name || item.productId || item.id;
            if (!key) return;
            const current = itemTotals.get(key) || {
              name: item.name || String(key),
              qty: 0,
            };
            current.qty += Number(item.quantity || item.qty || 0);
            itemTotals.set(key, current);
          });
        });
        const bestSeller = Array.from(itemTotals.values()).reduce(
          (best, entry) => (entry.qty > (best?.qty || 0) ? entry : best),
          null
        );
        const summaryPayload = {
          totalSold,
          totalRevenue,
          totalTransactions,
          totalVoids,
          avgPerTransaction,
          bestSeller,
        };
        setAnalyticsState(summaryPayload);
        const store = getAnalyticsStore();
        if (store) {
          store[currentUserKey] = summaryPayload;
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("dashboard-profile-analytics-update", {
              detail: { userId: currentUserKey, summary: summaryPayload },
            })
          );
        }
      } catch (err) {
        console.warn("Admin header notification fetch failed:", err);
      }
    };
    load();
    timer = setInterval(load, 60000);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [
    notifications,
    profileAnalytics,
    buildStockNotifications,
    buildOrderNotifications,
    currentUserId,
    currentUserKey,
  ]);

  const analytics = useMemo(() => {
    if (analyticsState && Object.keys(analyticsState).length) return analyticsState;
    const summary = currentUser?.analytics || {};
    return {
      totalSold: Number(summary.totalSold || 0),
      totalRevenue: Number(summary.totalRevenue || 0),
      totalTransactions: Number(summary.totalTransactions || 0),
      totalVoids: Number(summary.totalVoids || 0),
      avgPerTransaction: Number(summary.avgPerTransaction || 0),
      bestSeller: summary.bestSeller || null,
    };
  }, [analyticsState, currentUser]);

  const schoolId =
    currentUser?.schoolId || currentUser?.employeeId || currentUser?.username || "";

  const recentRestocks = useMemo(() => {
    void restockVersion;
    return (restockNotificationsRef.current || []).slice(0, 3);
  }, [restockVersion]);

  const bellNotifications = useMemo(() => {
    void restockVersion;
    const restocks = restockNotificationsRef.current || [];
    const merged = mergeNotificationLists(restocks, displayNotifications || []);
    return normalizeNotifications(merged).slice(0, 8);
  }, [displayNotifications, restockVersion]);

  const stockNotifications = useMemo(
    () => buildStockNotifications(),
    [buildStockNotifications]
  );

  const stockAlertCounts = useMemo(() => {
    if (!Array.isArray(stockNotifications) || !stockNotifications.length) {
      return { low: 0, out: 0 };
    }
    return stockNotifications.reduce(
      (acc, notif) => {
        const severity = String(notif?.severity || "").toLowerCase();
        if (severity === "out") acc.out += 1;
        else if (severity === "low") acc.low += 1;
        return acc;
      },
      { low: 0, out: 0 }
    );
  }, [stockNotifications]);

  const stockAlertSignature = useMemo(() => {
    if (!Array.isArray(stockNotifications) || !stockNotifications.length) {
      return "";
    }
    const uniqueTargets = new Set();
    stockNotifications.forEach((notif) => {
      const severity = String(notif?.severity || "").toLowerCase();
      if (severity && severity !== "low" && severity !== "out") return;
      const identifier =
        notif?.itemId ??
        notif?.stockId ??
        notif?.productId ??
        notif?.product?.id ??
        notif?.itemName ??
        notif?.stockName ??
        null;
      if (!identifier) return;
      const normalized = String(identifier).trim().toLowerCase();
      if (normalized) {
        uniqueTargets.add(normalized);
      }
    });
    if (!uniqueTargets.size) return "";
    return Array.from(uniqueTargets).sort().join("::");
  }, [stockNotifications]);

  const hasRestockAlert = recentRestocks.length > 0;
  const hasStockAlert =
    stockAlertCounts.low > 0 || stockAlertCounts.out > 0 || hasRestockAlert;

  useEffect(() => {
    if (!enableStockAlerts) return;
    if (!stockAlertStateLoaded) return;
    if (!currentUserId) return;
    if (!stockAlertSignature) return;
    const matchesServer = lastSeenStockSignature === stockAlertSignature;
    if (matchesServer) {
      if (!stockAlertSeen) {
        storeStockAlertSeen(currentUser);
        setStockAlertSeen(true);
      }
      return;
    }
    if (stockAlertSeen) {
      clearStockAlertSeen(currentUser);
      setStockAlertSeen(false);
    }
  }, [
    enableStockAlerts,
    stockAlertStateLoaded,
    stockAlertSignature,
    lastSeenStockSignature,
    stockAlertSeen,
    currentUser,
    currentUserId,
  ]);

  useEffect(() => {
    if (!enableStockAlerts) {
      setShowStockAlert(false);
      return;
    }
    if (!stockAlertStateLoaded) return;
    if (!hasStockAlert) {
      setShowStockAlert(false);
      return;
    }
    if (stockAlertSeen) {
      setShowStockAlert(false);
      return;
    }
    setShowStockAlert(true);
  }, [
    enableStockAlerts,
    hasStockAlert,
    stockAlertStateLoaded,
    stockAlertSeen,
    currentUser,
  ]);

  useEffect(() => {
    if (!enableStockAlerts) {
      previousStockSignatureRef.current = stockAlertSignature;
      return;
    }
    if (inventoryLoading) {
      previousStockSignatureRef.current = stockAlertSignature;
      return;
    }
    if (!stockAlertSignature && previousStockSignatureRef.current) {
      persistStockAlertSignature("");
    }
    previousStockSignatureRef.current = stockAlertSignature;
  }, [
    enableStockAlerts,
    inventoryLoading,
    stockAlertSignature,
    persistStockAlertSignature,
  ]);

  const unreadCount = useMemo(() => {
    if (!Array.isArray(displayNotifications) || !displayNotifications.length) {
      return 0;
    }
    return displayNotifications.reduce((count, notif) => {
      const key = notificationKey(notif);
      if (!key) return count + 1;
      return readIds.has(key) ? count : count + 1;
    }, 0);
  }, [displayNotifications, readIds]);

  const handleSwitchRole = useCallback(() => {
    setShowProfile(false);
    navigate("/roles");
    window.location.reload();
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    setShowProfile(false);
    clearStockAlertSeen(currentUser);
    if (logout) {
      try {
        await logout();
      } catch (err) {
        console.warn("Logout failed:", err);
      }
    }
    navigate("/user-login", { replace: true });
    window.location.reload();
  }, [logout, navigate, currentUser]);

  const markStockAlertAsHandled = useCallback(() => {
    setShowStockAlert(false);
    if (stockAlertSignature) {
      persistStockAlertSignature(stockAlertSignature);
    } else {
      persistStockAlertSignature("");
    }
    storeStockAlertSeen(currentUser);
    setStockAlertSeen(true);
  }, [stockAlertSignature, persistStockAlertSignature, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setStockAlertSeen(false);
      return;
    }
    setStockAlertSeen(hasSeenStockAlertOnce(currentUser));
  }, [currentUser]);

  const handleStockAlertView = useCallback(() => {
    markStockAlertAsHandled();
    setNotifOpen(true);
  }, [markStockAlertAsHandled]);

  const handleStockAlertDismiss = useCallback(() => {
    markStockAlertAsHandled();
  }, [markStockAlertAsHandled]);

  const handleStockDetailDismiss = useCallback(() => {
    setSelectedStockNotif(null);
  }, []);

  const handleStockDetailRestock = useCallback(() => {
    setSelectedStockNotif(null);
    setNotifOpen(false);
    navigate("/admin/supplier-records", {
      state: { openSupplierLogs: true },
    });
  }, [navigate]);


  const handleAvatarUpload = useCallback(
    async (file) => {
      if (!file || !updateProfile) return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () =>
          reject(new Error("Failed to read profile image file"));
        reader.readAsDataURL(file);
      });
      try {
        await updateProfile({ avatarUrl: dataUrl });
        showToast({
          message: "Profile photo updated",
          type: "success",
          ttl: 2500,
        });
      } catch (error) {
        const message = error?.message || "Failed to update profile photo";
        showToast({ message, type: "error", ttl: 3000 });
        throw error;
      }
    },
    [updateProfile, showToast]
  );

  const handleChangePassword = useCallback(
    async (oldPassword, newPassword) => {
      if (!changePassword) return;
      try {
        await changePassword(oldPassword, newPassword);
        showToast({
          message: "Password updated successfully",
          type: "success",
          ttl: 2500,
        });
      } catch (error) {
        const message = error?.message || "Failed to change password";
        showToast({ message, type: "error", ttl: 3000 });
        throw error;
      }
    },
    [changePassword, showToast]
  );

  const handleBellNotificationClick = useCallback(
    async (notif) => {
      if (!notif) return;
      const key = notificationKey(notif);
      if (key) {
        setReadIds((prev) => {
          if (prev.has(key)) return prev;
          const next = new Set(prev);
          next.add(key);
          readStoreRef.current = next;
          persistReadStore(next, readScope);
          return next;
        });
        try {
          await markNotificationsRead([key]);
        } catch (err) {
          console.warn("Failed to mark notification read:", err);
        }
      }
      if (typeof window !== "undefined") {
        if (notif.type === "stock") {
          window.dispatchEvent(
            new CustomEvent(STOCK_DETAIL_EVENT, { detail: notif })
          );
        }
        window.dispatchEvent(
          new CustomEvent("dashboard-notification-click", { detail: notif })
        );
      }
    },
    [readScope]
  );

  const renderStockAlertModal = () => {
    if (!showStockAlert || !portalTarget) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl border-2 border-[#800000] bg-white shadow-2xl p-5 space-y-3 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-[#800000]">
            <FaExclamationTriangle className="text-3xl" aria-hidden="true" />
            <div className="text-center">
              <p className="text-xl font-bold">Stock Alerts</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            {stockAlertCounts.out > 0 && (
              <p className="font-semibold text-red-700">
                {stockAlertCounts.out} item
                {stockAlertCounts.out > 1 ? "s are" : " is"} out of stock.
              </p>
            )}
            {stockAlertCounts.low > 0 && (
              <p className="font-semibold text-yellow-600">
                {stockAlertCounts.low} item
                {stockAlertCounts.low > 1 ? "s are" : " is"} running low.
              </p>
            )}
            {recentRestocks.length > 0 && (
              <div className="text-left text-green-700">
                <p className="text-xs uppercase font-semibold">Recent Restocks</p>
                <ul className="mt-1 space-y-1">
                  {recentRestocks.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{entry.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Check the Notifications panel for details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleStockAlertView}
              className="flex-1 rounded-full bg-[#FFC72C] px-3 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-500 transition-colors"
            >
              View Notifications
            </button>
            <button
              type="button"
              onClick={handleStockAlertDismiss}
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>,
      portalTarget
    );
  };

  const renderStockDetailModal = () => {
    if (!selectedStockNotif || !portalTarget) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-[#800000] bg-white shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{selectedStockNotif.time}</p>
              <h3 className="text-xl font-semibold text-[#800000]">
                {selectedStockNotif.text}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleStockDetailDismiss}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close stock detail"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase text-gray-500">Item</p>
              <p className="font-semibold">{selectedStockNotif.itemName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Category</p>
              <p className="font-semibold">{selectedStockNotif.category}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Quantity</p>
              <p className="font-semibold">{selectedStockNotif.quantity}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Threshold</p>
              <p className="font-semibold">{selectedStockNotif.threshold}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Status</p>
              <p className="font-semibold">
                {selectedStockNotif.severity === "out" ? "Unavailable" : "Low"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleStockDetailRestock}
              className="flex-1 rounded-full bg-[#FFC72C] px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-500 transition-colors"
            >
              Restock
            </button>
            <button
              type="button"
              onClick={handleStockDetailDismiss}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>,
      portalTarget
    );
  };

  const handleMarkAllRead = useCallback(async () => {
    const unreadKeys = displayNotifications
      .map((notif) => notificationKey(notif))
      .filter((key) => key && !readIds.has(key));
    if (!unreadKeys.length) return;

    setReadIds((prev) => {
      const next = new Set(prev);
      unreadKeys.forEach((key) => next.add(key));
      readStoreRef.current = next;
      persistReadStore(next, readScope);
      return next;
    });

    try {
      await markNotificationsRead(unreadKeys);
    } catch (err) {
      console.warn("Failed to mark notifications read:", err);
    }
  }, [displayNotifications, readIds, readScope]);

  return (
    <>
      <div className="flex items-center space-x-4 relative z-50">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative focus:outline-none hover:text-yellow-400 transition"
          >
            <FaBell className="text-xl text-current" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-64 bg-white border rounded shadow-lg z-50 text-gray-800">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar">
                {bellNotifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400">
                    No notifications available
                  </p>
                ) : (
                  bellNotifications.map((notif, idx) => {
                    const icon =
                      notif.type === "order" ? (
                        <FaShoppingCart className="text-green-500" />
                      ) : (
                        <FaCube className="text-orange-500" />
                      );
                    const key = notificationKey(notif);
                    const listKey = key || `${idx}`;
                    const isRead = key ? readIds.has(key) : false;
                    return (
                      <div
                        key={listKey}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleBellNotificationClick(notif)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleBellNotificationClick(notif);
                          }
                        }}
                        className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-3 cursor-pointer transition ${
                          isRead ? "opacity-60" : ""
                        } hover:bg-gray-50 focus:bg-gray-100`}
                      >
                        <span className="mt-1">{icon}</span>
                        <div>
                          <p className="text-sm text-gray-700">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            ref={dropdownBtnRef}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <img
              src={displayAvatar || avatarSrc}
              alt="Admin Avatar"
              loading="lazy"
              decoding="async"
              className={`w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow-sm ${
                avatarLoading ? "animate-pulse" : ""
              }`}
            />
            <div className="hidden md:block leading-tight text-current">
              <div className="text-sm font-semibold">{adminName}</div>
              <div className="text-xs opacity-80">Administrator</div>
            </div>
          </button>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-14 w-44 bg-white border rounded shadow-lg z-50 text-gray-800"
            >
              <div className="px-4 py-2 text-sm font-semibold border-b text-gray-800">
                {adminName}
              </div>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowProfile(true);
                }}
              >
                <FaUser /> Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleSwitchRole();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt /> Switch Role
              </button>
            </div>
          )}
        </div>

        <ProfileModal
          show={showProfile}
          userName={adminName}
          schoolId={schoolId}
          avatarUrl={displayAvatar || avatarSrc}
          analytics={analytics}
          onAvatarUpload={handleAvatarUpload}
          onChangePassword={handleChangePassword}
          onSwitchRole={handleSwitchRole}
          onSignOut={handleSignOut}
          onClose={() => setShowProfile(false)}
        />
      </div>

      {renderStockAlertModal()}
      {renderStockDetailModal()}
    </>
  );
};

export default AdminInfoDashboard2;
