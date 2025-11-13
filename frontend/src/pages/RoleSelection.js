// src/pages/RoleSelection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaWrench, FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import resolveUserAvatar from "../utils/avatarHelper";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};

  const [selectedRole, setSelectedRole] = useState(null);

  const resolvedAvatar = resolveUserAvatar(currentUser);
  const fullName = currentUser?.fullName || "";

  const handleContinue = () => {
    if (selectedRole === "admin") {
      navigate("/admin/home");
    } else if (selectedRole === "cashier") {
      if (currentUser) navigate("/user");
      else navigate("/user-login");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/b.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />

      <div className="relative z-10 bg-white px-8 py-9 rounded-2xl shadow-2xl w-full max-w-[440px] text-center">
        {fullName && (
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        <div className="flex justify-center mb-6">
          {resolvedAvatar ? (
            <div className="w-28 h-28 border-4 border-gray-200 rounded-full shadow-lg overflow-hidden bg-white transition-transform duration-300">
              <img
                src={resolvedAvatar}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-28 h-28 border-4 border-gray-200 rounded-full shadow-lg flex items-center justify-center bg-white">
              <FaUser size={60} className="text-gray-400" />
            </div>
          )}
        </div>

        <h2 className="text-lg font-medium mb-6 text-gray-800">Please select your role</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { id: "admin", label: "ADMIN", Icon: FaWrench },
            { id: "cashier", label: "CASHIER", Icon: FaCashRegister },
          ].map(({ id, label, Icon }) => {
            const active = selectedRole === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedRole(id)}
                className={`group w-full max-w-[150px] mx-auto h-28 sm:h-32 flex flex-col items-center justify-center rounded-2xl border transition-[box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 ${
                  active ? "bg-[#FFF8E1] border-yellow-400 shadow-xl" : "bg-white border-gray-200 hover:shadow-lg"
                }`}
                aria-pressed={active}
              >
                <Icon
                  size={32}
                  className={`mb-3 transition-colors duration-200 ${
                    active ? "text-[#FFC72C]" : "text-gray-500 group-hover:text-[#FFC72C]"
                  }`}
                />
                <span className="font-semibold tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-black text-sm font-medium transition"
          >
            Cancel
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-6 py-1.5 rounded-full text-sm text-black font-medium transition ${
              selectedRole ? "bg-[#FFC72C] hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
