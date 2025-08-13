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
      <div className="bg-white rounded-lg p-6 w-[550px] shadow-lg">
        <div className="flex flex-col items-center">
          {/* Red icon */}
          <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center mb-3">
            <span className="text-white text-lg font-bold">!</span>
          </div>

          <h2 className="text-lg font-semibold">Enter Super Admin Password</h2>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Please enter the Superadmin password to continue.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}  // <-- Added this
            className="border rounded px-3 py-2 mt-4 w-full"
            placeholder="Enter password"
            autoFocus
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
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
