import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminInfo = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('fullName') || 'Admin';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownBtnRef = useRef(null); // separate button ref
  const notifRef = useRef(null);

  const handleClickOutside = (event) => {
    // check dropdown
    if (
      dropdownRef.current &&
      dropdownBtnRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !dropdownBtnRef.current.contains(event.target)
    ) {
      setDropdownOpen(false);
    }

    // check notifications
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setNotifOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = () => {
    console.log('Switch Role clicked');
    navigate('/roles');
    setDropdownOpen(false);
  };

  return (
    <div className="flex items-center space-x-4 relative z-50">
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => setNotifOpen(prev => !prev)} className="relative focus:outline-none hover:text-yellow-500 transition">
          <FaBell className="text-xl text-gray-700" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-10 w-64 bg-white border rounded shadow-lg z-50">
            <div className="p-3 border-b font-semibold">Notifications</div>
            <p className="p-4">Notification content</p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          ref={dropdownBtnRef}
          onClick={() => setDropdownOpen(prev => !prev)}
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          <img
            src="https://i.pravatar.cc/100?img=68"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow-sm"
          />
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-semibold">{adminName}</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </button>

        {dropdownOpen && (
          <div ref={dropdownRef} className="absolute right-0 top-14 w-44 bg-white border rounded shadow-lg z-50 pointer-events-auto">
            <div className="px-4 py-2 text-sm font-semibold border-b">{adminName}</div>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <FaUser /> Profile
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <FaCog /> Settings
            </button>
            <button
              onClick={handleSwitchRole}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <FaSignOutAlt /> Switch Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInfo;
