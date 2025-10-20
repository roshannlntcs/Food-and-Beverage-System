import React, { useEffect, useMemo, useState } from "react";
import images from "../../utils/images";
import ChangePasswordModal from "./ChangePasswordModal"; // Import the new modal

const DEFAULT_AVATAR = images["avatar-ph.png"];

export default function ProfileModal({
  show,
  userName,
  schoolId,
  avatarUrl,
  onClose,
  onSwitchRole,
  onSignOut,
  analytics,
  onAvatarUpload,
  onChangePassword, // Add this prop
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setPreviewUrl(null);
  }, [avatarUrl, show]);

  const {
    totalSold,
    totalRevenue,
    totalTransactions,
    totalVoids,
    avgPerTransaction,
    bestSeller,
  } = useMemo(() => {
    const summary = analytics || {};
    return {
      totalSold: Number(summary.totalSold || 0),
      totalRevenue: Number(summary.totalRevenue || 0),
      totalTransactions: Number(summary.totalTransactions || 0),
      totalVoids: Number(summary.totalVoids || 0),
      avgPerTransaction: Number(summary.avgPerTransaction || 0),
      bestSeller: summary.bestSeller || null,
    };
  }, [analytics]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }),
    []
  );

  const bestSellerName = bestSeller?.name || "";
  const bestSellerQty = Number(bestSeller?.qty ?? bestSeller?.ordersToday ?? 0);
  const hasBestSeller = bestSellerName && bestSellerQty > 0 && totalSold > 0;

  const displayAvatar = previewUrl || avatarUrl || DEFAULT_AVATAR;

  const handleProfilePicChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await onAvatarUpload?.(file);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-[460px] border border-[#800000]">
          {/* Profile Section */}
          <div className="text-center mb-6">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={displayAvatar}
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
                <span className="text-xs font-bold">Edit</span>
              </label>
            </div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-gray-600">School ID: {schoolId}</p>
          </div>

          {/* Analytics Section */}
          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold text-center mb-4">Today's Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xl font-bold text-[#800000]">{totalSold}</p>
                <p className="text-xs text-gray-600">Items Sold</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xl font-bold text-[#800000]">
                  {currencyFormatter.format(totalRevenue)}
                </p>
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
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">Avg. per Transaction</p>
                <p className="text-lg font-semibold">
                  {currencyFormatter.format(avgPerTransaction)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">Best Seller</p>
                <p className="font-semibold text-sm">
                  {hasBestSeller ? bestSellerName : "No items sold yet"}
                </p>
                {hasBestSeller && (
                  <p className="text-xs text-gray-500">Sold {bestSellerQty} today</p>
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
              onClick={() => setShowChangePassword(true)}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
            >
              Change Password
            </button>
            <button
              onClick={() => {
                if (typeof onSwitchRole === "function") {
                  onSwitchRole();
                }
              }}
              className="flex-1 bg-yellow-400 py-2 rounded-lg font-semibold border border-yellow-500 hover:bg-yellow-500"
            >
              Switch Role
            </button>
            <button
              onClick={() => {
                if (typeof onSignOut === "function") {
                  onSignOut();
                }
              }}
              className="flex-1 bg-red-800 text-white py-2 rounded-lg font-semibold hover:bg-red-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onChangePassword={onChangePassword}
      />
    </>
  );
}