// src/components/modals/VoidPasswordModal.jsx
import React, { useState, useEffect } from "react";

export default function VoidPasswordModal({
  isOpen,
  onClose,
  onConfirm
}) {
  const [passwordValue, setPasswordValue] = useState("");

  useEffect(() => {
    if (!isOpen) setPasswordValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
        <h2 className="text-xl font-bold mb-3 text-red-800">Manager Authentication</h2>
        <p className="text-sm mb-3">Enter manager password to continue.</p>

        <input
          type="password"
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="Enter manager password"
          className="w-full border rounded p-2 mb-4"
        />

        <div className="flex justify-around">
          <button
            onClick={() => { setPasswordValue(""); onClose && onClose(); }}
            className="bg-gray-200 px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm && onConfirm(passwordValue);
              // do not auto-close here — caller decides (to allow showing reason modal or final confirmation)
            }}
            className="bg-red-800 text-white px-6 py-2 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
