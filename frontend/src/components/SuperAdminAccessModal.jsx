import React, { useState } from "react";

const SuperAdminAccessModal = ({ onClose, onConfirm }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#bfb8b8] bg-opacity-70 z-[100]">
      <div className="bg-white rounded-lg p-6 w-[800px] shadow-lg">
        {/* Icon */}
        <div className="flex w-full justify-center mb-3">
          <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white text-lg font-bold">!</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center">System Admin Access</h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-2 text-center leading-relaxed">
          <strong>Note:</strong> A system admin is a user who has complete
          access to all control. A System Administrator can add users, delete
          all transactions, logs and reset all data. Are you sure you want to
          continue?
        </p>

        {/* Toggle + Buttons in one row */}
        <div className="flex items-center justify-between mt-6">
          {/* Toggle Switch */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setEnabled(!enabled)}
          >
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                enabled ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm">Switch to System Admin Access</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={!enabled}
              className={`px-5 py-1.5 rounded-full font-medium transition-colors ${
                enabled
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-full font-medium bg-black text-white hover:bg-gray-800"
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
