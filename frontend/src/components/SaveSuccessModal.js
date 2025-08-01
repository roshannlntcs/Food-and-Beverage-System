import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

const SaveSuccessModal = ({ onClose }) => {
 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); 
        onClose();          
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-lg flex flex-col items-center p-6 space-y-4">
        <FaCheckCircle className="text-green-500 text-5xl" />
        <p className="text-lg font-semibold text-center">
          Supplier added successfully!
        </p>
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

export default SaveSuccessModal;
