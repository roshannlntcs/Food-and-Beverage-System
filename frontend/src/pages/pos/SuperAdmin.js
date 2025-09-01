import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { FaUsers, FaEllipsisV } from "react-icons/fa";
import ShowEntries from "../../components/ShowEntries";
import Pagination from "../../components/Pagination";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";

const dummyUsers = [
  { id: 1, username: "johnpaulavillaverde", avatar: "https://i.pravatar.cc/150?img=1", recentLogin: "5 minutes ago", type: "Manager", action: "Viewed void logs" },
  { id: 2, username: "japitselffishh", avatar: "https://i.pravatar.cc/150?img=2", recentLogin: "1 hour ago", type: "Admin", action: "Edited an item in inventory" },
  { id: 3, username: "blessmychojamil", avatar: "https://i.pravatar.cc/150?img=3", recentLogin: "3 hours ago", type: "Cashier", action: "Void transaction #13526" },
  { id: 4, username: "dianamairieee", avatar: "https://i.pravatar.cc/150?img=4", recentLogin: "1 day ago", type: "Admin", action: "Added supplier in supplier records" },
  { id: 5, username: "mjlastimosa", avatar: "https://i.pravatar.cc/150?img=5", recentLogin: "2 days ago", type: "Cashier", action: "Placed order (#64984487)" },
  { id: 6, username: "genesisjohn", avatar: "https://i.pravatar.cc/150?img=6", recentLogin: "2 days ago", type: "Cashier", action: "Placed order (#64984487)" },
];

const resetWarnings = {
  transactions: "Are you sure you want to reset all transactions? This action cannot be undone.",
  voidLogs: "Are you sure you want to reset all void logs? This action cannot be undone.",
  salesReport: "Are you sure you want to reset all sales records? This action cannot be undone.",
};

const SuperAdmin = () => {
  const [users] = useState(dummyUsers);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReset, setActiveReset] = useState(null);

  // User type filter
  const [filterType, setFilterType] = useState("All");

  // Pagination
  const totalPages = Math.ceil(users.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const filteredUsers =
    filterType === "All" ? users : users.filter((u) => u.type === filterType);
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

  const openModal = (type) => {
    setActiveReset(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveReset(null);
  };

  const handleConfirmReset = () => {
    alert(`Resetting ${activeReset}`);
    closeModal();
  };

  return (
    <div className="flex min-h-screen bg-[#f8f5f0]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-20 p-8 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Administrator</h1>
          <AdminInfo />
        </div>

        {/* Top controls: Reset + Add/Upload buttons */}
        <div className="flex justify-between items-center mb-6">
          {/* Reset dropdown */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) openModal(e.target.value);
            }}
          >
            <option value="" disabled>
              Reset All
            </option>
            <option value="transactions">Transactions</option>
            <option value="voidLogs">Void Logs</option>
            <option value="salesReport">Sales Report</option>
          </select>

          <div className="flex gap-3">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-5 py-2 rounded-md">
              + Add User
            </button>
            <button className="bg-black hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-md">
              Upload CSV
            </button>
          </div>
        </div>

        {/* Users Table */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold flex items-center gap-2 text-lg">
              <FaUsers /> Users
            </h2>

            {/* Filter dropdown */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-4">USERNAME</th>
                  <th className="py-3 px-4">RECENT LOGIN</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">ACTIONS</th>
                  <th className="py-3 px-4 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="truncate">{user.username}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{user.recentLogin}</td>
                    <td className="py-3 px-4">{user.type}</td>
                    <td className="py-3 px-4">{user.action}</td>
                    <td className="py-3 px-4 text-center cursor-pointer text-gray-500 hover:text-black">
                      <FaEllipsisV />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredUsers.length / entriesPerPage)}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmReset}
        warningText={activeReset ? resetWarnings[activeReset] : ""}
      />
    </div>
  );
};

export default SuperAdmin;
