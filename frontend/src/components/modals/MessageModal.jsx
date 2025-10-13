import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const MessageModal = ({ isOpen, onClose, title, message, type = "success" }) => {
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

  if (!isOpen) return null;

  const Icon =
    type === "error" ? (
      <FaExclamationCircle className="text-red-500 text-5xl" />
    ) : (
      <FaCheckCircle className="text-green-500 text-5xl" />
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-lg flex flex-col items-center p-6 space-y-4">
        {Icon}

        {title ? (
          <p className="text-lg font-semibold text-center">{title}</p>
        ) : null}

        {message ? (
          <p className="text-center text-gray-700">{message}</p>
        ) : null}

        <button
          onClick={onClose}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-full"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
