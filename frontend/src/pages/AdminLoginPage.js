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
    localStorage.setItem("loggedInAdmin", fullName); 
    setShowModal(false);
    navigate("/admin/home");

  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-end pr-32"
      style={{ backgroundImage: "url('/adminlogin_bg.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-lg shadow-lg w-full max-w-md mr-35">
        {/* POS Logo */}
        <div className="flex justify-center mb-6">
          <img src="/poslogo.png" alt="POS Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
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

          <div className="flex flex-col items-center space-y-4 mt-8">
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

      {/* Modal */}
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
          if (e.key === "Enter") {
            handleModalSubmit(); // This will now navigate to /admin/home
          }
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
