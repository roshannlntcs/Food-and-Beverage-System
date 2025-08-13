import React from "react";

export default function TransactionDetailModal({ historyContext, setHistoryContext, transactions }) {
  // support both patterns: historyContext may have txId or tx snapshot
  const txId = historyContext?.txId || historyContext?.tx?.id;
  const tx = txId ? transactions.find(t => t.id === txId) : historyContext?.tx;

  if (!tx) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-1/3 max-h-[85vh] rounded-xl flex flex-col">
       
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#800000] rounded-t border-b px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg text-white font-bold">{tx.transactionID} Details</h2>
          <button
            onClick={() => setHistoryContext(null)}
            className="text-gray-300 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {tx.items.map((it, idx) => {
            const base = it.price;
            const sizeUp = it.size.price;
            const selectedAddons = it.selectedAddons || [];
            const addonsTotal = selectedAddons.reduce((a, x) => a + x.price, 0);
            const addonNames = selectedAddons.map(a => a.label).join(", ") || "None";
            const lineTotal = (base + sizeUp + addonsTotal) * it.quantity;

            return (
                <div
                key={idx}
                className={`p-3 border rounded-lg ${
                  it.voided
                    ? "bg-gray-100"
                    : "hover:shadow-md transition-shadow duration-150"
                } bg-white`}
              >
                {/* Item Name + Price */}
                <div className={`flex justify-between ${it.voided ? "line-through text-gray-500" : ""}`}>
                  <span className="font-semibold">{it.name} {it.voided && "(Voided)"}</span>
                  <span className="text-sm">₱{base.toFixed(2)}</span>
                </div>

                {/* Size */}
                <div className="text-sm flex justify-between">
                  <span>Size: {it.size.label}</span>
                  <span>₱{sizeUp.toFixed(2)}</span>
                </div>

                {/* Add-ons */}
                {addonsTotal > 0 && (
                  <div className="text-sm flex justify-between">
                    <span>Add‑ons: {addonNames}</span>
                    <span>₱{addonsTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Quantity */}
                <div className="text-sm flex justify-between">
                  <span>Quantity</span>
                  <span>{it.quantity}</span>
                </div>

                {/* Notes */}
                {it.notes && (
                  <div className="text-sm italic">Notes: {it.notes}</div>
                )}

                {/* Line Total */}
                <div className="mt-1 text-sm font-semibold flex justify-between">
                  <span>Line Total:</span>
                  <span>₱{lineTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {/* Totals */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₱{tx.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (12%):</span>
              <span>₱{tx.tax.toFixed(2)}</span>
            </div>
            {tx.discountPct > 0 && (
              <div className="flex justify-between">
                <span>
                  Discount ({tx.discountPct}% 
                  {tx.discountType ? ` ${tx.discountType.toUpperCase()}` : ""}
                  {tx.couponCode ? ` + ${tx.couponCode.toUpperCase()}` : ""})
                </span>
                <span>-₱{tx.discountAmt.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₱{tx.total.toFixed(2)}</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              <strong>Payment Method:</strong> {tx.method || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              <strong>Date of Transaction: </strong>{tx.date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
