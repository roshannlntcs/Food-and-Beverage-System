// src/components/modals/DiscountModal.jsx
import React, { useState, useEffect } from "react";

export default function DiscountModal({
  isOpen,
  currentType,
  currentCoupon,
  onClose,
  onApply
}) {
  // Hooks at the top
  const [discountType, setDiscountType] = useState(currentType || "");
  const [couponCode, setCouponCode]     = useState(currentCoupon || "");

  // Sync with parent when opened
  useEffect(() => {
    if (!isOpen) return;
    setDiscountType(currentType || "");
    setCouponCode(currentCoupon || "");
  }, [isOpen, currentType, currentCoupon]);

  if (!isOpen) return null;

  // Compute final pct
  const computePct = () => {
    let pct = 0;
    if (discountType === "senior" || discountType === "pwd") pct += 20;
    else if (discountType === "student") pct += 5;

    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE10") pct += 10;
    if (code === "HALFOFF") pct += 50;
    if (code === "FIVEOFF") pct += 5;
    return pct;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Apply Discount</h2>
        <div className="space-y-2 mb-4">
          {[
            { key: "senior", label: "Senior Citizen (20%)" },
            { key: "pwd",    label: "PWD (20%)" },
            { key: "student",label: "Student (5%)" },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center">
              <input
                type="checkbox"
                checked={discountType === opt.key}
                onChange={() =>
                  setDiscountType(prev => prev === opt.key ? "" : opt.key)
                }
                className="mr-2"
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Coupon Code</label>
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            placeholder="SAVE10 / HALFOFF / FIVEOFF"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              onClose();
            }}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const pct = computePct();
              onApply(pct, discountType, couponCode.trim().toUpperCase());
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-800 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
