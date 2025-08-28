import React, { useEffect, useRef } from "react";

const ManageUsersModal = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Manage Users
        </h2>

        {/* Buttons (design you sent) */}
        <div className="flex flex-col gap-4">
          <button className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow hover:bg-blue-700 transition">
            ➕ Add User
          </button>

          <button className="bg-green-600 text-white px-4 py-3 rounded-xl shadow hover:bg-green-700 transition">
            📂 Upload CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;
