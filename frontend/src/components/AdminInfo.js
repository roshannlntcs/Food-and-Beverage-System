import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';

const AdminInfo = () => {
  const adminName = localStorage.getItem('adminFullName') || 'Admin';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInAdmin');
    window.location.href = '/admin-login';
  };

  return (
    <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
      {/* Notification Icon */}
      <button className="relative focus:outline-none">
        <FaBell className="text-xl text-gray-700 hover:text-yellow-500 transition" />
        <span className="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* Profile & Info */}
      <div
        className="flex items-center space-x-3 cursor-pointer select-none"
        onClick={toggleDropdown}
      >
        <img
          src="/blur.png"
          alt="Admin Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-semibold">{adminName}</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-14 w-40 bg-white border rounded shadow-md z-50">
          <div className="px-4 py-2 text-sm text-gray-800 border-b">{adminName}</div>
          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInfo;
