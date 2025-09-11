// src/components/OrdersPanel.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import images from "../utils/images";

/**
 * OrdersPanel
 * - normal grid of order cards
 * - when you hover a card we create a floating portal copy (scaled) so it isn't clipped by ancestors
 * - floating copy follows the mouse enter/leave behavior and accepts clicks
 */
export default function OrdersPanel({ orders, onSelectOrder }) {
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const filterRef = useRef();

  // hovered state: { order, rect } or null
  const [hovered, setHovered] = useState(null);
  // a small debounce to avoid flicker when moving pointer around quickly
  const hideTimer = useRef(null);

  // Close pop-over on outside click
  useEffect(() => {
    const handler = (e) => {
      if (showFilter && filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  // Clear hover when user scrolls/resizes (keeps overlay in sync)
  useEffect(() => {
    const clear = () => setHovered(null);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);

  // --- Date helper: normalize to YYYY-MM-DD ---
  const normalizeDate = (d) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj)) return "";
    return dateObj.toISOString().split("T")[0];
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const orderDate = normalizeDate(o.date);
      if (!orderDate) return false;

      if (dateFrom && dateTo && dateFrom === dateTo) {
        if (orderDate !== dateFrom) return false;
      } else {
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo && orderDate > dateTo) return false;
      }

      if (status && o.status !== status) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo, status]);

  // Reset filters
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatus("");
  };

  // mouse enter/leave handlers for cards
  const handleCardEnter = (e, order) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHovered({ order, rect });
  };

  const handleCardLeave = () => {
    // small delay to allow moving from original card to floating overlay without flicker
    hideTimer.current = setTimeout(() => {
      setHovered(null);
      hideTimer.current = null;
    }, 80);
  };

  // overlay enter/leave to keep it visible while pointer is over it
  const handleOverlayEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const handleOverlayLeave = () => {
    setHovered(null);
  };

  // build floating overlay element via portal
  const FloatingOverlay = ({ info }) => {
    if (!info || typeof window === "undefined") return null;
    const { order, rect } = info;
    // scale factor for "lift"
    const scale = 1.06;
    const viewportPad = 8;

    // compute scaled size and clamped position so it stays inside viewport
    const rawW = rect.width * scale;
    const rawH = rect.height * scale;
    let left = rect.left - (rawW - rect.width) / 2;
    let top = rect.top - (rawH - rect.height) / 2;

    // clamp to viewport
    left = Math.max(viewportPad, Math.min(left, window.innerWidth - rawW - viewportPad));
    top = Math.max(viewportPad, Math.min(top, window.innerHeight - rawH - viewportPad));

    const style = {
      position: "fixed",
      left: Math.round(left) + "px",
      top: Math.round(top) + "px",
      width: Math.round(rawW) + "px",
      height: Math.round(rawH) + "px",
      zIndex: 9999,
      transformOrigin: "center center",
      pointerEvents: "auto",
    };

    // Render the card contents scaled to fit
    return createPortal(
      <div
  onMouseEnter={handleOverlayEnter}
  onMouseLeave={handleOverlayLeave}
  onClick={() => onSelectOrder(order)}
  style={style}
  className={`
    rounded-lg shadow-2xl bg-white overflow-hidden cursor-pointer
    ${order.status === "pending"   ? "border-2 border-yellow-300" : ""}
    ${order.status === "ongoing"   ? "border-2 border-blue-300"   : ""}
    ${order.status === "complete"  ? "border-2 border-green-300"  : ""}
    ${order.status === "cancelled" ? "border-2 border-red-300"    : ""}
  `}
>

        {/* use a small internal container to match card padding */}
        <div className="w-full h-full p-3 flex flex-col justify-between">
          <img
            src={images[`order_log_${order.status}.png`] || images["order_log.png"]}
            alt={order.status}
            className="self-center w-20 h-20 mb-2 object-cover"
            style={{ flex: "0 0 auto" }}
          />

          <div className="w-full flex-1 flex flex-col items-center">
            <div className="font-semibold text-base truncate">{order.orderID}</div>
            <div className="text-xs text-gray-600 truncate">TRN: {order.transactionID}</div>
          </div>

          <span
            className={`self-center mt-2 inline-block px-6 py-1 text-xs font-medium rounded-full
              ${
                order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                order.status === "ongoing" ? "bg-blue-100 text-blue-800" :
                order.status === "complete" ? "bg-green-100 text-green-800" :
                order.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-600"
              }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full relative">
      {/* Header + Filter Toggle */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-2xl font-bold">Order Logs</h3>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter((f) => !f)}
            className="p-2 hover:bg-gray-200 rounded"
            title="Filter orders"
          >
            <img src={images["filter.png"]} alt="Filter" className="w-6 h-6" />
          </button>
          {showFilter && (
            <div className="absolute right-5 mt-1 w-60 bg-white border rounded shadow-lg p-4 z-30 text-sm space-y-3">
              <div>
                <label className="block text-xs font-medium">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 rounded-lg border text-center text-sm hover:bg-gray-100"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid auto-rows-min gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))" }}
        >
          {!filteredOrders.length && (
            <div className="col-span-full text-gray-400 text-sm">
              No orders match your filters.
            </div>
          )}

          {filteredOrders.map((order) => (
            <div key={order.orderID} className="relative">
              <button
                onMouseEnter={(e) => handleCardEnter(e, order)}
                onMouseLeave={handleCardLeave}
                onClick={() => onSelectOrder(order)}
                className={`
                  w-full p-3 rounded-lg shadow flex flex-col items-start text-left
                  hover:scale-105 transition-transform duration-150 cursor-pointer bg-white
                  ${order.status === "pending"   ? "border-2 border-yellow-300" : ""}
                  ${order.status === "ongoing"   ? "border-2 border-blue-300"   : ""}
                  ${order.status === "complete"  ? "border-2 border-green-300"  : ""}
                  ${order.status === "cancelled" ? "border-2 border-red-300"    : ""}
                `}
              >
                <img
                  src={images[`order_log_${order.status}.png`] || images["order_log.png"]}
                  alt={order.status}
                  className="self-center w-20 h-20 mb-2 object-cover"
                />

                <div className="w-full flex-1 flex flex-col items-center">
                  <div className="font-semibold text-base truncate">
                    {order.orderID}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    TRN: {order.transactionID}
                  </div>
                </div>

                <span
                  className={`self-center mt-2 inline-block px-11 py-1 text-xs font-medium rounded-full
                    ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "ongoing" ? "bg-blue-100   text-blue-800" :
                      order.status === "complete" ? "bg-green-100  text-green-800" :
                      order.status === "cancelled" ? "bg-red-100    text-red-800" :
                      "bg-gray-100    text-gray-600"
                    }
                  `}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating overlay portal */}
      {hovered && <FloatingOverlay info={hovered} />}
    </div>
  );
}
