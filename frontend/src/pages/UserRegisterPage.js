import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaRegAddressCard } from "react-icons/fa";

export default function UserRegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleRegister = () => {
    if (
      fullName.trim() === "" ||
      schoolId.trim() === "" ||
      password.trim() === ""
    ) {
      setError("Please enter Full Name, School ID, and Password.");
      return;
    }

    // Save credentials
    localStorage.setItem("fullName", fullName.trim());
    localStorage.setItem("schoolId", schoolId.trim());
    localStorage.setItem("password", password.trim());

    setError("");
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/user-login");
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
            handleRegister();
          }}
        >
          <div className="flex justify-center mb-6">
            <img src="/poslogo.png" alt="POS Logo" className="h-20 w-auto" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Create Account
          </h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Please enter credentials to register.
          </p>

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Full Name with Icon */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <div className="flex items-center border rounded focus-within:ring focus-within:border-yellow-400">
              <span className="px-3 text-gray-500">
                <FaRegAddressCard />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 outline-none"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* School ID with Icon */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">School ID</label>
            <div className="flex items-center border rounded focus-within:ring focus-within:border-yellow-400">
              <span className="px-3 text-gray-500">
                <FaUser />
              </span>
              <input
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full p-2 outline-none"
                placeholder="Enter your school ID"
              />
            </div>
          </div>

          {/* Password with Icon */}
          <div className="mb-8">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="flex items-center border rounded focus-within:ring focus-within:border-yellow-400">
              <span className="px-3 text-gray-500">
                <FaLock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 outline-none"
                placeholder="Set a password..."
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              type="submit"
              className="h-[40px] w-[200px] bg-yellow-400 text-black py-2 px-4 rounded-[20px] hover:bg-yellow-500 transition"
            >
              Enter
            </button>

            <button
              type="button"
              onClick={() => navigate("/user-login")}
              className="h-[40px] w-[200px] bg-gray-200 text-gray-700 py-2 px-4 rounded-[20px] hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[320px]">
            {/* Green Circle Check Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full h-12 w-12 flex items-center justify-center">
                <span className="text-white text-2xl">✔</span>
              </div>
            </div>

            {/* Message */}
            <p className="text-lg font-semibold mb-4">
              Account created successfully!
            </p>

            {/* OK Button */}
            <button
              onClick={handlePopupClose}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
