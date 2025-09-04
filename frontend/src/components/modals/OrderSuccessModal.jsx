// src/components/modals/OrderSuccessModal.jsx
import React from "react";

export default function OrderSuccessModal({ show, paymentSummary, onClose, onPrintReceipt }) {
  if (!show) return null;

  const summaryRows = [];
  if (!paymentSummary) {
    summaryRows.push(["Method", "N/A"]);
  } else {
    const method = paymentSummary.method || "N/A";
    summaryRows.push(["Method", method]);

    // Determine tendered: prefer explicit, otherwise if Card/QRS assume exact amount from total
    let tenderedVal = paymentSummary.tendered;
    if ((tenderedVal === undefined || tenderedVal === null) && (method === "Card" || method === "QRS")) {
      tenderedVal = paymentSummary.total !== undefined ? Number(paymentSummary.total) : undefined;
    }

    if (tenderedVal !== undefined && tenderedVal !== null) {
      summaryRows.push(["Tendered", `₱${Number(tenderedVal).toFixed(2)}`]);
    }

    if (paymentSummary.change !== undefined && paymentSummary.change !== null) {
      summaryRows.push(["Change", `₱${Number(paymentSummary.change).toFixed(2)}`]);
    }

    if (paymentSummary.cardNumberMasked) summaryRows.push(["Card", paymentSummary.cardNumberMasked]);
    if (paymentSummary.authCode) summaryRows.push(["Auth", paymentSummary.authCode]);
    if (paymentSummary.reference) summaryRows.push(["Reference", paymentSummary.reference]);
    // payload intentionally omitted for brevity
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Order Complete</h3>
          <button onClick={() => onClose && onClose()} className="text-gray-600">✕</button>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-700">Payment Summary</div>
          <div className="bg-gray-50 p-3 rounded mt-2">
            {summaryRows.map((r, i) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <div className="text-gray-600">{r[0]}</div>
                <div className="font-semibold break-words text-right">{r[1]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => onClose && onClose()} className="px-3 py-2 rounded border">Close</button>
          <button onClick={() => onPrintReceipt && onPrintReceipt()} className="px-4 py-2 rounded bg-[#800000] text-white">Print Receipt</button>
        </div>
      </div>
    </div>
  );
}
