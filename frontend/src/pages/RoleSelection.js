import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const baseColor = "#DDDADA";
  const hoverColor = "#F6EBCE";

  return (
    <div
      className="min-h-screen p-10 flex flex-col items-center justify-center text-black"
      style={{ backgroundColor: "#F6F3EA" }}
    >
      <h1 className="text-4xl font-bold mb-12">Select Your Role</h1>

      {/* Role Cards */}
      <div className="flex gap-12 mb-10">
        {/* Admin Box */}
        <div
          onClick={() => navigate("/admin-login")}
          onMouseEnter={() => setHovered("admin")}
          onMouseLeave={() => setHovered(null)}
          className="cursor-pointer w-40 h-40 rounded-lg flex items-center justify-center text-lg font-semibold shadow-md transition duration-300"
          style={{
            backgroundColor: hovered === "admin" ? hoverColor : baseColor,
          }}
        >
          Admin
        </div>

        {/* User Box */}
        <div
          onClick={() => navigate("/user-login")}
          onMouseEnter={() => setHovered("user")}
          onMouseLeave={() => setHovered(null)}
          className="cursor-pointer w-40 h-40 rounded-lg flex items-center justify-center text-lg font-semibold shadow-md transition duration-300"
          style={{
            backgroundColor: hovered === "user" ? hoverColor : baseColor,
          }}
        >
          User
        </div>
      </div>

      {/* Cancel Button */}
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-[#DDDADA] hover:bg-[#C6C2C2] text-black rounded-md shadow-sm transition duration-200"
      >
        Cancel
      </button>
    </div>
  );
}
