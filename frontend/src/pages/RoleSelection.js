import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaCashRegister } from "react-icons/fa";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    if (storedName) {
      setFullName(storedName);
    }
  }, []);

  const handleContinue = () => {
    if (selectedRole === "admin") {
      navigate("/admin/home");
    } else if (selectedRole === "cashier") {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        navigate("/user");
      } else {
        navigate("/user-login");
      }
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/b.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white p-10 rounded-xl shadow-lg w-[500px] text-center">
        {/* Hello, [Name] (centered at top, bigger font) */}
        {fullName && (
          <h1 className="text-2xl font-bold text-gray-700 mb-6">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        {/* Profile Picture Icon */}
        <div className="flex justify-center mb-6">
          <FaUserCircle className="text-gray-400" size={80} />
        </div>

        {/* Subtitle smaller */}
        <h2 className="text-lg font-medium mb-6 text-gray-800">
          Please select your role
        </h2>

        {/* Roles */}
        <div className="flex justify-center gap-12 mb-6">
          <div
            onClick={() => setSelectedRole("admin")}
            className={`cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "admin"
                ? "text-[#FFC72C]"
                : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <i
              className={`fas fa-wrench text-3xl mb-2 ${
                selectedRole === "admin" ? "text-[#FFC72C]" : "text-gray-500"
              }`}
            />
            <span className="font-medium">ADMIN</span>
          </div>

          <div
            onClick={() => setSelectedRole("cashier")}
            className={`cursor-pointer w-28 h-28 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
              selectedRole === "cashier"
                ? "text-[#FFC72C]"
                : "text-gray-700 hover:text-[#FFC72C]"
            }`}
          >
            <FaCashRegister
              size={30}
              className={`mb-2 ${
                selectedRole === "cashier" ? "text-[#FFC72C]" : "text-gray-500"
              }`}
            />
            <span className="font-medium">CASHIER</span>
          </div>
        </div>

        {/* Buttons */}
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
