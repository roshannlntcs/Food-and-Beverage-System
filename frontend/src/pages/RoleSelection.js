import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === "admin") {
      navigate("/admin-login");
    } else if (selectedRole === "user") {
      navigate("/user-login");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/blur.png')", // Replace with your actual image filename
      }}
    >
      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative z-10 bg-white p-10 rounded-xl shadow-lg w-[600px] text-center">
        <h1 className="text-2xl font-semibold mb-8">Please select your role</h1>

        <div className="flex justify-center gap-6 mb-8">
          {/* Admin Role */}
          <div
           onClick={() => setSelectedRole("admin")}
              className={`cursor-pointer w-28 h-28 rounded-xl flex flex-col items-center justify-center border-2 text-sm font-medium transform transition-all duration-300 ${
                selectedRole === "admin"
                  ? "bg-[#F6EBCE] border-yellow-500 shadow-md"
                  : "bg-gray-100 border-gray-300 hover:bg-[#F6EBCE]  hover:border-yellow-400 hover:shadow-lg hover:scale-105"
              }`}
              >
           <i
                className={`fas fa-wrench text-2xl mb-2 transition-colors ${
                  selectedRole === "admin" ? "text-[#FFC72C]" : "text-gray-500"
                }`}
              />

            ADMIN
          </div>

          {/* User Role */}
          <div
            onClick={() => setSelectedRole("user")}
            className={`cursor-pointer w-28 h-28 rounded-xl flex flex-col items-center justify-center border-2 text-sm font-medium transform transition-all duration-300 ${
              selectedRole === "user"
                ? "bg-[#F6EBCE] border-yellow-500 shadow-md"
                : "bg-gray-100 border-gray-300 hover:bg-[#F6EBCE]  hover:border-yellow-400 hover:shadow-lg hover:scale-105"
            }`}
          >
           <i
              className={`fas fa-user text-2xl mb-2 transition-colors ${
                selectedRole === "user" ? "text-[#FFC72C]" : "text-gray-500"
              }`}
            />
            USER
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3">
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-10 py-2 rounded-full text-black font-medium transition ${
              selectedRole
                ? "bg-[#FFC72C] hover:bg-yellow-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => navigate("/")}
            className="px-12 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-black font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
