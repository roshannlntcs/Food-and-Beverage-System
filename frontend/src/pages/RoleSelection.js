import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaWrench } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};

  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setFullName("");
      setAvatarUrl(null);
      return;
    }
    setFullName(currentUser.fullName || "");
    setAvatarUrl(currentUser.avatarUrl || "/lebron.png");
  }, [currentUser]);

  const handleContinue = () => {
    if (selectedRole === "admin") navigate("/admin/home");
    else if (selectedRole === "cashier") {
      if (currentUser) navigate("/user");
      else navigate("/user-login");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/b.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white p-10 rounded-xl shadow-lg w-[500px] text-center">
        {fullName && (
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        <div className="flex justify-center mb-6">
          <img
            src={avatarUrl || "/lebron.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-md"
          />
        </div>

        <h2 className="text-lg font-medium mb-6 text-gray-800">
          Please select your role
        </h2>

        <div className="flex justify-center gap-12 mb-6">
          <div
            onClick={() => setSelectedRole("admin")}
            className={`group cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "admin"
                ? "text-[#FFC72C]"
                : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <FaWrench
              size={30}
              className={`mb-2 transition-colors duration-300 ${
                selectedRole === "admin"
                  ? "text-[#FFC72C]"
                  : "text-gray-500 group-hover:text-[#FFC72C]"
              }`}
            />
            <span className="font-medium">ADMIN</span>
          </div>

          <div
            onClick={() => setSelectedRole("cashier")}
            className={`group cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "cashier"
                ? "text-[#FFC72C]"
                : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <FaCashRegister
              size={30}
              className={`mb-2 transition-colors duration-300 ${
                selectedRole === "cashier"
                  ? "text-[#FFC72C]"
                  : "text-gray-500 group-hover:text-[#FFC72C]"
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
              selectedRole
                ? "bg-[#FFC72C] hover:bg-yellow-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
