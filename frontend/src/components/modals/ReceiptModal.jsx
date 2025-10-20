// src/components/modals/ReceiptModal.jsx
import React from "react";
import { shopDetails as defaultShopDetails } from "../../utils/data";

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

export default function ReceiptModal({
  transaction,
  onClose,
  shopDetails = defaultShopDetails,
}) {
  if (!transaction) return null;

  const pd = transaction.paymentDetails || {};

  const formatMoney = (v) => {
    if (v === undefined || v === null) return null;
    const n = Number(v);
    if (Number.isNaN(n)) return null;
    return `₱${n.toFixed(2)}`;
  };

  const methodRaw = (transaction.method || pd.method || "N/A").toString();
  const method = methodRaw.charAt(0).toUpperCase() + methodRaw.slice(1);

  // Tendered logic:
  const tenderedRaw = transaction.tendered ?? pd.tendered ?? ((method.toLowerCase() === "card" || method.toLowerCase() === "qrs" || method.toLowerCase() === "qr") ? transaction.total : undefined);
  const tenderedDisplay = formatMoney(tenderedRaw);

  // Change logic:
  const changeRaw = transaction.change ?? pd.change;
  const changeDisplay = formatMoney(changeRaw);

  // Card details
  const cardMasked = pd.cardNumberMasked || pd.cardMask || null;
  const authCode = pd.authCode || pd.authorization || null;

  // QR details
  const qRef = pd.reference || pd.txRef || pd.processorReference || null;

  // Processor ref
  const processorRef = pd.processorReference || pd.processorRef || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center print:bg-transparent">
      {/* Screen overlay (hidden in print via CSS below) */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Receipt card */}
      <div className="printable-receipt bg-white w-80 max-h-[90vh] rounded-xl flex flex-col p-4 shadow print:shadow-none print:w-full print:max-h-full z-50">
        {/* Inline print styles ensure only the receipt prints */}
        <style>{`
  @media print {
    body * {
      visibility: hidden !important;
    }
    .printable-receipt, .printable-receipt * {
      visibility: visible !important;
    }
    .printable-receipt {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      width: 76mm !important;   /* keeps your same w-80 width */
    }
    .printable-receipt + *, .print-hidden {
      display: none !important;
    }
    @page {
      size: 90mm 205mm;   /* Japanese Envelope Chou #4 */
      margin: 4mm;        /* small padding so edges don’t cut */
    }
  }
`}</style>

        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold">{shopDetails?.name}</h2>
          <p className="text-xs">{shopDetails?.address}</p>
          <p className="text-xs">{shopDetails?.contact}</p>
        </div>

        {/* Transaction Info */}
        <div className="text-xs mb-2">
          <div>Transaction ID: {transaction.transactionID}</div>
          <div>Date: {transaction.date}</div>
          <div>Cashier: {transaction.cashier}</div>
          <div>Payment Method: {method}</div>
        </div>

        {/* Items List */}
        <div className="border-t border-b py-2 mb-2 space-y-2 text-xs overflow-auto">
          {Array.isArray(transaction.items) && transaction.items.map((item, idx) => {
            const base = item.price ?? 0;
            const sizeUp = item.size?.price ?? 0;
            const selectedAddons = item.selectedAddons || [];
            const addonsTotal = selectedAddons.reduce((a, x) => a + (x.price || 0), 0);
            const addonNames = selectedAddons.map(a => a.label).join(", ") || "";
            const qty = item.quantity || 1;
            const lineTotal = (base + sizeUp + addonsTotal) * qty;
            const specialInstructions = collectSpecialInstructions(item);

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="truncate">{item.name}{item.size?.label ? ` (${item.size.label})` : ""} x{qty}</span>
                  <span>₱{lineTotal.toFixed(2)}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between pl-2">
                    <span className="truncate">Add-ons: {addonNames}</span>
                    <span>₱{addonsTotal.toFixed(2)}</span>
                  </div>
                )}
                {specialInstructions && (
                  <div className="pl-2 italic text-xs">
                    Special Instructions: {specialInstructions}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals */}
<div className="text-xs space-y-0.5">
  <div className="flex justify-between">
    <span>Subtotal:</span>
    <span>₱{(transaction.subtotal ?? 0).toFixed(2)}</span>
  </div>
  <div className="flex justify-between">
    <span>Tax (12%):</span>
    <span>₱{(transaction.tax ?? 0).toFixed(2)}</span>
  </div>

  {transaction.discountPct > 0 && (
    <>
      <div className="flex justify-between">
        <span>
          Discount: {transaction.discountType ? transaction.discountType : ""} {""}
          ({transaction.discountPct}%{""})
        </span>
        <span>-₱{(transaction.discountAmt ?? 0).toFixed(2)}</span>
      </div>

      {/* NEW: Show coupon code if used */}
      {transaction.couponCode && (
        <div className="flex justify-between text-gray-700">
          <span>Coupon Code:</span>
          <span>{transaction.couponCode}</span>
        </div>
      )}
    </>
  )}

  <div className="border-t my-1"></div>
  <div className="flex justify-between font-bold text-sm">
    <span>Total:</span>
    <span>₱{(transaction.total ?? 0).toFixed(2)}</span>
  </div>


          {/* Payment-specific rows */}
          {/* Cash */}
          {method.toLowerCase() === "cash" && (
            <>
              {tenderedDisplay && (
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span>{tenderedDisplay}</span>
                </div>
              )}
              {changeDisplay && (
                <div className="flex justify-between font-bold text-green-700">
                  <span>Change:</span>
                  <span>{changeDisplay}</span>
                </div>
              )}
            </>
          )}

          {/* Card */}
          {method.toLowerCase() === "card" && (
            <>
              {tenderedDisplay && (
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span>{tenderedDisplay}</span>
                </div>
              )}
              {changeDisplay && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{changeDisplay}</span>
                </div>
              )}
              {cardMasked && (
                <div className="flex justify-between">
                  <span>Card:</span>
                  <span className="font-mono">{cardMasked}</span>
                </div>
              )}
              {authCode && (
                <div className="flex justify-between">
                  <span>Auth Code:</span>
                  <span className="font-mono">{authCode}</span>
                </div>
              )}
              {processorRef && (
                <div className="flex justify-between">
                  <span>Processor Ref:</span>
                  <span className="font-mono break-words">{processorRef}</span>
                </div>
              )}
            </>
          )}

          {/* QRS */}
          {(method.toLowerCase() === "qrs" || method.toLowerCase() === "qr" || method.toLowerCase() === "qrcode") && (
            <>
              {tenderedDisplay && (
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span>{tenderedDisplay}</span>
                </div>
              )}
              {changeDisplay && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{changeDisplay}</span>
                </div>
              )}
              {qRef && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono break-words">{qRef}</span>
                </div>
              )}
              {processorRef && !qRef && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono break-words">{processorRef}</span>
                </div>
              )}
            </>
          )}

          {/* Unknown method fallback */}
          {!(["cash","card","qrs","qrcode","qr"].includes(method.toLowerCase())) && (
            <>
              {tenderedDisplay && (
                <div className="flex justify-between">
                  <span>Amount Tendered:</span>
                  <span>{tenderedDisplay}</span>
                </div>
              )}
              {changeDisplay && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{changeDisplay}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Buttons (hidden in print by media query) */}
        <div className="flex justify-around mt-4 print:hidden">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-12 py-1 rounded-lg text-sm hover:bg-gray-400"
          >
            Done
          </button>
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-12 py-1 rounded-lg text-sm hover:bg-green-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
