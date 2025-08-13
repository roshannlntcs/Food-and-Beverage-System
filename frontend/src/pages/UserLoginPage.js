import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaLock } from "react-icons/fa"; // icons

export default function UserLoginPage() {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const storedId = localStorage.getItem("schoolId");
    const storedPassword = localStorage.getItem("password");

    if (schoolId.trim() === "" || password.trim() === "") {
      setError("Please enter both School ID and Password.");
      return;
    }

    if (schoolId.trim() !== storedId || password.trim() !== storedPassword) {
      setError("Invalid School ID or Password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    navigate("/roles");
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-start"
      style={{ backgroundImage: "url('/userlogin_bg.png')" }}
    >
      <div className="ml-36 bg-white bg-opacity-90 p-10 rounded-lg shadow-lg w-full max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="flex justify-center mb-6">
            <img src="/poslogo.png" alt="POS Logo" className="h-20 w-auto" />
          </div>

          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {/* School ID */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">School ID</label>
            <div className="flex items-center border rounded focus-within:ring focus-within:border-blue-400">
              <FaIdCard className="text-gray-500 ml-2" />
              <input
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full p-2 pl-2 outline-none"
                placeholder="Enter School ID"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="flex items-center border rounded focus-within:ring focus-within:border-blue-400">
              <FaLock className="text-gray-500 ml-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pl-2 outline-none"
                placeholder="Enter Password"
              />
            </div>
          </div>

          {/* Forgot Password link */}
          <div className="text-right mb-6">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-black hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-black hover:underline text-sm"
            >
              Create an Account
            </button>

            <button
              type="submit"
              className="h-[40px] w-[200px] bg-yellow-400 text-black py-2 px-4 rounded-[20px] hover:bg-yellow-500 transition"
            >
              Enter
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="h-[40px] w-[200px] bg-gray-200 text-gray-700 py-2 px-4 rounded-[20px] hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
