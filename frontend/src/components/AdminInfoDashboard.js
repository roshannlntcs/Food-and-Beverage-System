import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUser, FaChevronDown } from 'react-icons/fa';

const AdminInfo = () => {
  const adminName = localStorage.getItem('fullName') || 'Admin';
  const profileImage = localStorage.getItem('profileImage'); // save image URL here if available
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const notifications = [
    { id: 1, message: 'Low stock: Cheesecake (5 left)', time: '2 mins ago' },
    { id: 2, message: 'New transaction: TXN-2045 completed', time: '5 mins ago' },
    { id: 3, message: 'Inventory updated by Rose', time: '10 mins ago' },
  ];

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
    setDropdownOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setNotifOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInAdmin');
    window.location.href = '/admin-login';
  };

  return (
    <div className="flex items-center space-x-6 relative">
      {/* Notification Icon */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={toggleNotif}
          className="relative focus:outline-none hover:opacity-80 transition"
        >
          <FaBell className="text-xl text-white" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
          )}
        </button>

        {/* Notifications dropdown */}
        {notifOpen && (
          <div className="absolute left-0 top-10 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 text-gray-800">
            <div className="p-3 border-b font-semibold">Notifications</div>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm">{notif.message}</p>
                  <span className="text-xs text-gray-500">{notif.time}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        )}
      </div>

      {/* Profile Pill */}
      <div
        className="flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-full cursor-pointer select-none"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        {/* Profile Image / Fallback */}
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-white"
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center bg-white/30 rounded-full">
            <FaUser className="text-white text-lg" />
          </div>
        )}

        <div className="leading-tight text-white">
          <div className="text-sm font-semibold">{adminName}</div>
          <div className="text-xs opacity-80">Admin</div>
        </div>
        <FaChevronDown className="text-white text-sm" />
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-14 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-semibold border-b">{adminName}</div>
          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Profile</button>
          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Settings</button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInfo;
