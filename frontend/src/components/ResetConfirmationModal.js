// src/components/ResetConfirmationModal.js
import React from "react";

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm, warningText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg text-center">
        {/* Centered red icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white text-lg font-bold">!</span>
          </div>
        </div>

        <p className="mb-6 text-sm">{warningText}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-yellow-500 text-black rounded-full px-5 py-1.5 hover:bg-yellow-600 font-semibold transition"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-black text-white rounded-full px-5 py-1.5 hover:bg-gray-800 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmationModal;
