import React, { useEffect, useState } from "react";

export default function ManagerAuthModal({ isOpen, onClose, onConfirm }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIdentifier("");
      setPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2 text-center">
          Manager Authentication
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          A manager or superadmin must log in to approve the void.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              School ID / Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter manager credentials"
              className="w-full border rounded px-3 py-2 text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setIdentifier("");
              setPassword("");
              onClose && onClose();
            }}
            className="px-4 py-2 bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm && onConfirm({ identifier, password })}
            className="px-4 py-2 bg-red-800 text-white rounded text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
