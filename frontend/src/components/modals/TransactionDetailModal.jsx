import React, { useState } from "react";
import ReceiptModal from "./ReceiptModal";

export default function TransactionDetailModal({ historyContext, setHistoryContext, transactions, shopDetails }) {
  const [showReceipt, setShowReceipt] = useState(false);

  const txId = historyContext?.txId || historyContext?.tx?.id;
  const tx = txId ? transactions.find(t => t.id === txId) : historyContext?.tx;

  if (!tx) return null;

  // Defensive tendered/change extraction
  const tenderedRaw = tx.tendered ?? tx.paymentDetails?.tendered ?? tx.total;
  const tenderedVal = Number(tenderedRaw) || 0;
  const changeRaw = tx.change ?? tx.paymentDetails?.change;
  const changeVal = (changeRaw !== undefined && changeRaw !== null) ? (Number(changeRaw) || 0) : undefined;

  return (
    <>
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
            {/* Metadata (like VoidDetailModal) */}
            <div className="p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-150 space-y-1">
              <div className="flex justify-between">
                <span><strong>Transaction ID:</strong></span>
                <span>{tx.transactionID}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Order ID:</strong></span>
                <span>{tx.orderID || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Cashier:</strong></span>
                <span>{tx.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Date & Time:</strong></span>
                <span>{tx.date}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Payment Method:</strong></span>
                <span>{tx.method || "N/A"}</span>
              </div>
            </div>

            {/* Items */}
            {tx.items.map((it, idx) => {
              const base = it.price;
              const sizeUp = it.size?.price ?? 0;
              const selectedAddons = it.selectedAddons || [];
              const addonsTotal = selectedAddons.reduce((a, x) => a + (x.price || 0), 0);
              const addonNames = selectedAddons.map(a => a.label).join(", ") || "None";
              const lineTotal = (base + sizeUp + addonsTotal) * (it.quantity || 1);

              return (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg ${it.voided ? "bg-red-200" : "hover:shadow-md transition-shadow duration-150"} bg-white`}
                >
                  <div className={`flex justify-between ${it.voided ? "line-through text-gray-500" : ""}`}>
                    <span className="font-semibold">{it.name} {it.voided && "(Voided)"}</span>
                    <span className="text-sm">₱{(base ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Size: {it.size?.label || "N/A"}</span>
                    <span>₱{(sizeUp).toFixed(2)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="text-sm flex justify-between">
                      <span>Add-ons: {addonNames}</span>
                      <span>₱{addonsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="text-sm flex justify-between">
                    <span>Quantity</span>
                    <span>{it.quantity}</span>
                  </div>
                  {it.notes && (
                    <div className="text-sm italic">Notes: {it.notes}</div>
                  )}
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
                <span>₱{(tx.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (12%):</span>
                <span>₱{(tx.tax ?? 0).toFixed(2)}</span>
              </div>
              {tx.discountPct > 0 && (
                <div className="flex justify-between">
                  <span>
                    Discount ({tx.discountPct}% 
                    {tx.discountType ? ` ${tx.discountType.toUpperCase()}` : ""}
                    {tx.couponCode ? ` + ${tx.couponCode.toUpperCase()}` : ""})
                  </span>
                  <span>-₱{(tx.discountAmt ?? 0).toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₱{(tx.total ?? 0).toFixed(2)}</span>
              </div>

              {/* NEW: Amount Tendered (defensive) */}
              <div className="flex justify-between">
                <span>Amount Tendered:</span>
                <span>₱{tenderedVal.toFixed(2)}</span>
              </div>

              {/* Change (only show if present) */}
              {changeVal !== undefined && (
                <div className="flex justify-between font-bold text-green-700">
                  <span>Change:</span>
                  <span>₱{changeVal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Show Receipt Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Show Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal
          transaction={tx}
          shopDetails={shopDetails}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
