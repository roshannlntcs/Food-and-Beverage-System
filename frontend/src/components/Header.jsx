// src/components/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "../assets/logo-pos2.png";
import avatar from "../assets/avatar-ph.png";
import { FaBell, FaShoppingCart, FaCube } from "react-icons/fa";
import { fetchReadNotifications, markNotificationsRead } from "../api/notifications";
import {
  normalizeNotifications,
  notificationKey,
  getRestockStore,
  mergeNotificationLists,
} from "../utils/notificationHelpers";

const formatRole = (role) => {
  if (!role) return "Cashier";
  return role
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ")
    .trim();
};

export default function Header({
  userName,
  profilePic = avatar,
  roleLabel = "Cashier",
  onProfileClick,
  searchTerm,
  onSearchChange,
}) {
  const displayRole = formatRole(roleLabel);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const restocks = getRestockStore() || [];
    if (typeof window !== "undefined" && Array.isArray(window.__dashboardNotifications)) {
      return normalizeNotifications(
        mergeNotificationLists(restocks, window.__dashboardNotifications)
      );
    }
    return normalizeNotifications(restocks);
  });
  const [readIds, setReadIds] = useState(() => new Set());
  const notifRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ids = await fetchReadNotifications();
        if (active && Array.isArray(ids)) {
          setReadIds(new Set(ids.map((id) => String(id))));
        }
      } catch (err) {
        console.warn("POS header: failed to load read notifications", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      const detail = event?.detail;
      const list = Array.isArray(detail) ? detail : [];
      const restocks = getRestockStore() || [];
      setNotifications(normalizeNotifications(mergeNotificationLists(restocks, list)));
    };
    window.addEventListener("dashboard-notifications-update", handler);
    return () => window.removeEventListener("dashboard-notifications-update", handler);
  }, []);

  useEffect(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((notif) => {
        if (notif?.read) {
          const key = notificationKey(notif);
          if (key) next.add(key);
        }
      });
      return next;
    });
  }, [notifications]);

  useEffect(() => {
    setReadIds((prev) => {
      if (!prev.size) return prev;
      const keys = new Set(
        notifications
          .map((notif) => notificationKey(notif))
          .filter(Boolean)
      );
      let changed = false;
      const next = new Set();
      prev.forEach((key) => {
        if (keys.has(key)) {
          next.add(key);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [notifications]);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, []);

  const bellNotifications = useMemo(
    () => (Array.isArray(notifications) ? notifications.slice(0, 8) : []),
    [notifications]
  );

  const unreadCount = useMemo(() => {
    return bellNotifications.reduce((count, notif) => {
      const key = notificationKey(notif);
      if (!key) return count + 1;
      return readIds.has(key) ? count : count + 1;
    }, 0);
  }, [bellNotifications, readIds]);

  const handleNotificationClick = async (notif) => {
    const key = notificationKey(notif);
    if (!key) return;
    setReadIds((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    try {
      await markNotificationsRead([key]);
    } catch (err) {
      console.warn("POS header: failed to mark notification read", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadKeys = bellNotifications
      .map((notif) => notificationKey(notif))
      .filter((key) => key && !readIds.has(key));
    if (!unreadKeys.length) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      unreadKeys.forEach((key) => next.add(key));
      return next;
    });
    try {
      await markNotificationsRead(unreadKeys);
    } catch (err) {
      console.warn("POS header: failed to mark all notifications read", err);
    }
  };

  return (
    <header className="bg-[#800000] text-white flex justify-between items-center px-6 py-4 h-20 shadow-md border-b border-gray-200">
      {/* Left: Logo + Title */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="POS Logo"
          className="w-12 h-12 object-contain rounded"
        />
        <div className="text-xl font-bold tracking-wide">SPLICE</div>
      </div>

      {/* Middle: Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="text-black bg-white px-4 py-2 rounded-3xl w-1/3 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
      />

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative focus:outline-none text-white hover:text-yellow-300 transition"
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1 leading-none">
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
                  <p className="p-4 text-sm text-gray-400">No notifications available</p>
                ) : (
                  bellNotifications.map((notif, idx) => {
                    const key = notificationKey(notif) || `${idx}`;
                    const isRead = key ? readIds.has(key) : false;
                    const isOrder = notif.type === "order";
                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNotificationClick(notif)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(notif);
                          }
                        }}
                        className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-3 cursor-pointer transition ${
                          isRead ? "opacity-60" : ""
                        } hover:bg-gray-50 focus:bg-gray-100`}
                      >
                        <span className="mt-1">
                          {isOrder ? (
                            <FaShoppingCart className="text-green-500" />
                          ) : (
                            <FaCube className="text-orange-500" />
                          )}
                        </span>
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

        <button
          onClick={onProfileClick}
          className="flex items-center space-x-2 bg-[#FFC72C] px-3 py-1.5 rounded-full shadow hover:scale-105 transition-transform duration-150"
        >
          <img
            src={profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <div className="text-left leading-tight">
            <div className="font-bold text-sm text-black">{userName}</div>
            <div className="text-xs text-black">{displayRole}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
