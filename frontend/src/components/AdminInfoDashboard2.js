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
import images from "../utils/images";
import resolveUserAvatar from "../utils/avatarHelper";
import { useInventory } from "../contexts/InventoryContext";
import { fetchOrders } from "../api/orders";
import { fetchStockAlertState as fetchStockAlertStateApi, updateStockAlertState as updateStockAlertStateApi } from "../api/stockAlerts";
import { mapOrderToTx } from "../utils/mapOrder";

const DEFAULT_LOW_THRESHOLD = 10;
const STOCK_ALERT_RESET = 100;
const MAX_ORDER_FETCH = 100;
const READ_STORAGE_KEY = "dashboard.readNotifications";
const STOCK_DETAIL_EVENT = "dashboard-stock-detail-request";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

const normalizeNotifications = (list = []) => {
  return [...list]
    .filter(Boolean)
    .map((item) => {
      const baseType = item.type || "general";
      const text = item.text || "";
      const timestamp =
        item.timestamp ||
        (item.time ? new Date(item.time).toISOString() : null) ||
        new Date().toISOString();
      const id =
        item.id || `${baseType}|${text}|${timestamp}`;

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

const AdminInfoDashboard2 = ({ notifications = [], profileAnalytics, enableStockAlerts = false }) => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, changePassword, logout } =
    useAuth() || {};
  const { showToast } = useToast();
  const { inventory = [] } = useInventory() || {};

  // Normalize various sex values -> "M" / "F" / null
const normalizeSex = (val) => {
  if (!val || typeof val !== "string") return null;
  const v = val.trim().toLowerCase();
  if (v === "m" || v === "male") return "M";
  if (v === "f" || v === "female") return "F";
  return null;
};

  const adminName = currentUser?.fullName || "Admin";
  const avatarUrl =
    currentUser?.avatarUrl || images["avatar-ph.png"] || "https://i.pravatar.cc/100?img=68";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [selectedStockNotif, setSelectedStockNotif] = useState(null);
  const [readIds, setReadIds] = useState(() => new Set());
  const [displayNotifications, setDisplayNotifications] = useState(() => {
    if (Array.isArray(notifications) && notifications.length) {
      return normalizeNotifications(notifications);
    }
    if (
      typeof window !== "undefined" &&
      Array.isArray(window.__dashboardNotifications)
    ) {
      return normalizeNotifications(window.__dashboardNotifications);
    }
    return [];
  });
  const [lastSeenStockSignature, setLastSeenStockSignature] = useState("");
  const [stockAlertStateLoaded, setStockAlertStateLoaded] = useState(false);
  const [analyticsState, setAnalyticsState] = useState(() => {
    if (profileAnalytics) return profileAnalytics;
    if (typeof window !== "undefined" && window.__dashboardProfileAnalytics) {
      return window.__dashboardProfileAnalytics;
    }
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
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(READ_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
        }
      }
    } catch (err) {
      console.warn("Failed to load read notifications:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        READ_STORAGE_KEY,
        JSON.stringify(Array.from(readIds))
      );
    } catch (err) {
      console.warn("Failed to persist read notifications:", err);
    }
  }, [readIds]);

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.id) {
      setLastSeenStockSignature("");
      setStockAlertStateLoaded(true);
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
  }, [currentUser?.id]);

  const persistStockAlertSignature = useCallback(
    async (signature) => {
      const normalizedSignature =
        typeof signature === "string" ? signature : "";
      if (normalizedSignature === lastSeenStockSignature) return;
      setLastSeenStockSignature(normalizedSignature);
      if (!currentUser?.id) return;
      try {
        await updateStockAlertStateApi(normalizedSignature);
      } catch (err) {
        console.warn("Failed to persist stock alert signature:", err);
      }
    },
    [currentUser?.id, lastSeenStockSignature]
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
    const now = new Date();
    return (inventory || []).reduce((acc, item) => {
      if (!item) return acc;
      const current = Number(item.quantity ?? 0);
      if (current >= STOCK_ALERT_RESET) return acc;
      const threshold =
        Number(item.lowThreshold ?? DEFAULT_LOW_THRESHOLD) || DEFAULT_LOW_THRESHOLD;
      const severity = current <= 0 ? "out" : "low";
      if (severity === "low" && current > threshold) return acc;
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
        timestamp: now.toISOString(),
        time: now.toLocaleTimeString(),
      });
      return acc;
    }, []);
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
    if (Array.isArray(notifications) && notifications.length) {
      const normalized = normalizeNotifications(notifications);
      setDisplayNotifications(normalized);
      if (typeof window !== "undefined") {
        window.__dashboardNotifications = normalized;
      }
    }
  }, [notifications]);

  useEffect(() => {
    setReadIds((prev) => {
      if (!prev.size) return prev;
      const ids = new Set(displayNotifications.map((notif) => notif.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [displayNotifications]);

  useEffect(() => {
    if (profileAnalytics) {
      setAnalyticsState(profileAnalytics);
      if (typeof window !== "undefined") {
        window.__dashboardProfileAnalytics = profileAnalytics;
      }
    }
  }, [profileAnalytics]);

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
    if (profileAnalytics) return;
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      if (event?.detail) {
        setAnalyticsState(event.detail);
      }
    };
    window.addEventListener("dashboard-profile-analytics-update", handler);
    return () => window.removeEventListener("dashboard-profile-analytics-update", handler);
  }, [profileAnalytics]);

  useEffect(() => {
    if (Array.isArray(notifications) && notifications.length) return;
    let active = true;
    let timer;
    const load = async () => {
      try {
        const params = { take: MAX_ORDER_FETCH };
        const response = await fetchOrders(params);
        const orderList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response)
          ? response
          : [];
        const stockNotifs = buildStockNotifications();
        const orderNotifs = buildOrderNotifications(orderList);
        const combined = normalizeNotifications([...stockNotifs, ...orderNotifs]);
        if (active) {
          setDisplayNotifications(combined);
          if (typeof window !== "undefined") {
            window.__dashboardNotifications = combined;
          }
        }
        if (!profileAnalytics) {
          const mapped = orderList
            .map((order) => {
              try {
                return mapOrderToTx(order);
              } catch (err) {
                return null;
              }
            })
            .filter(Boolean);
          const totalTransactions = mapped.length;
          const totalRevenue = mapped.reduce(
            (sum, tx) => sum + Number(tx.total || 0),
            0
          );
          const totalSold = mapped.reduce((sum, tx) => {
            const items = Array.isArray(tx.items) ? tx.items : [];
            return (
              sum +
              items.reduce(
                (acc, item) => acc + Number(item?.quantity || item?.qty || 0),
                0
              )
            );
          }, 0);
          const totalVoids = mapped.filter((tx) => tx.voided).length;
          const avgPerTransaction = totalTransactions
            ? totalRevenue / totalTransactions
            : 0;
          const itemTotals = new Map();
          mapped.forEach((tx) => {
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
          setAnalyticsState({
            totalSold,
            totalRevenue,
            totalTransactions,
            totalVoids,
            avgPerTransaction,
            bestSeller,
          });
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

  const bellNotifications = useMemo(
    () =>
      Array.isArray(displayNotifications)
        ? displayNotifications.slice(0, 8)
        : [],
    [displayNotifications]
  );

  const stockAlertCounts = useMemo(() => {
    if (!Array.isArray(displayNotifications)) return { low: 0, out: 0 };
    return displayNotifications.reduce(
      (acc, notif) => {
        if (notif?.type !== "stock") return acc;
        const text = (notif.text || "").toLowerCase();
        if (text.includes("out of stock")) acc.out += 1;
        else acc.low += 1;
        return acc;
      },
      { low: 0, out: 0 }
    );
  }, [displayNotifications]);

  const stockAlertTargets = useMemo(() => {
    if (!Array.isArray(displayNotifications)) return [];
    return displayNotifications
      .filter((notif) => notif?.type === "stock")
      .map((notif) => {
        const identifier =
          notif.itemId ??
          notif.stockId ??
          notif.productId ??
          notif.product?.id ??
          notif.id ??
          notif.itemName ??
          notif.stockName ??
          notif.text ??
          notif.time ??
          "";
        const severity =
          notif.severity ||
          ((notif.text || "").toLowerCase().includes("out of stock")
            ? "out"
            : "low");
        const normalizedId = String(identifier).trim();
        if (!normalizedId) return null;
        return `${normalizedId}|${severity}`;
      })
      .filter(Boolean)
      .sort();
  }, [displayNotifications]);

  const stockAlertSignature = useMemo(
    () => (stockAlertTargets.length ? stockAlertTargets.join("::") : ""),
    [stockAlertTargets]
  );

  const hasStockAlert = stockAlertCounts.low > 0 || stockAlertCounts.out > 0;

  useEffect(() => {
    if (!enableStockAlerts || !hasStockAlert || !stockAlertSignature) {
      setShowStockAlert(false);
      return;
    }
    if (!stockAlertStateLoaded) return;
    if (stockAlertSignature !== lastSeenStockSignature) {
      setShowStockAlert(true);
    }
  }, [
    hasStockAlert,
    enableStockAlerts,
    stockAlertSignature,
    lastSeenStockSignature,
    stockAlertStateLoaded,
  ]);

  useEffect(() => {
    if (!stockAlertSignature && previousStockSignatureRef.current) {
      persistStockAlertSignature("");
    }
    previousStockSignatureRef.current = stockAlertSignature;
  }, [stockAlertSignature, persistStockAlertSignature]);

  const unreadCount = useMemo(() => {
    if (!Array.isArray(displayNotifications) || !displayNotifications.length) {
      return 0;
    }
    return displayNotifications.reduce((count, notif) => {
      if (!notif?.id) return count + 1;
      return readIds.has(notif.id) ? count : count + 1;
    }, 0);
  }, [displayNotifications, readIds]);

  const handleSwitchRole = useCallback(() => {
    setShowProfile(false);
    navigate("/roles");
    window.location.reload();
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    setShowProfile(false);
    if (logout) {
      try {
        await logout();
      } catch (err) {
        console.warn("Logout failed:", err);
      }
    }
    navigate("/user-login", { replace: true });
    window.location.reload();
  }, [logout, navigate]);

  const markStockAlertAsHandled = useCallback(() => {
    setShowStockAlert(false);
    if (!stockAlertSignature) return;
    persistStockAlertSignature(stockAlertSignature);
  }, [stockAlertSignature, persistStockAlertSignature]);

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
    (notif) => {
      if (!notif) return;
      if (notif.id) {
        setReadIds((prev) => {
          if (prev.has(notif.id)) return prev;
          const next = new Set(prev);
          next.add(notif.id);
          return next;
        });
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
    []
  );

  const renderStockAlertModal = () => {
    if (!showStockAlert || !portalTarget) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-[#800000] bg-white shadow-2xl p-6 space-y-4 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-[#800000]">
            <FaExclamationTriangle className="text-3xl" aria-hidden="true" />
            <div className="text-center">
              <p className="text-xl font-bold">Stock Alerts</p>
              <p className="text-sm text-gray-700">
                Items need your attention right away.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
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
            <p className="text-xs text-gray-500">
              Check the Notifications panel for details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleStockAlertView}
              className="flex-1 rounded-full bg-[#FFC72C] px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-500 transition-colors"
            >
              View Notifications
            </button>
            <button
              type="button"
              onClick={handleStockAlertDismiss}
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
              <div className="p-3 border-b font-semibold">Notifications</div>
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
                    const isRead = notif.id ? readIds.has(notif.id) : false;
                    return (
                      <div
                        key={`${notif.id || notif.text}-${idx}`}
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
            src={avatarUrl}
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow-sm"
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
          avatarUrl={avatarUrl}
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
