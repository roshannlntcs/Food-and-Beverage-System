// src/components/modals/CashPaymentModal.jsx
import React, { useState, useEffect } from "react";

/**
 * CashPaymentModal
 * Props:
 * - isOpen (bool)
 * - total (number)
 * - onClose (fn)
 * - onSuccess ({ method: "Cash", tendered, change }) => fn
 */
export default function CashPaymentModal({ isOpen, total = 0, onClose, onSuccess }) {
  const [tendered, setTendered] = useState("");
  const [error, setError] = useState("");
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTendered("");
      setChange(0);
      setError("");
    } else {
      // when opened, focus numeric input after short delay (if UI needs)
      setTimeout(() => {
        const el = document.getElementById("cash-tender-input");
        if (el) el.focus();
      }, 120);
    }
  }, [isOpen]);

  const calcChange = (val) => {
    const n = parseFloat(val || 0);
    if (isNaN(n)) return 0;
    return +(n - total).toFixed(2);
  };

  const handleInput = (v) => {
    setError("");
    setTendered(v);
    setChange(calcChange(v));
  };

  const applyQuick = (amt) => {
    const newVal = (parseFloat(tendered || 0) + amt).toFixed(2);
    handleInput(newVal);
  };

  const handleKeypad = (digit) => {
    // simple numeric keypad behavior, append digits, keep 2 decimals
    let cur = (tendered || "").toString();
    if (digit === "C") {
      cur = "";
    } else if (digit === "<") {
      cur = cur.slice(0, -1);
    } else {
      cur = cur + digit;
    }
    // limit to valid number with at most 2 decimals
    const cleaned = cur.replace(/[^\d.]/g, "");
    // only allow one dot
    const parts = cleaned.split(".");
    const formatted =
      parts.length <= 1
        ? parts[0]
        : parts[0] + "." + parts[1].slice(0, 2); // limit decimals to 2
    handleInput(formatted);
  };

  const submit = () => {
    const n = parseFloat(tendered);
    if (isNaN(n) || n <= 0) {
      setError("Please enter a valid cash amount.");
      return;
    }
    if (n < total - 0.0001) {
      setError("Tendered amount is less than the total.");
      return;
    }
    const ch = calcChange(n);
    setChange(ch);
    onSuccess && onSuccess({ method: "Cash", tendered: n, change: ch });
    onClose && onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cash Payment</h3>
          <button
            onClick={() => { onClose && onClose(); }}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 border rounded p-3 bg-gray-50">
          <div className="text-sm text-gray-600">Amount Due</div>
          <div className="text-2xl font-bold">₱{Number(total || 0).toFixed(2)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-600">Tendered</label>
            <input
              id="cash-tender-input"
              type="text"
              inputMode="decimal"
              value={tendered}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="0.00"
              className="w-full border rounded p-2 text-lg"
            />
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>
          <div className="flex flex-col justify-between">
            <div className="text-xs text-gray-600">Change</div>
            <div className="text-lg font-semibold">₱{Math.max(0, change).toFixed(2)}</div>
          </div>
        </div>

        {/* Quick tender buttons */}
        <div className="mb-3 flex flex-wrap gap-2">
          {[20, 50, 100, 200, 500, 1000].map(b => (
            <button
              key={b}
              onClick={() => applyQuick(b)}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              +₱{b}
            </button>
          ))}
          <button
            onClick={() => handleInput(Number(total).toFixed(2))}
            className="px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-sm ml-auto"
            title="Quick exact"
          >
            Exact
          </button>
        </div>

        {/* Numeric keypad for tactile feel */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {["1","2","3","4","5","6","7","8","9",".","0","<"].map(k => (
            <button
              key={k}
              onClick={() => handleKeypad(k)}
              className="py-3 rounded bg-gray-100 hover:bg-gray-200 text-lg font-medium"
            >
              {k === "<" ? "⌫" : k}
            </button>
          ))}
          <button
            onClick={() => handleKeypad("C")}
            className="col-span-3 py-2 rounded bg-red-100 hover:bg-red-200 text-sm"
          >
            Clear
          </button>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={() => { onClose && onClose(); }} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-green-600 text-white font-semibold">Confirm Payment</button>
        </div>
      </div>
    </div>
  );
}
