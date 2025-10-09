import React, { useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const DeleteConfirmModal = ({ itemName = "this item", onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-2xl shadow-lg p-6 text-center">
        {/* Red circle with white trashcan icon */}
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#8B0000] flex items-center justify-center">
          <FaTrash className="text-white text-xl" aria-hidden="true" />
        </div>

        {/* Message */}
        <p className="text-sm text-gray-800 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold">“{itemName}”</span>? <br />This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={onConfirm}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-full"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-black text-white font-bold px-6 py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
