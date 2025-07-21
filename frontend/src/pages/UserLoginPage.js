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

    localStorage.setItem("schoolId", schoolId.trim());
    localStorage.setItem("userName", name.trim());

    navigate("/user");
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
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Enter School ID"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Enter Name"
            />
          </div>

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
  );
}
