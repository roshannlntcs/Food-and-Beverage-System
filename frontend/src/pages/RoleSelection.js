// src/pages/RoleSelection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaWrench, FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};

  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState("");

  // Normalize "sex" -> "M" | "F" | null
  const normalizeSex = (val) => {
    if (!val || typeof val !== "string") return null;
    const v = val.trim().toLowerCase();
    if (v === "m" || v === "male") return "M";
    if (v === "f" || v === "female") return "F";
    return null;
  };

  // Derive once per render from source-of-truth user object
  const { sex, avatarUrl } = useMemo(() => {
    const localSex =
      typeof window !== "undefined" ? localStorage.getItem("sex") : null;
    const s = normalizeSex(currentUser?.sex) || normalizeSex(localSex);
    const genderAvatar = s === "M" ? "/male_user.png" : s === "F" ? "/female_user.png" : null;

    // avatarUrl wins, then gender fallback, then none
    return {
      sex: s,
      avatarUrl: currentUser?.avatarUrl || genderAvatar || null,
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFullName("");
      return;
    }
    setFullName(currentUser.fullName || "");
  }, [currentUser]);

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

      <div className="relative z-10 bg-white p-10 rounded-xl shadow-lg w-[500px] text-center">
        {fullName && (
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        {/* Avatar preview synced with AdminInfoDashboard2 */}
        <div className="flex justify-center mb-6">
          {avatarUrl ? (
            <div className="border-4 border-gray-300 rounded-full p-4 shadow-md flex items-center justify-center bg-white">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 object-contain -m-4"
              />
            </div>
          ) : (
            <div className="border-4 border-gray-300 rounded-full p-4 shadow-md flex items-center justify-center bg-white">
              <FaUser size={64} className="text-gray-500" />
            </div>
          )}
        </div>

        <h2 className="text-lg font-medium mb-6 text-gray-800">
          Please select your role
        </h2>

        <div className="flex justify-center gap-12 mb-6">
          <div
            onClick={() => setSelectedRole("admin")}
            className={`group cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "admin" ? "text-[#FFC72C]" : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <FaWrench
              size={30}
              className={`mb-2 transition-colors duration-300 ${
                selectedRole === "admin" ? "text-[#FFC72C]" : "text-gray-500 group-hover:text-[#FFC72C]"
              }`}
            />
            <span className="font-medium">ADMIN</span>
          </div>

          <div
            onClick={() => setSelectedRole("cashier")}
            className={`group cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "cashier" ? "text-[#FFC72C]" : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <FaCashRegister
              size={30}
              className={`mb-2 transition-colors duration-300 ${
                selectedRole === "cashier" ? "text-[#FFC72C]" : "text-gray-500 group-hover:text-[#FFC72C]"
              }`}
            />
            <span className="font-medium">CASHIER</span>
          </div>
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
