// src/pages/RoleSelection.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaWrench, FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import useOptimizedAvatar from "../hooks/useOptimizedAvatar";

const ROLE_OPTIONS = [
  { id: "admin", label: "ADMIN", Icon: FaWrench },
  { id: "cashier", label: "CASHIER", Icon: FaCashRegister },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};

  const [selectedRole, setSelectedRole] = useState(null);
  const fullName = currentUser?.fullName || "";
  const schoolId = currentUser?.schoolId || currentUser?.employeeId || "";
  const { avatarSrc } = useOptimizedAvatar(currentUser);
  const [displayAvatar, setDisplayAvatar] = useState(
    () => currentUser?.avatarUrl || ""
  );

  useEffect(() => {
    const uploaded = currentUser?.avatarUrl;
    const resolved = avatarSrc;
    if (uploaded) {
      setDisplayAvatar(uploaded);
    } else if (resolved && !resolved.includes("avatar-ph")) {
      setDisplayAvatar(resolved);
    }
  }, [avatarSrc, currentUser?.avatarUrl]);

  useEffect(() => {
    if (typeof Image === "undefined") return undefined;
    const bg = new Image();
    bg.src = "/b.jpg";
    return () => {
      bg.onload = null;
      bg.onerror = null;
    };
  }, []);

  const handleContinue = () => {
    if (selectedRole === "admin") {
      navigate("/admin/home");
    } else if (selectedRole === "cashier") {
      if (currentUser) navigate("/user");
      else navigate("/user-login");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/b.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />

      <div className="relative z-10 bg-white px-7 py-7 rounded-2xl shadow-2xl w-full max-w-[400px] text-center">
        {fullName && (
          <h1 className="text-xl font-semibold text-gray-700 mb-5">
            Hello, <span className="text-yellow-500">{fullName}</span>!
          </h1>
        )}

        <div className="flex flex-col items-center justify-center mb-5 space-y-3">
          <div className="w-28 h-28 border-4 border-gray-200 rounded-full shadow-lg overflow-hidden bg-white transition-all duration-300">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Profile avatar"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser size={60} className="text-gray-400" />
              </div>
            )}
          </div>
          {schoolId && (
            <div className="text-sm font-semibold tracking-wide text-gray-600">
              <span className="opacity-70 mr-1">School ID:</span>
              <span>{schoolId}</span>
            </div>
          )}
        </div>

        <h2 className="text-base font-medium mb-5 text-gray-800">
          Please select your role:
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {ROLE_OPTIONS.map(({ id, label, Icon }) => {
            const active = selectedRole === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedRole(id)}
                className={`group w-full max-w-[150px] mx-auto h-24 sm:h-28 flex flex-col items-center justify-center rounded-2xl transition-[box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 ${
                  active
                    ? "bg-[#FFF8E1] shadow-xl"
                    : "bg-white border border-gray-200 hover:shadow-lg"
                }`}
                aria-pressed={active}
              >
                <Icon
                  size={30}
                  className={`mb-3 transition-colors duration-200 ${
                    active
                      ? "text-[#FFC72C]"
                      : "text-gray-500 group-hover:text-[#FFC72C]"
                  }`}
                />
                <span className="font-semibold tracking-wide text-sm">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => navigate("/")}
            className="px-9 py-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-black text-sm font-medium transition"
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
