// src/components/modals/ProfileModal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import images from "../../utils/images";
import { useInventory } from "../../contexts/InventoryContext";

export default function ProfileModal({ show, userName, schoolId, onClose, onClearLogs }) {
  const navigate = useNavigate();
  const { inventory = [] } = useInventory();

  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || images["avatar-ph.png"]
  );

  // Analytics states
  const [totalSold, setTotalSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalVoids, setTotalVoids] = useState(0);
  const [avgPerTransaction, setAvgPerTransaction] = useState(0);
  const [bestSeller, setBestSeller] = useState(null);

  useEffect(() => {
    let sold = 0;
    let revenue = 0;
    let bestItem = null;

    inventory.forEach(item => {
      const orders = item.ordersToday || 0;
      sold += orders;
      revenue += orders * (item.price || 0);
      if (!bestItem || orders > (bestItem.ordersToday || 0)) {
        bestItem = item;
      }
    });

    setTotalSold(sold);
    setTotalRevenue(revenue);
    setBestSeller(bestItem);

    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    setTotalTransactions(transactions.length);

    const voidLogs = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    setTotalVoids(voidLogs.length);

    setAvgPerTransaction(transactions.length > 0 ? revenue / transactions.length : 0);
  }, [inventory]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setProfilePic(preview);
      localStorage.setItem("profilePic", preview);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[460px] border border-[#800000]">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <img
              src={profilePic}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-300"
            />
            <label className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-2 cursor-pointer hover:bg-yellow-500">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <span className="text-xs font-bold">✎</span>
            </label>
          </div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-gray-600">School ID: {schoolId}</p>
        </div>

        {/* Analytics Section */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold text-center mb-4">Today’s Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xl font-bold text-[#800000]">{totalSold}</p>
              <p className="text-xs text-gray-600">Items Sold</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xl font-bold text-[#800000]">₱{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Total Revenue</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xl font-bold text-[#800000]">{totalTransactions}</p>
              <p className="text-xs text-gray-600">Transactions</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xl font-bold text-[#800000]">{totalVoids}</p>
              <p className="text-xs text-gray-600">Voids</p>
            </div>
            {/* Side by side row */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600">Avg. per Transaction</p>
              <p className="text-lg font-semibold">₱{avgPerTransaction.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600">Best Seller</p>
              <p className="font-semibold text-sm">{bestSeller ? bestSeller.name : "—"}</p>
              {bestSeller && (
                <p className="text-xs text-gray-500">
                  Sold {bestSeller.ordersToday} today
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (typeof onClearLogs === "function") {
                onClearLogs();
              } else {
                if (window.confirm("Clear ALL logs? This is irreversible.")) {
                  try {
                    localStorage.setItem("orders", "[]");
                    localStorage.setItem("transactions", "[]");
                    localStorage.setItem("voidLogs", "[]");
                    alert("Logs cleared (local fallback).");
                  } catch (e) {
                    console.error(e);
                    alert("Failed to clear logs.");
                  }
                }
              }
            }}
            className="flex-1 bg-yellow-400 py-2 rounded-lg font-semibold border border-yellow-500 hover:bg-yellow-500"
          >
            Clear Logs
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("userName");
              localStorage.removeItem("schoolId");
              navigate("/roles");
            }}
            className="flex-1 bg-red-800 text-white py-2 rounded-lg font-semibold hover:bg-red-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
