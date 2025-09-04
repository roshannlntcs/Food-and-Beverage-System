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

  // map of known discount types to labels
  const DISCOUNT_LABELS = {
    senior: "Senior Citizen (20%)",
    pwd: "PWD (20%)",
    student: "Student (5%)"
  };

  // pull coupon from likely places
  const getCoupon = (t) => {
    if (!t) return null;
    const raw =
      t.couponCode ||
      t.coupon ||
      (t.paymentDetails && (t.paymentDetails.coupon || t.paymentDetails.code)) ||
      t.couponCodeApplied ||
      null;
    return raw ? String(raw).trim().toUpperCase() : null;
  };

  // Items to show:
  // - transaction void => all items
  // - item void => only selected item(s) (here we show only the single selected index)
  const itemsToShow = (() => {
    if (!displayTx?.items?.length) return [];
    if (type === "item") {
      if (typeof index !== "number" || index < 0 || index >= displayTx.items.length) return [];
      return [displayTx.items[index]];
    }
    return displayTx.items;
  })();

  const renderItemRow = (it, idx) => (
    <div key={idx} className="py-2 border-b last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="pr-4">
          <div className="font-semibold text-sm">
            {it.name} {it.size?.label ? `(${it.size.label})` : ""}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {(it.selectedAddons || []).map(a => a.label).join(", ")}
            {it.notes ? ` — ${it.notes}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">
            ₱{((it.totalPrice ?? ((it.price || 0) * (it.quantity || 1))) || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{it.quantity}×</div>
        </div>
      </div>
    </div>
  );

  // read discount info from transaction (prefer explicit discountType if present)
  // read discount info from transaction
  const discountPct = (displayTx && typeof displayTx.discountPct === "number") ? displayTx.discountPct : null;
  const discountAmt = (displayTx && typeof displayTx.discountAmt === "number")
  ? displayTx.discountAmt
  : (discountPct != null && displayTx?.subtotal != null)
    ? +(displayTx.subtotal * discountPct / 100).toFixed(2)
    : null;

const rawDiscountType = displayTx?.discountType || displayTx?.discount || null;
const discountTypeLabel = rawDiscountType ? (DISCOUNT_LABELS[rawDiscountType] || rawDiscountType) : null;
const couponCode = getCoupon(displayTx);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000] p-4 overflow-auto">
      {/* Modal container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[100vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-red-800">Void Reason & Details</h2>
          <button
            onClick={() => onClose && onClose()}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-3 flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Top meta (non-scrollable) */}
          <div className="space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Action</div>
                <div className="font-bold">
                  {type === "transaction" ? "Transaction Void" : "Item Void"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Items shown</div>
                <div className="font-medium">{itemsToShow.length}</div>
              </div>
            </div>

            {displayTx ? (
              <div className="border rounded p-2 bg-gray-50 text-sm space-y-2">
                {/* THREE equal columns — each cell uses min-w-0 so truncation works and columns stay equal */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  {/* col 1 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Transaction ID</div>
                    <div className="font-medium truncate">{displayTx.transactionID || displayTx.id || "—"}</div>
                  </div>

                  {/* col 2 (CENTER column) - content centered so column sits visually and mathematically in the middle */}
                  <div className="min-w-0 flex flex-col items-center text-center">
                    <div className="text-xs text-gray-500">Subtotal</div>
                    <div className="font-medium truncate">₱{(displayTx.subtotal || 0).toFixed(2)}</div>
                  </div>

                  {/* col 3 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Discount Type</div>
                    <div className="font-medium truncate">{discountTypeLabel || "—"}</div>
                  </div>

                  {/* row 2, col 1 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Cashier</div>
                    <div className="font-medium truncate">{displayTx.cashier || "—"}</div>
                  </div>

                  {/* row 2, col 2 (center) */}
                  <div className="min-w-0 flex flex-col items-center text-center">
                    <div className="text-xs text-gray-500">Tax</div>
                    <div className="font-medium truncate">₱{(displayTx.tax || 0).toFixed(2)}</div>
                  </div>

                  {/* row 2, col 3 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Discount %</div>
                    <div className="font-medium truncate">
                      {discountPct != null
                      ? `${discountPct}% ${discountAmt ? `(-₱${discountAmt.toFixed(2)})` : ""}`
                      : "—"}
                      </div>
                      </div>

                  {/* row 3, col 1 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Date</div>
                    {/* keep date on one line */}
                    <div className="font-medium whitespace-nowrap">{displayTx.date || "—"}</div>
                  </div>

                  {/* row 3, col 2 (center) */}
                  <div className="min-w-0 flex flex-col items-center text-center">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="font-medium truncate">₱{(displayTx.total || 0).toFixed(2)}</div>
                  </div>

                  {/* row 3, col 3 */}
                  <div className="min-w-0 flex flex-col">
                    <div className="text-xs text-gray-500">Coupon</div>
                    <div className="font-medium">{couponCode || "—"}</div>
                  </div>
                </div>

                {/* If transaction void, show explicit notice */}
                {type === "transaction" && (
                  <div className="mt-3 text-sm text-red-700 font-semibold">
                    Note: This transaction will be voided.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No transaction selected. Please select a transaction first.</div>
            )}
          </div>

          {/* Items section (scrollable) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="text-sm font-semibold">Items</div>
              <div className="text-xs text-gray-500">{itemsToShow.length} item(s)</div>
            </div>

            <div className="border rounded flex-1 flex overflow-hidden">
              <div className="px-3 py-2 overflow-auto w-full">
                {itemsToShow && itemsToShow.length ? (
                  itemsToShow.map((it, idx) => {
                    // mark target when item-void
                    const isTarget = (type === "item") && (displayTx?.items?.[index] === it);
                    return (
                      <div
                        key={idx}
                        className={`p-2 mb-2 rounded ${isTarget ? "bg-white shadow-sm border-l-4 border-red-600" : "bg-white/80"}`}
                      >
                        {renderItemRow(it, idx)}
                        {isTarget && <div className="text-xs text-red-700 font-semibold mt-1">This item will be voided</div>}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-sm text-gray-600">No items found</div>
                )}
              </div>
            </div>
          </div>

          {/* Reason field */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-semibold mb-2">Reason for void</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for voiding (required)"
              className="w-full border rounded p-2 text-sm min-h-[90px] max-h-[220px] resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-3 border-t flex-shrink-0">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmed = (reason || "").trim();
              if (!trimmed) { alert("Please enter a reason for voiding."); return; }
              onSubmit && onSubmit(trimmed);
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
