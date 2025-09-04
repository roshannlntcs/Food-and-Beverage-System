import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const MessageModal = ({ isOpen, onClose, title, message, type }) => {
  // ✅ Hook always runs, even if modal not visible
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null; // safe because hooks already executed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-lg flex flex-col items-center p-6 space-y-4">
        {/* Icon */}
        {type === "error" ? (
          <FaExclamationCircle className="text-red-500 text-5xl" />
        ) : (
          <FaCheckCircle className="text-green-500 text-5xl" />
        )}

        {/* Title */}
        <h2
          className={`text-lg font-bold text-center ${
            type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-700 text-center">{message}</p>

        {/* Button */}
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-full font-bold text-white ${
            type === "error"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
