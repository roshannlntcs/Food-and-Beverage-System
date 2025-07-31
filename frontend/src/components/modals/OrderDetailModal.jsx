import React from "react";

export default function OrderDetailModal({ historyContext, setHistoryContext }) {
  const order = historyContext?.order;
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-1/4 max-h-[85vh] rounded-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#800000] rounded-t border-b px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg text-white font-bold">{order.orderID}</h2>
          <button
            onClick={() => setHistoryContext(null)}
            className="text-gray-300 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="text-sm text-gray-600">
            Connected Transaction: {order.transactionID}
          </div>
          <div className="text-xs text-gray-500">{order.date}</div>

          {order.items.map((item, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className={`font-semibold ${item.voided ? "line-through text-gray-500" : ""}`}>
                {item.name} ({item.size.label}) x{item.quantity} {item.voided && "(Voided)"}
              </div>
              {item.selectedAddons?.length > 0 && (
                <div className="text-sm">
                  Add-ons: {item.selectedAddons.map(a => a.label).join(", ")}
                </div>
              )}
              {item.notes && <div className="text-sm italic">Notes: {item.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
