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
          <img src="/splice_logo.png" alt="SPLICE POS" className="w-20 h-20" />
        </div>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-5 text-lg text-gray-500">
          <NavLink
            to="/admin/home"
            className={({ isActive }) =>
              `p-1.5 transition-colors ${
                isActive ? "text-[#fbbf24]" : "text-gray-500"
              } hover:text-[#fbbf24]`
            }
          >
            <div className="flex flex-col items-center gap-1">
              <FaTachometerAlt className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Home</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) =>
              `p-1.5 transition-colors ${
                isActive ? "text-[#fbbf24]" : "text-gray-500"
              } hover:text-[#fbbf24]`
            }
          >
            <div className="flex flex-col items-center gap-1">
              <FaBoxOpen className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Inventory</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/pos-monitoring"
            className={({ isActive }) =>
              `p-1.5 transition-colors ${
                isActive ? "text-[#fbbf24]" : "text-gray-500"
              } hover:text-[#fbbf24]`
            }
          >
            <div className="flex flex-col items-center gap-1">
              <FaStore className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">POS</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/supplier-records"
            className={({ isActive }) =>
              `p-1.5 transition-colors ${
                isActive ? "text-[#fbbf24]" : "text-gray-500"
              } hover:text-[#fbbf24]`
            }
          >
            <div className="flex flex-col items-center gap-1">
              <FaUsers className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Suppliers</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/void-logs"
            className={({ isActive }) =>
              `p-1.5 transition-colors ${
                isActive ? "text-[#fbbf24]" : "text-gray-500"
              } hover:text-[#fbbf24]`
            }
          >
            <div className="flex flex-col items-center gap-1">
              <FaClipboardList className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Void Logs</span>
            </div>
          </NavLink>

          {/* Super Admin link - now RED */}
          <a
            href="/admin/super-admin"
            onClick={handleSuperAdminClick}
            className="p-1.5 text-gray-500 transition-colors hover:text-[#fbbf24]"
          >
            <div className="flex flex-col items-center gap-1">
              <FaUserShield className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Super Admin</span>
            </div>
          </a>
        </nav>

        {/* Logout button */}
        <div className="mt-auto">
          <NavLink
            to="/"
            className="p-1.5 text-gray-500 transition-colors hover:text-[#fbbf24] text-lg"
          >
            <div className="flex flex-col items-center gap-1">
              <FaSignOutAlt className="text-[1.1rem]" />
              <span className="text-[11px] font-medium">Logout</span>
            </div>
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
