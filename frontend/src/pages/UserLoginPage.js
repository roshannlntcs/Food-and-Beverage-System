// src/pages/UserLoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserLoginPage() {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (schoolId.trim() === "" || name.trim() === "") {
      setError("Please enter both School ID and Name.");
      return;
    }
    navigate("/user");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="w-2/5 h-full">
        <img
          src="/loginpic.jpg" // replace with your image path
          alt="User Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-3/5 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            User Login
          </h2>

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">School ID</label>
            <input
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-yellow-400"
              placeholder="Enter School ID"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-yellow-400"
              placeholder="Enter Name"
            />
          </div>

          <button
            onClick={handleLogin}
             className="w-full bg-yellow-400 text-black py-2 px-4 rounded hover:bg-yellow-500 transition mb-4"
          >
            Enter
          </button>

          <button
            onClick={() => navigate("/roles")}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
          >
           Cancel
          </button>
        
        </div>
      </div>
    </div>
  );
}
