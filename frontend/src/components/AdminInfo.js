import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const AdminInfo = () => {
  const adminName = localStorage.getItem('adminFullName') || 'Admin';
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
    <div className="flex items-center space-x-4 relative">
      {/* Notification Icon */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={toggleNotif}
          className="relative focus:outline-none hover:text-yellow-500 transition"
        >
          <FaBell className="text-xl text-gray-700" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-10 w-64 bg-white border rounded shadow-lg z-50">
            <div className="p-3 border-b font-semibold">Notifications</div>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm">{notif.message}</p>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        )}
      </div>

      {/* Profile & Info */}
      <div
        className="flex items-center space-x-3 cursor-pointer select-none"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <img
          src="https://i.pravatar.cc/100?img=68"
          alt="Admin Avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow-sm"
        />
        <div className="leading-tight hidden md:block">
          <div className="text-sm font-semibold">{adminName}</div>
          <div className="text-xs text-gray-500">Administrator</div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-14 w-44 bg-white border rounded shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-semibold border-b">{adminName}</div>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
            <FaUser /> Profile
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
            <FaCog /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInfo;
