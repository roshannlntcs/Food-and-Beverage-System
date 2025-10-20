// src/components/OrdersPanel.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import images from "../utils/images";

export default function OrdersPanel({ orders, onSelectOrder }) {
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (showFilter && filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  const normalizeDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const orderDate = normalizeDate(order.date || order.createdAt);
      if (!orderDate) return false;

      if (dateFrom && dateTo && dateFrom === dateTo) {
        if (orderDate !== dateFrom) return false;
      } else {
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo && orderDate > dateTo) return false;
      }

      if (status && order.status !== status) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo, status]);

  const orderedLogs = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.date || 0).getTime();
      const bTime = new Date(b.createdAt || b.date || 0).getTime();
      return aTime - bTime;
    });
  }, [filteredOrders]);

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatus("");
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-2xl font-bold">Order Logs</h3>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter((value) => !value)}
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

      <div
        className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-1 px-2"
        style={{ overflowX: "visible" }}
      >
        <div
          className="grid auto-rows-min gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))" }}
        >
          {!orderedLogs.length && (
            <div className="col-span-full text-gray-400 text-sm">
              No orders match your filters.
            </div>
          )}

          {orderedLogs.map((order) => (
            <button
              key={order.orderID}
              onClick={() => onSelectOrder(order)}
              className={`
                relative w-full p-3 rounded-lg shadow flex flex-col items-start text-left bg-white
                transition-transform transition-shadow duration-150 ease-out
                hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 hover:z-20 origin-top
                focus:outline-none focus:ring-2 focus:ring-[#FFC72C]
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
          ))}
        </div>
      </div>
    </div>
  );
}
