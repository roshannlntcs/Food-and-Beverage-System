import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Get full name from localStorage
    const storedName = localStorage.getItem("fullName");
    if (storedName) {
      setFullName(storedName);
    }
  }, []);

  const handleContinue = () => {
    if (selectedRole === "admin") {
      navigate("/admin/home");
    } else if (selectedRole === "user") {
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
      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative z-10 bg-white p-10 rounded-xl shadow-lg w-[500px] text-center">
        {/* Display User's Full Name */}
        {fullName && (
          <>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Welcome, <span className="text-yellow-500">{fullName}</span>!
            </h2>

            {/* Profile Picture Icon */}
            <div className="flex justify-center mb-6">
              <FaUserCircle className="text-gray-400" size={80} />
            </div>
          </>
        )}

        <h1 className="text-2xl font-semibold mb-8">Please select your role</h1>

        <div className="flex justify-center gap-6 mb-8">
          {/* Admin Role */}
          <div
            onClick={() => setSelectedRole("admin")}
            className={`group cursor-pointer w-28 h-28 rounded-xl flex flex-col items-center justify-center border-2 text-sm font-medium transform transition-all duration-300 ${
              selectedRole === "admin"
                ? "bg-[#f9f5ec] border-yellow-500 shadow-md text-[#FFC72C]"
                : "bg-[#f9f5ec] border-gray-300 text-gray-700 hover:border-yellow-400 hover:shadow-lg hover:scale-105 hover:text-[#FFC72C]"
            }`}
          >
            <i
              className={`fas fa-wrench text-2xl mb-2 transition-colors ${
                selectedRole === "admin"
                  ? "text-[#FFC72C]"
                  : "text-gray-500 group-hover:text-[#FFC72C]"
              }`}
            />
            <span
              className={`transition-colors ${
                selectedRole === "admin"
                  ? "text-[#FFC72C]"
                  : "group-hover:text-[#FFC72C]"
              }`}
            >
              ADMIN
            </span>
          </div>

          {/* User Role */}
          <div
            onClick={() => setSelectedRole("user")}
            className={`group cursor-pointer w-28 h-28 rounded-xl flex flex-col items-center justify-center border-2 text-sm font-medium transform transition-all duration-300 ${
              selectedRole === "user"
                ? "bg-[#f9f5ec] border-yellow-500 shadow-md text-[#FFC72C]"
                : "bg-[#f9f5ec] border-gray-300 text-gray-700 hover:border-yellow-400 hover:shadow-lg hover:scale-105 hover:text-[#FFC72C]"
            }`}
          >
            <i
              className={`fas fa-user text-2xl mb-2 transition-colors ${
                selectedRole === "user"
                  ? "text-[#FFC72C]"
                  : "text-gray-500 group-hover:text-[#FFC72C]"
              }`}
            />
            <span
              className={`transition-colors ${
                selectedRole === "user"
                  ? "text-[#FFC72C]"
                  : "group-hover:text-[#FFC72C]"
              }`}
            >
              USER
            </span>
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
