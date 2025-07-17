import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleLogin = () => {
    if (username.trim() === "" || password.trim() === "") {
      setError("Please enter both username and password.");
      return;
    }

    if (username === "admin" && password === "admin123") {
      setShowModal(true);
    } else {
      setError("Invalid credentials. Try again.");
    }
  };

  const handleModalSubmit = () => {
    if (fullName.trim() === "") {
      alert("Full name is required.");
      return;
    }
    localStorage.setItem("adminFullName", fullName);
    setShowModal(false);
    navigate("/admin");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="w-2/5 h-full">
        <img
          src="/loginnpic.jpg"
          alt="Admin Illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-3/5 flex items-center justify-center bg-[#F6F3EA] p-8">
        <div className="w-full max-w-md">
          {/* Centered POS Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/poslogo.png"
              alt="POS Logo"
              className="h-20 w-auto"
            />
          </div>

          <div className="flex justify-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          </div>

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {/* Form with Enter key submission */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent page refresh
              handleLogin(); // Trigger login
            }}
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter username"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter password"
              />
            </div>

            {/* Buttons Centered */}
            <div className="flex flex-col items-center space-y-4 mt-10">
              <button
                type="submit"
                className="h-[40px] w-[200px] bg-yellow-400 text-black py-2 px-4 rounded-[20px] hover:bg-yellow-500 transition"
              >
                Enter
              </button>

              <button
                type="button"
                onClick={() => navigate("/roles")}
                className="h-[40px] w-[200px] bg-gray-200 text-gray-700 py-2 px-4 rounded-[20px] hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Full Name Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Enter Full Name
            </h3>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Full Name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleModalSubmit();
              }}
            />
            <button
              onClick={handleModalSubmit}
              className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500 transition"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
