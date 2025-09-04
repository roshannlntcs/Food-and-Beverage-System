import React, { useState } from "react";

const SuperAdminPasswordModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (password === "123456") {
      setError("");
      onConfirm();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[101]">
      <div className="bg-white rounded-lg p-4 w-[300px] shadow-md">
        <div className="flex flex-col items-center">
          {/* Title */}
          <h2 className="text-sm font-semibold">System Admin Password</h2>
          <p className="text-xs text-gray-600 mt-1 text-center leading-snug">
            Please enter the System admin password to continue.
          </p>

          {/* Input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border rounded px-2 py-1 mt-3 w-full text-sm"
            placeholder="Enter password"
            autoFocus
          />

          {/* Error */}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full bg-black text-white hover:bg-gray-800 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPasswordModal;
