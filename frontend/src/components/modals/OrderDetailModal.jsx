import React, { useState, useEffect } from "react";
import { placeholders } from "../../utils/data";
import statusIcon from "../../assets/status.png";

export default function OrderDetailModal({
  historyContext,
  setHistoryContext,
  onStatusChange
}) {
  const order = historyContext?.order;
  const [newStatus, setNewStatus] = useState(order?.status || "");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  if (!order) return null;

  // Group items by category
  const categorizedItems = {};
  Object.keys(placeholders).forEach(category => {
    categorizedItems[category] = [];
  });

  order.items.forEach(item => {
    for (const [cat, items] of Object.entries(placeholders)) {
      if (items.some(p => p.name === item.name)) {
        categorizedItems[cat].push(item);
        break;
      }
    }
  });

  const statusLabels = {
    pending: "Pending",
    ongoing: "Ongoing",
    complete: "Completed",
    cancelled: "Cancelled"
  };
  
  const statusColors = {
    pending: "bg-yellow-500",
    ongoing: "bg-blue-500",
    complete: "bg-green-500",
    cancelled: "bg-red-500"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-1/3 max-h-[85vh] rounded-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#800000] text-white rounded-t px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-bold">{order.orderID} Details</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img
                src={statusIcon}
                alt="Change Status"
                className="w-6 h-6 cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={() => setShowStatusDropdown(prev => !prev)}
              />
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow z-20 text-black">
                  {["pending", "ongoing", "complete", "cancelled"].map(status => (
                    <div
                      key={status}
                      onClick={() => {
                        setNewStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`px-3 py-1 cursor-pointer hover:bg-gray-200 ${
                        newStatus === status ? "font-semibold" : ""
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Metadata */}
          <div className="p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-150 space-y-1">
            <div className="flex justify-between">
              <strong>Transaction ID:</strong>
              <span>{order.transactionID || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <strong>Date & Time:</strong>
              <span>{order.date}</span>
            </div>
            <div className="text-sm text-gray-700 font-medium flex justify-between items-center">
              <strong>Status:</strong>
              <span className={`ml-2 px-2 py-0.5 text-white rounded ${statusColors[newStatus]}`}>
                {statusLabels[newStatus] || "N/A"}
                </span>
                </div>
                </div>

          {/* Ordered Items by Category */}
          {Object.entries(categorizedItems).map(([category, items]) =>
            items.length > 0 ? (
              <div key={category}>
                <h3 className="font-semibold text-md mt-4 mb-1">{category}</h3>
                {items.map((item, i) => {
                  const sizeUp = item?.size?.price || 0;
                  const sizeLabel = item?.size?.label || "N/A";
                  const addons = item.selectedAddons || [];
                  const addonLabels = addons.map(a => a.label).join(", ") || "None";

                  return (
                    <div key={i} className="p-3 border rounded-lg bg-gray-50 space-y-1 mb-2 hover:shadow-md transition-shadow duration-150">
                      <div className="font-semibold">
                        {item.name}
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Size:</span><span>{sizeLabel}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Add-ons:</span><span>{addonLabels}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Quantity:</span><span>{item.quantity}</span>
                      </div>
                      {item.notes && (
                        <div className="text-sm italic">Notes: {item.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-white flex justify-end space-x-2">
          <button
            onClick={() => setHistoryContext(null)}
            className="flex-1 py-2 rounded-lg border hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={() => {
              onStatusChange(order.orderID, newStatus);
              setHistoryContext(null);
            }}
            className="flex-1 py-2 bg-[#800000] text-white rounded-lg font-semibold hover:font-bold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
