// Sidebar.js
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaStore,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import SuperAdminAccessModal from "./SuperAdminAccessModal";
import SuperAdminPasswordModal from "./SuperAdminPasswordModal";

const Sidebar = () => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  // Step 1: Open first modal when clicking Super Admin
  const handleSuperAdminClick = (e) => {
    e.preventDefault();
    setShowAccessModal(true);
  };

  // Step 2: Close first modal and open password modal
  const handleAccessConfirmed = () => {
    setShowAccessModal(false);
    setShowPasswordModal(true);
  };

  // Step 3: Close password modal and navigate if correct password
  const handlePasswordConfirmed = () => {
    setShowPasswordModal(false);
    navigate("/admin/super-admin");
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-20 bg-white text-gray-800 flex flex-col items-center py-6 shadow-md z-50">
        {/* Logo */}
        <div className="mb-10">
          <img src="../splice.png" alt="Logo" className="w-20 h-18" />
        </div>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-10 text-3xl">
          <NavLink
            to="/admin/home"
            className={({ isActive }) =>
              `hover:text-yellow-500 ${
                isActive ? "text-yellow-500" : "text-gray-500"
              }`
            }
            title="Home"
          >
            <FaTachometerAlt />
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) =>
              `hover:text-yellow-500 ${
                isActive ? "text-yellow-500" : "text-gray-500"
              }`
            }
            title="Inventory"
          >
            <FaBoxOpen />
          </NavLink>

          <NavLink
            to="/admin/pos-monitoring"
            className={({ isActive }) =>
              `hover:text-yellow-500 ${
                isActive ? "text-yellow-500" : "text-gray-500"
              }`
            }
            title="POS Monitoring"
          >
            <FaStore />
          </NavLink>

          <NavLink
            to="/admin/supplier-records"
            className={({ isActive }) =>
              `hover:text-yellow-500 ${
                isActive ? "text-yellow-500" : "text-gray-500"
              }`
            }
            title="Suppliers"
          >
            <FaUsers />
          </NavLink>

          <NavLink
            to="/admin/void-logs"
            className={({ isActive }) =>
              `hover:text-yellow-500 ${
                isActive ? "text-yellow-500" : "text-gray-500"
              }`
            }
            title="Void Logs"
          >
            <FaClipboardList />
          </NavLink>

          {/* Super Admin link - now RED */}
          <a
            href="/admin/super-admin"
            onClick={handleSuperAdminClick}
            className="text-red-600 hover:text-red-800"
            title="Super Admin"
          >
            <FaUserShield />
          </a>
        </nav>

        {/* Logout button */}
        <div className="mt-auto">
          <NavLink
            to="/"
            className="text-gray-400 hover:text-red-500 text-xl"
            title="Logout"
          >
            <FaSignOutAlt />
          </NavLink>
        </div>
      </div>

      {/* Modals */}
      {showAccessModal && (
        <SuperAdminAccessModal
          onClose={() => setShowAccessModal(false)}
          onConfirm={handleAccessConfirmed}
        />
      )}

      {showPasswordModal && (
        <SuperAdminPasswordModal
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordConfirmed}
        />
      )}
    </>
  );
};

export default Sidebar;
