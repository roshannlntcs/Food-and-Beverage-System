import React, { useEffect } from "react";

export default function ValidationErrorModal({ message, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
      
      if (e.key === "Escape") {
        e.stopPropagation(); 
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Validation Error</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full"
        >
          OK
        </button>
      </div>
    </div>
  );
}
