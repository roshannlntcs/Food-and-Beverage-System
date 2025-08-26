import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { FaUsers, FaEllipsisV } from "react-icons/fa";
import ShowEntries from "../../components/ShowEntries";
import Pagination from "../../components/Pagination";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";

const dummyUsers = [
  { id: 1, username: "johnpaulavillaverde", avatar: "https://i.pravatar.cc/150?img=1", recentLogin: "5 minutes ago", type: "Admin", action: "Viewed void logs" },
  { id: 2, username: "japitselffishh", avatar: "https://i.pravatar.cc/150?img=2", recentLogin: "1 hour ago", type: "Admin", action: "Edited an item in inventory" },
  { id: 3, username: "blessmychojamil", avatar: "https://i.pravatar.cc/150?img=3", recentLogin: "3 hours ago", type: "Cashier", action: "Void transaction #13526" },
  { id: 4, username: "dianamairieee", avatar: "https://i.pravatar.cc/150?img=4", recentLogin: "1 day ago", type: "Admin", action: "Added supplier in supplier records" },
  { id: 5, username: "mjlastimosa", avatar: "https://i.pravatar.cc/150?img=5", recentLogin: "2 days ago", type: "Cashier", action: "Placed order (#64984487)" },
  { id: 6, username: "annawhite", avatar: "https://i.pravatar.cc/150?img=6", recentLogin: "10 minutes ago", type: "Admin", action: "Updated sales report" },
  { id: 7, username: "michael_smith", avatar: "https://i.pravatar.cc/150?img=7", recentLogin: "4 hours ago", type: "Cashier", action: "Processed refund (#789654)" },
];

const resetWarnings = {
  transactions: "Are you sure you want to reset all transactions? This action cannot be undone.",
  voidLogs: "Are you sure you want to reset all void logs? This action cannot be undone.",
  salesReport: "Are you sure you want to reset all sales records? This action cannot be undone.",
};

const SuperAdmin = () => {
  const [users] = useState(dummyUsers);
  const [entriesPerPage, setEntriesPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReset, setActiveReset] = useState(null); // "transactions" | "voidLogs" | "salesReport" | null

  // Pagination calculations
  const totalPages = Math.ceil(users.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + entriesPerPage);

  const openModal = (type) => {
    setActiveReset(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveReset(null);
  };

  const handleConfirmReset = () => {
    // Placeholder: implement your reset logic here based on activeReset
    alert(`Resetting ${activeReset}`);

    // Close modal after confirming
    closeModal();
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee]">
      <Sidebar />

      <div className="ml-20 p-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Admin</h1>
          <AdminInfo />
        </div>

        {/* Reset Buttons */}
        <div className="flex justify-center gap-10 mb-12 flex-wrap">
          {["transactions", "voidLogs", "salesReport"].map((type) => (
            <div
              key={type}
              className="bg-yellow-100 p-8 rounded-lg shadow-md w-96 min-w-[360px] flex flex-col items-center"
            >
              <h2 className="font-semibold mb-2 uppercase">{`RESET ${type === "voidLogs" ? "VOID LOGS" : type === "salesReport" ? "SALES REPORT" : "TRANSACTIONS"}`}</h2>
              <p className="text-sm mb-6 text-center">
                {`Reset all the ${
                  type === "voidLogs"
                    ? "void logs"
                    : type === "salesReport"
                    ? "sales report"
                    : "transactions"
                } to default`}
              </p>
              <button
                onClick={() => openModal(type)}
                className="bg-gray-300 rounded-full px-10 py-3 hover:bg-gray-400 font-semibold"
              >
                RESET
              </button>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <section>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <FaUsers /> Users
          </h2>

          <div className="border rounded shadow bg-white">
            <div className="overflow-y-auto max-h-[260px]">
              <table className="min-w-full border-collapse">
                <thead className="bg-white border-b border-gray-300 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left">USERNAME</th>
                    <th scope="col" className="py-3 px-4 text-left">RECENT LOGIN</th>
                    <th scope="col" className="py-3 px-4 text-left">TYPE</th>
                    <th scope="col" className="py-3 px-4 text-left">ACTIONS</th>
                    <th scope="col" className="py-3 px-4 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-yellow-50">
                      <td className="py-3 px-4 flex items-center gap-2 whitespace-nowrap">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="truncate max-w-xs">{user.username}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{user.recentLogin}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{user.type}</td>
                      <td className="py-3 px-4">{user.action}</td>
                      <td className="py-3 px-4 text-center cursor-pointer text-gray-500 hover:text-black">
                        <FaEllipsisV />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Show entries & Pagination in one row */}
          <div className="flex items-center mt-3 relative">
            {/* Left: Show Entries */}
            <div className="absolute left-0">
              <ShowEntries
                entriesPerPage={entriesPerPage}
                setEntriesPerPage={setEntriesPerPage}
                setCurrentPage={setCurrentPage}
              />
            </div>

            {/* Center: Pagination */}
            <div className="flex-1 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
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
