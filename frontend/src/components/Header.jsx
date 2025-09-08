// src/components/Header.jsx
import React from "react";
import logo from "../assets/logo-pos2.png";
import avatar from "../assets/avatar-ph.png";

export default function Header({
  userName,
  profilePic,
  onProfileClick,
  searchTerm,
  onSearchChange,
}) {
  return (
    <header className="bg-[#800000] text-white flex justify-between items-center px-6 py-4 h-20 shadow-md border-b border-gray-200">
      {/* Left: Logo + Title */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="POS Logo"
          className="w-12 h-12 object-contain rounded"
        />
        <div className="text-xl font-bold tracking-wide">SPLICE</div>
      </div>

      {/* Middle: Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="text-black bg-white px-4 py-2 rounded-3xl w-1/3 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
      />

      {/* Right: Profile */}
      <button
        onClick={onProfileClick}
        className="flex items-center space-x-2 bg-[#FFC72C] px-3 py-1.5 rounded-full shadow hover:scale-105 transition-transform duration-150"
      >
         <img
          src={profilePic}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
        />
        <div className="text-left leading-tight">
          <div className="font-bold text-sm text-black">{userName}</div>
          <div className="text-xs text-black">Cashier</div>
        </div>
      </button>
    </header>
  );
}
