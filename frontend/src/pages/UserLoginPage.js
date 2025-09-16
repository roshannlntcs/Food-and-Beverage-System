// UserLoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaLock } from "react-icons/fa";

export default function UserLoginPage() {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (schoolId.trim() === "" || password.trim() === "") {
      setError("Please enter both School ID and Password.");
      return;
    }

    // ✅ Dummy Admin
    const dummyId = "admin";
    const dummyPassword = "admin123";

    if (schoolId.trim() === dummyId && password.trim() === dummyPassword) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("fullName", "Administrator");
      localStorage.setItem("schoolId", dummyId);
      localStorage.setItem("sex", "");
      
      // Update recent login for SuperAdmin
      let users = JSON.parse(localStorage.getItem("userCSV")) || [];
      const now = new Date().toLocaleString();

      const adminIndex = users.findIndex((u) => u.id_number === dummyId);
      if (adminIndex !== -1) {
        users[adminIndex].recentLogin = now;
      } else {
        users.push({
          id_number: dummyId,
          name: "Administrator",
          password: dummyPassword,
          type: "SuperAdmin",
          recentLogin: now,
        });
      }
      localStorage.setItem("userCSV", JSON.stringify(users));

      navigate("/roles");
      return;
    }

    // ✅ CSV Users
    let storedUsers = JSON.parse(localStorage.getItem("userCSV")) || [];
    const foundUserIndex = storedUsers.findIndex(
      (u) => u.id_number === schoolId.trim() && u.password === password.trim()
    );

    if (foundUserIndex === -1) {
      setError("Invalid School ID or Password.");
      return;
    }

    const foundUser = storedUsers[foundUserIndex];
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("fullName", foundUser.name);
    localStorage.setItem("schoolId", foundUser.id_number);
    localStorage.setItem("sex", foundUser.sex || ""); // M or F
    
    // Update recent login
    storedUsers[foundUserIndex].recentLogin = new Date().toLocaleString();
    localStorage.setItem("userCSV", JSON.stringify(storedUsers));

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

          {/* Buttons */}
          <div className="flex flex-col items-center space-y-4">
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
