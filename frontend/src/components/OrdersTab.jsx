// src/components/OrdersPanel.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import images from "../utils/images";

export default function OrdersPanel({ orders, onSelectOrder }) {
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo,   setDateTo]       = useState("");
  const [status,   setStatus]       = useState("");
  const filterRef = useRef();

  // Close pop-over on outside click
  useEffect(() => {
    const handler = e => {
      if (showFilter && filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (dateFrom && new Date(o.date) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(o.date) > new Date(dateTo))   return false;
      if (status && o.status !== status) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo, status]);

  return (
    <div className="flex-1 p-4 flex flex-col h-full relative">
      {/* Header + Filter Toggle */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-2xl font-bold">Order Logs</h3>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(f => !f)}
            className="p-2 hover:bg-gray-200 rounded"
            title="Filter orders"
          >
            <img src={images["filter.png"]} alt="Filter" className="w-6 h-6" />
          </button>
          {showFilter && (
            <div className="absolute right-5 mt-1 w-58 bg-white border-2 border-[#800000] rounded shadow-lg p-4 z-10">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="complete">Complete</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setStatus("");
                  }}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid auto-rows-min gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))" }}
        >
          {!filteredOrders.length && (
            <div className="col-span-full text-gray-400 text-sm">
              No orders match your filters.
            </div>
          )}

          {filteredOrders.map(order => (
           <button
           key={order.orderID}
           onClick={() => onSelectOrder(order)}
           className={`
          p-3 rounded-lg shadow flex flex-col items-start text-left
          hover:scale-105 transition-transform duration-150 cursor-pointer
         bg-white
             ${order.status === "pending"   ? "border-2 border-yellow-300" : ""}
             ${order.status === "ongoing"   ? "border-2 border-blue-300"   : ""}
             ${order.status === "complete"  ? "border-2 border-green-300"  : ""}
             ${order.status === "cancelled" ? "border-2 border-red-300"    : ""}
           `}
           /* ${order.status === "pending"   ? "bg-yellow-50" : ""} 
              ${order.status === "ongoing"   ? "bg-blue-50"   : ""}
              ${order.status === "complete"  ? "bg-green-50"  : ""}
              ${order.status === "cancelled" ? "bg-red-50"    : ""} */
         >
           <img
    src={images[`order_log_${order.status}.png`] || images["order_log.png"]}
    alt={order.status}
    className="self-center w-20 h-20 mb-2 object-cover"
  />

  {/* 2) Left-aligned IDs */}
  <div className="w-full">
    <div className="font-semibold text-base truncate">
      {order.orderID}
    </div>
    <div className="text-xs text-gray-600 truncate">
      Tx: {order.transactionID}
    </div>
  </div>
         
           {/* 3) Centered status pill */}
  <span
    className={`self-center mt-2 inline-block px-11 py-1 text-xs font-medium rounded-full
      ${
        order.status === "pending"    ? "bg-yellow-100 text-yellow-800" :
        order.status === "ongoing"    ? "bg-blue-100   text-blue-800" :
        order.status === "complete"   ? "bg-green-100  text-green-800" :
        order.status === "cancelled"  ? "bg-red-100    text-red-800" :
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
