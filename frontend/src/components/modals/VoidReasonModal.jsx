// src/components/modals/VoidReasonModal.jsx
import React, { useEffect, useState } from "react";

const DISCOUNT_LABELS = {
  senior: "Senior Citizen (20%)",
  pwd: "PWD (20%)",
  student: "Student (5%)",
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatMoney = (value) => pesoFormatter.format(Number(value || 0));

export default function VoidReasonModal({
  isOpen,
  voidContext = {},
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const { type, tx, index } = voidContext || {};
  const displayTx = tx || null;
  const items = Array.isArray(displayTx?.items) ? displayTx.items : [];

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setSelectedIndexes([]);
      return;
    }

    if (type === "item") {
      if (typeof index === "number" && index >= 0) {
        const target = items[index];
        if (target && !target?.voided) {
          setSelectedIndexes([index]);
        } else {
          setSelectedIndexes([]);
        }
      } else {
        setSelectedIndexes([]);
      }
    } else {
      setSelectedIndexes([]);
    }
  }, [isOpen, type, index, items]);

  if (!isOpen) return null;

  const toggleItem = (idx) => {
    setSelectedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const buildSelectedOrderItemIds = () => {
    if (type !== "item") return [];
    return selectedIndexes
      .map((idx) => {
        const item = items[idx];
        return item?.orderItemId ?? item?.id ?? null;
      })
      .filter((id) => id != null);
  };

  const getCoupon = (t) => {
    if (!t) return null;
    const raw =
      t.couponCode ||
      t.coupon ||
      (t.paymentDetails &&
        (t.paymentDetails.coupon || t.paymentDetails.code)) ||
      t.couponCodeApplied ||
      null;
    return raw ? String(raw).trim().toUpperCase() : null;
  };

  const discountPct =
    displayTx && typeof displayTx.discountPct === "number"
      ? displayTx.discountPct
      : null;
  const discountAmt =
    displayTx && typeof displayTx.discountAmt === "number"
      ? displayTx.discountAmt
      : discountPct != null && displayTx?.subtotal != null
      ? +(displayTx.subtotal * discountPct / 100).toFixed(2)
      : null;

  const rawDiscountType =
    displayTx?.discountType || displayTx?.discount || null;
  const discountTypeLabel = rawDiscountType
    ? DISCOUNT_LABELS[rawDiscountType] || rawDiscountType
    : null;
  const couponCode = getCoupon(displayTx);

  const handleSubmit = () => {
    const trimmed = (reason || "").trim();
    if (!trimmed) {
      alert("Please enter a reason for voiding.");
      return;
    }

    if (type === "item") {
      const ids = buildSelectedOrderItemIds();
      if (!ids.length) {
        alert("Select at least one item to void.");
        return;
      }
      onSubmit && onSubmit(trimmed, ids);
      return;
    }

    onSubmit && onSubmit(trimmed, []);
  };

  const renderItemRow = (item, idx) => {
    const alreadyVoided = Boolean(item?.voided);
    const transactionVoided = Boolean(displayTx?.voided);
    const isSelectable = type === "item" && !alreadyVoided && !transactionVoided;
    const isSelected = isSelectable && selectedIndexes.includes(idx);
    const selectionClasses = isSelectable && isSelected
      ? "bg-red-50 border-red-200"
      : "bg-white border-transparent";

    const numericLineTotal =
      item.totalPrice ?? (item.price || 0) * (item.quantity || 1);
  const lineTotal = Number(numericLineTotal || 0);

    return (
      <div
        key={item?.orderItemId ?? idx}
        className={`p-2 mb-2 rounded border ${isSelectable ? "cursor-pointer" : ""} ${selectionClasses}`}
        onClick={() => isSelectable && toggleItem(idx)}
      >
        <div className="flex items-start gap-3">
          {type === "item" && (
            <div className="pt-1">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={!isSelectable}
                onChange={(e) => {
                  e.stopPropagation();
                  if (isSelectable) toggleItem(idx);
                }}
                className="h-4 w-4"
              />
            </div>
          )}

          <div className="flex-1">
            <div
              className={`font-semibold text-sm ${
                alreadyVoided ? "line-through text-gray-500" : ""
              }`}
            >
              {item.name} {item.size?.label ? `(${item.size.label})` : ""}
            </div>
            <div
              className={`text-xs text-gray-600 mt-1 ${
                alreadyVoided ? "line-through text-gray-400" : ""
              }`}
            >
              {(item.selectedAddons || [])
                .map((addon) => (addon?.label ? addon.label : addon))
                .join(", ")}
              {item.notes ? ` - ${item.notes}` : ""}
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold text-sm">{formatMoney(lineTotal)}</div>
            <div className="text-xs text-gray-500">{item.quantity}x</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000] p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
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

        <div className="px-6 py-3 flex-1 flex flex-col gap-3 overflow-hidden">
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Action</div>
                <div className="font-bold">
                  {type === "transaction" ? "Transaction Void" : "Item Void"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Items available</div>
                <div className="font-medium">{items.length}</div>
              </div>
            </div>

            {displayTx ? (
              <div className="bg-white border rounded-lg p-3 shadow-sm text-sm space-y-2">
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-700">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-medium">
                      {displayTx.transactionID || displayTx.id || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatMoney(displayTx.subtotal || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Discount Type</span>
                    <span className="font-medium">{discountTypeLabel || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Cashier</span>
                    <span className="font-medium">{displayTx.cashier || "-"}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">VAT (12%)</span>
                    <span className="font-medium">{formatMoney(displayTx.tax || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Discount %</span>
                    <span className="font-medium">
                      {discountPct != null
                        ? `${discountPct}% ${
                            discountAmt
                              ? `(-${formatMoney(discountAmt || 0)})`
                              : ""
                          }`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium whitespace-nowrap">
                      {displayTx.date || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium">{formatMoney(displayTx.total || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Coupon</span>
                    <span className="font-medium">{couponCode || "-"}</span>
                  </div>
                </div>

                {type === "transaction" && (
                  <div className="mt-3 text-sm text-red-700 font-semibold">
                    Note: This transaction will be voided.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No transaction selected. Please select a transaction first.
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="text-sm font-semibold">Items</div>
              <div className="text-xs text-gray-500">{items.length} item(s)</div>
            </div>

            <div className="border rounded flex-1 flex overflow-hidden">
              <div className="px-3 py-1 overflow-auto w-full">
                {items.length ? (
                  items.map((item, idx) => renderItemRow(item, idx))
                ) : (
                  <div className="p-4 text-sm text-gray-600">No items found.</div>
                )}
              </div>
            </div>
          </div>

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

        <div className="flex justify-end gap-3 px-6 py-3 border-t flex-shrink-0">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-800 text-white rounded"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


