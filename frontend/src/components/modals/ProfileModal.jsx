// src/components/modals/ProfileModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import images from "../../utils/images";

export default function ProfileModal({ show, userName, schoolId, onClose, onClearLogs }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
        <img
          src={images["avatar-ph.png"]}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
        <h2 className="text-xl font-bold mb-2">User Profile</h2>
        <p><strong>Name:</strong> {userName}</p>
        <p className="mb-4"><strong>School ID:</strong> {schoolId}</p>

        <div className="flex justify-center space-x-3 mt-3">
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded font-semibold"
          >
            Close
          </button>

          <button
            onClick={() => {
              // call clear logs handler passed from parent (POSMain)
              // parent handles confirmation, backup and clearing.
              if (typeof onClearLogs === "function") {
                onClearLogs();
              } else {
                // fallback behavior if not provided
                if (window.confirm("Clear ALL orders, transactions, and void logs? This is irreversible. Continue?")) {
                  try {
                    localStorage.setItem('orders', '[]');
                    localStorage.setItem('transactions', '[]');
                    localStorage.setItem('voidLogs', '[]');
                    alert('Logs cleared (local fallback).');
                  } catch (e) {
                    console.error(e);
                    alert('Failed to clear logs.');
                  }
                }
              }
            }}
            className="bg-white border-2 border-[#800000] px-4 py-2 rounded font-semibold"
            title="Backup & clear orders, transactions, and void logs"
          >
            Clear Logs
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("userName");
              localStorage.removeItem("schoolId");
              navigate("/roles");
            }}
            className="bg-red-800 text-white px-4 py-2 rounded font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
