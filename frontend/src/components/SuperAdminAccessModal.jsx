import React, { useState } from "react";

const SuperAdminAccessModal = ({ onClose, onConfirm }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#bfb8b8] bg-opacity-70 z-[100]">
      <div className="bg-white rounded-lg p-4 w-[500px] shadow-md">
        {/* Icon */}
        <div className="flex w-full justify-center mb-2">
          <div className="bg-red-800 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-center">System Admin Access</h2>

        {/* Description */}
        <p className="text-xs text-gray-600 mt-2 text-center leading-snug">
          <strong>Note:</strong> A system admin is a user who has complete
          access to all control. A System Administrator can add users, delete
          all transactions, logs and reset all data. Are you sure you want to
          continue?
        </p>

        {/* Toggle + Buttons in one row */}
        <div className="flex items-center justify-between mt-4">
          {/* Toggle Switch */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setEnabled(!enabled)}
          >
            <div
              className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                enabled ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-xs">Switch to System Admin Access</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={!enabled}
              className={`px-4 py-1 rounded-full text-xs font-medium transition-colors ${
                enabled
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 rounded-full text-xs font-medium bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAccessModal;
