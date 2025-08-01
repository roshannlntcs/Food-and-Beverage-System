// VoidPasswordModal.jsx
import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";

export default function VoidPasswordModal({
  isOpen,
  passwordValue,
  onPasswordChange,
  onClose,
  onConfirm
}) {
  const [voidReason, setVoidReason] = useState("");

  if (!isOpen) return null;

  return (
  <ModalWrapper isOpen={isOpen} onClose={onClose} className="w-96 text-center">

        <h2 className="text-xl font-bold mb-2 text-red-800">Manager Password</h2>
        <textarea
          placeholder="Enter reason for voiding"
          value={voidReason}
          onChange={(e) => setVoidReason(e.target.value)}
          className="w-full p-2 border rounded mb-3 text-sm"
        />
        <input
          type="password"
          value={passwordValue}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-around">
          <button
            onClick={onClose}
            className="bg-gray-200 px-6 py-2 rounded-lg"
          >
            Cancel
            </button>
            <button
            onClick={() => onConfirm(passwordValue, voidReason)}
            className="bg-red-800 text-white px-6 py-2 rounded-lg"
          >
            Confirm
          </button>
          </div>
  </ModalWrapper>
  );
}