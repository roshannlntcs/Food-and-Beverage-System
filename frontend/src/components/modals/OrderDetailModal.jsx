// src/components/modals/OrderDetailModal.jsx
import React, { useState, useEffect } from "react";
import { placeholders } from "../../utils/data";
import statusIcon from "../../assets/status.png";
import { useInventory } from "../../contexts/InventoryContext";

const collectSpecialInstructions = (item) => {
  if (!item || typeof item !== "object") return "";
  return (
    [
      item.notes,
      item.specialInstructions,
      item.instructions,
      item.customerNote,
      item.remark,
      item.remarks,
    ]
      .map((candidate) =>
        typeof candidate === "string" ? candidate.trim() : candidate ?? ""
      )
      .find((candidate) => Boolean(candidate)) || ""
  );
};

export default function OrderDetailModal({
  historyContext,
  setHistoryContext,
  onStatusChange,
  orders = []   // <-- accept orders prop (default empty)
}) {
  const { inventory = [] } = useInventory(); // <-- call hook

  // historyContext may hold a snapshot `order` or we may have a transactionID/orderID
  const snapshotOrder = historyContext?.order;
  const lookupKey = snapshotOrder?.transactionID || snapshotOrder?.orderID || historyContext?.transactionID || historyContext?.orderID;

  // Try to pick fresh order from orders state; fallback to snapshot if not found
  const order = (lookupKey && orders.length)
    ? orders.find(o => o.transactionID === lookupKey || o.orderID === lookupKey) || snapshotOrder
    : snapshotOrder;

  const [newStatus, setNewStatus] = useState(order?.status || "");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  if (!order) return null;

  // Group items by category
  // build name->category lookup using inventory first, then placeholders
  const nameToCategory = {};
  (inventory || []).forEach(it => {
    if (it.name) nameToCategory[it.name.toLowerCase()] = it.category || nameToCategory[it.name.toLowerCase()] || "Uncategorized";
  });
  Object.entries(placeholders).forEach(([cat, list]) => {
    (list || []).forEach(p => {
      if (p.name && !nameToCategory[p.name.toLowerCase()]) {
        nameToCategory[p.name.toLowerCase()] = cat;
      }
    });
  });

  // initialize categories present in lookup (or fallback to 'Uncategorized')
  const categorizedItems = {};
  Object.values(nameToCategory).forEach(cat => { if (!categorizedItems[cat]) categorizedItems[cat] = []; });
  if (!categorizedItems["Uncategorized"]) categorizedItems["Uncategorized"] = [];

  order.items.forEach(item => {
    const key = (item.name || "").toLowerCase();
    const cat = nameToCategory[key] || "Uncategorized";
    if (!categorizedItems[cat]) categorizedItems[cat] = [];
    categorizedItems[cat].push(item);
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
        <div className="sticky top-0 bg-[#800000] text-white rounded-t-lg px-4 py-3 flex justify-between items-center">
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
                  const sizeUp = Number(item?.size?.price || 0);
                  const sizeLabel = item?.size?.label || "N/A";
                  const addons = item.selectedAddons || item.addons || [];
                  const addonLabels = addons.map(a => a.label).join(", ") || "None";
                  const specialInstructions = collectSpecialInstructions(item);
                  const quantity = Number(item.quantity ?? item.qty ?? 0);

                  const isVoided = !!item.voided;

                  return (
                    <div key={i} className={`p-3 border rounded-lg ${isVoided ? "bg-gray-100" : "bg-gray-50"} space-y-1 mb-2 hover:shadow-md transition-shadow duration-150`}>
                      <div className="font-semibold">
                        <span className={isVoided ? "line-through text-gray-500" : ""}>
                          {item.name}
                        </span>
                        {isVoided && <span className="text-sm text-gray-500 ml-2">(Voided)</span>}
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Size:</span><span className={isVoided ? "line-through text-gray-500" : ""}>{sizeLabel}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Add-ons:</span><span className={isVoided ? "line-through text-gray-500" : ""}>{addonLabels}</span>
                      </div>
                       <div className="text-sm flex justify-between">
                         <span>Quantity:</span><span className={isVoided ? "line-through text-gray-500" : ""}>{quantity}</span>
                      </div>
                      {specialInstructions && (
                        <div className={`text-sm italic ${isVoided ? "line-through text-gray-500" : ""}`}>
                          Special Instructions: {specialInstructions}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 rounded-b-lg bg-white flex justify-end space-x-2">
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
