import React from "react";

export default function VoidPasswordModal({
  isOpen,
  passwordValue,
  onPasswordChange,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-800">Manager Password</h2>
        <input
          type="password"
          value={passwordValue}
          onChange={e => onPasswordChange(e.target.value)}
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
            onClick={onConfirm}
            className="bg-red-800 text-white px-6 py-2 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
