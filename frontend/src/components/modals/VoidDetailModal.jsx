import React from "react";

export default function VoidDetailModal({ voidLog, onClose }) {
  if (!voidLog) return null;

  // Ensure voidedItemsDetailed exists and is an array
  const rawItems = Array.isArray(voidLog.voidedItemsDetailed)
    ? voidLog.voidedItemsDetailed
    : [];

  // Deduplicate items based on name, size label, notes, and addons
  const uniqueItems = Array.from(
    new Map(
      rawItems
        .filter(item => item && item.name && typeof item === "object")
        .map(item => {
            const key = `${item?.name || "Unknown"}-${item?.size?.label || "N/A"}-${item?.notes || ""}-${(item?.selectedAddons || []).map(a => a?.label || "").join(",")}`;

          return [key, item];
        })
    ).values()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-1/3 max-h-[85vh] rounded-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-red-800 text-white rounded-t px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-bold">{voidLog.voidId} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Metadata */}
          <div className="p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-150 space-y-1">
            <div className="flex justify-between">
              <span><strong>Transaction ID:</strong></span>
              <span>{voidLog.transactionId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Cashier:</strong></span>
              <span>{voidLog.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Manager:</strong></span>
              <span>{voidLog.manager}</span>
            </div>
            <div className="flex justify-between">
              <strong>Date & Time:</strong>
              <span>{voidLog.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Void Type:</strong></span>
              <span>
                {voidLog.reason?.includes("Full transaction")
                  ? "Full Transaction Void"
                  : "Item Void"}
              </span>
            </div>
            <div className="flex justify-between">
              <span><strong>Reason:</strong></span>
              <span className="italic">{voidLog.reason || "N/A"}</span>
            </div>
          </div>
          <h2 className="text-lg font-bold">Voided Items</h2>
          {/* Voided Items */}
          {uniqueItems.length > 0 ? (
            uniqueItems.map((item, idx) => {
              const base = typeof item.price === "number" ? item.price : 0;
              const sizeUp = item?.size?.price || 0;
              const sizeLabel = item?.size?.label || "N/A";
              const addons = item.selectedAddons || [];
              const addonsCost = addons.reduce((sum, a) => sum + (a.price || 0), 0);
              const addonLabels = addons.map(a => a.label).join(", ") || "None";
              const totalLine = (base + sizeUp + addonsCost) * item.quantity;

              return (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-150"
                >
                  <div className="font-semibold">{item.name}</div>

                  <div className="text-sm flex justify-between">
                    <span>Size: {sizeLabel}</span>
                    <span>₱{sizeUp.toFixed(2)}</span>
                  </div>

                  <div className="text-sm flex justify-between">
                    <span>Base Price:</span>
                    <span>₱{base.toFixed(2)}</span>
                  </div>

                  <div className="text-sm flex justify-between">
                    <span>Add-ons:</span>
                    <span>{addonLabels}</span>
                  </div>

                  {addonsCost > 0 && (
                    <div className="text-sm flex justify-between">
                      <span>Add-ons Price:</span>
                      <span>₱{addonsCost.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="text-sm flex justify-between">
                    <span>Quantity:</span>
                    <span>{item.quantity}</span>
                  </div>

                  {item.notes && (
                    <div className="text-sm italic">Notes: {item.notes}</div>
                  )}

                  <div className="mt-1 text-sm font-semibold flex justify-between">
                    <span>Line Total:</span>
                    <span>₱{totalLine.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No detailed voided items available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
