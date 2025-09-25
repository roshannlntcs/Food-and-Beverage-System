import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaMale, FaFemale, FaWrench, FaUser } from "react-icons/fa";


export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    const storedSex = localStorage.getItem("sex"); // "M" or "F"
    if (storedName) setFullName(storedName);
    if (storedSex) setSex(storedSex);
  }, []);

  const handleContinue = () => {
    if (selectedRole === "admin") navigate("/admin/home");
    else if (selectedRole === "cashier") {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") navigate("/user");
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
        {/* Greeting */}
        {fullName && (
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        {/* Profile Icon */}
       {/* Profile Icon */}
<div className="flex justify-center mb-6">
  {sex === "M" ? (
    <div className="border-4 border-gray-300 rounded-full p-4 shadow-md flex items-center justify-center bg-white">
      <img 
        src="/male_user.png" 
        alt="Male Icon" 
        className="w-24 h-24 object-contain -m-4" // Increased image size, negative margin to keep inside circle
      />
    </div>
  ) : sex === "F" ? (
    <div className="border-4 border-gray-300 rounded-full p-4 shadow-md flex items-center justify-center bg-white">
      <img 
        src="/female_user.png" 
        alt="Female Icon" 
        className="w-24 h-24 object-contain -m-4" // Increased image size, negative margin to keep inside circle
      />
    </div>
  ) : (
    <div className="border-4 border-gray-300 rounded-full p-4 shadow-md flex items-center justify-center bg-white">
      <FaUser size={64} className="text-gray-500" />
    </div>
  )}
</div>




        {/* Subtitle */}
        <h2 className="text-lg font-medium mb-6 text-gray-800">
          Please select your role
        </h2>

        {/* Roles */}
        <div className="flex justify-center gap-12 mb-6">
          {/* Admin */}
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

          {/* Cashier */}
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
