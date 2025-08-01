// components/ModalWrapper.jsx
import React from "react";

export default function ModalWrapper({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className={`${className} bg-white rounded-lg shadow-xl p-6`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}