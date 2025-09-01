// src/components/modals/VoidReasonModal.jsx
import React, { useEffect, useState } from "react";

/**
 * VoidReasonModal
 * Props:
 *  - isOpen: boolean
 *  - voidContext: { type: 'transaction'|'item', tx: TransactionObject, index: number|null }
 *  - onClose: () => void
 *  - onSubmit: (reason:string) => void
 *
 * This shows the transaction (or item) details and asks for a reason.
 */
export default function VoidReasonModal({
  isOpen,
  voidContext = {},
  onClose,
  onSubmit
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  const { type, tx, index } = voidContext || {};
  const displayTx = tx || null;

  const renderItemRow = (it, idx) => (
    <div key={idx} className="py-2 border-b last:border-b-0">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{it.name} {it.size?.label ? `(${it.size.label})` : ""}</div>
          <div className="text-sm text-gray-600">{(it.selectedAddons || []).map(a => a.label).join(", ")} {it.notes ? ` — ${it.notes}` : ""}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">₱{(it.totalPrice ?? ( (it.price || 0) * (it.quantity || 1))).toFixed(2)}</div>
          <div className="text-sm text-gray-600">{it.quantity}×</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-800">Void Reason & Details</h2>
          <button onClick={() => onClose && onClose()} className="text-gray-500">Close</button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-700 mb-2">Action: <strong>{type === "transaction" ? "Void Transaction" : "Void Item"}</strong></div>

          {displayTx ? (
            <div className="border rounded p-3 text-sm bg-gray-50">
              <div className="mb-2"><strong>Transaction ID:</strong> {displayTx.transactionID || displayTx.id}</div>
              <div className="mb-2"><strong>Cashier:</strong> {displayTx.cashier || '—'}</div>
              <div className="mb-2"><strong>Date:</strong> {displayTx.date || '—'}</div>

              <div className="mb-2">
                <strong>Items:</strong>
                <div className="mt-2 space-y-2">
                  {displayTx.items && displayTx.items.length
                    ? displayTx.items.map((it, idx) => {
                        // if voiding single item, highlight the selected index/item
                        if (type === "item" && idx === index) {
                          return (
                            <div key={idx} className="p-2 bg-white rounded shadow-sm">
                              {renderItemRow(it, idx)}
                              <div className="text-sm text-red-700 font-semibold mt-1">This item will be voided</div>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="p-2 bg-white rounded shadow-sm">
                            {renderItemRow(it, idx)}
                          </div>
                        );
                      })
                    : <div className="text-sm text-gray-600">No items found</div>
                  }
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <div>Subtotal</div><div>₱{(displayTx.subtotal || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>Tax</div><div>₱{(displayTx.tax || 0).toFixed(2)}</div>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <div>Total</div><div>₱{(displayTx.total || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No transaction selected. Please select a transaction first.</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Reason for void</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for voiding (required)"
            className="w-full border rounded p-2 h-28 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => onClose && onClose()} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={() => {
              const trimmed = (reason || "").trim();
              if (!trimmed) { alert("Please enter a reason for voiding."); return; }
              onSubmit && onSubmit(trimmed); // caller will show final auth
            }}
            className="px-4 py-2 bg-red-800 text-white rounded"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
