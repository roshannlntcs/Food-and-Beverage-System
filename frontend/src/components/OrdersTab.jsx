// src/components/OrdersPanel.jsx
import React from "react";
import images from "../utils/images";

export default function OrdersPanel({ 
  orders, 
  onSelectOrder 
}) {
  return (
    <div className="flex-1 p-4 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-3">Order Logs</h2>
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid content-start auto-rows-min"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            gap: "12px",
          }}
        >
          {orders.length === 0 && (
            <div className="text-gray-400 text-sm col-span-full">
              No orders yet.
            </div>
          )}
          {orders.map((order) => (
            <button
              key={order.orderID}
              onClick={() => onSelectOrder(order)}
              className={`
                bg-white p-3 rounded-lg shadow flex flex-col justify-between 
                hover:shadow-md transition-shadow duration-150 
                ${order.voided ? "bg-gray-100 opacity-60" : ""}
              `}
            >
              <div className="flex items-center space-x-2">
                <img
                  src={images["order_log.png"]}
                  alt="Order Log"
                  className="w-12 h-12 rounded-sm object-cover flex-shrink-0"
                />
                <div className="truncate">
                  <div className="font-semibold text-base">{order.orderID}</div>
                  <div className="text-xs text-gray-600">
                    Tx: {order.transactionID} {order.voided && "(Voided)"}
                  </div>
                  <div className="text-xs text-gray-500">{order.date}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
