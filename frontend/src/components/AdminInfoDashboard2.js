import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaShoppingCart,
  FaCube,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";
import ProfileModal from "./modals/ProfileModal";
import images from "../utils/images";
import { useInventory } from "../contexts/InventoryContext";
import { fetchOrders } from "../api/orders";
import { mapOrderToTx } from "../utils/mapOrder";

const DEFAULT_LOW_THRESHOLD = 10;
const MAX_ORDER_FETCH = 100;

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
      const timestamp =
        item.timestamp ||
        (item.time ? new Date(item.time).toISOString() : null) ||
        new Date().toISOString();
      return {
        ...item,
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

const AdminInfoDashboard2 = ({ notifications = [], profileAnalytics }) => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, changePassword, logout } =
    useAuth() || {};
  const { showToast } = useToast();
  const { inventory = [] } = useInventory() || {};

  const adminName = currentUser?.fullName || "Admin";
  const avatarUrl =
    currentUser?.avatarUrl || images["avatar-ph.png"] || "https://i.pravatar.cc/100?img=68";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  const buildStockNotifications = useCallback(() => {
    const now = new Date();
    return (inventory || []).reduce((acc, item) => {
      if (!item) return acc;
      const current = Number(item.quantity ?? 0);
      const threshold =
        Number(item.lowThreshold ?? DEFAULT_LOW_THRESHOLD) || DEFAULT_LOW_THRESHOLD;
      if (current <= 0) {
        acc.push({
          type: "stock",
          text: `Out of stock: ${item.name}`,
          timestamp: now.toISOString(),
          time: now.toLocaleTimeString(),
        });
      } else if (current <= threshold) {
        acc.push({
          type: "stock",
          text: `Low stock: ${item.name} (${current} left)`,
          timestamp: now.toISOString(),
          time: now.toLocaleTimeString(),
        });
      }
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
        ? displayNotifications.slice(0, 5)
        : [],
    [displayNotifications]
  );

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

  return (
    <div className="flex items-center space-x-4 relative z-50">
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((prev) => !prev)}
          className="relative focus:outline-none hover:text-yellow-400 transition"
        >
          <FaBell className="text-xl text-current" />
          {bellNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 leading-none">
              {bellNotifications.length}
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
                  return (
                    <div
                      key={`${notif.text}-${idx}`}
                      className="px-4 py-3 border-b last:border-b-0 flex items-start gap-3"
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
            <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <FaCog /> Settings
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
  );
};

export default AdminInfoDashboard2;


