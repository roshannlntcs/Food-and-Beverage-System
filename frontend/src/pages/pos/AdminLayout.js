// src/components/AdminLayout.js
import React from "react";
import Sidebar from "./Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-48 p-6 w-full">{children}</div>
    </div>
  );
};

export default AdminLayout;
