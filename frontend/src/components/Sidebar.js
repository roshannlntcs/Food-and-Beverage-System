import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaStore,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-full w-20 bg-white text-gray-800 flex flex-col items-center py-6 shadow-md z-50">
      {/* Logo */}
      <div className="mb-10">
        <img src="../splice.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* Nav Icons */}
      <nav className="flex flex-col gap-8 text-xl">
        <NavLink
          to="/admin/home"
          className={({ isActive }) =>
            `hover:text-yellow-500 ${isActive ? "text-yellow-500" : "text-gray-500"}`
          }
          title="Home"
        >
          <FaTachometerAlt />
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `hover:text-yellow-500 ${isActive ? "text-yellow-500" : "text-gray-500"}`
          }
          title="Inventory"
        >
          <FaBoxOpen />
        </NavLink>

        <NavLink
          to="/admin/pos-monitoring"
          className={({ isActive }) =>
            `hover:text-yellow-500 ${isActive ? "text-yellow-500" : "text-gray-500"}`
          }
          title="POS Monitoring"
        >
          <FaStore />
        </NavLink>

        <NavLink
          to="/admin/supplier-records"
          className={({ isActive }) =>
            `hover:text-yellow-500 ${isActive ? "text-yellow-500" : "text-gray-500"}`
          }
          title="Suppliers"
        >
          <FaUsers />
        </NavLink>

        <NavLink
          to="/admin/void-logs"
          className={({ isActive }) =>
            `hover:text-yellow-500 ${isActive ? "text-yellow-500" : "text-gray-500"}`
          }
          title="Void Logs"
        >
          <FaClipboardList />
        </NavLink>
      </nav>

      {/* Optional logout button */}
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
  );
};

export default Sidebar;
