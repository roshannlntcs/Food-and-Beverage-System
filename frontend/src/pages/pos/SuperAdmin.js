import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { FaUsers } from "react-icons/fa";
import Pagination from "../../components/Pagination";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";
import MessageModal from "../../components/modals/MessageModal"; 
import Papa from "papaparse";

const resetWarnings = {
  transactions:
    "Are you sure you want to reset all transactions? This action cannot be undone.",
  voidLogs:
    "Are you sure you want to reset all void logs? This action cannot be undone.",
  salesReport:
    "Are you sure you want to reset all sales records? This action cannot be undone.",
  users:
    "Are you sure you want to reset all users? This will remove all except the SuperAdmin.",
  all:
    "Are you sure you want to reset EVERYTHING (Users, Transactions, Void Logs, Sales Report)? This action cannot be undone.",
};

const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset Confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReset, setActiveReset] = useState(null);

  // CSV message modal (error/success)
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // User type filter
  const [filterType, setFilterType] = useState("All");

  // File input ref
  const fileInputRef = useRef(null);

  // ✅ Load all users (CSV + Admin) from localStorage
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

    // Ensure Admin is always in the list
    if (!storedUsers.find((u) => u.id_number === "admin")) {
      storedUsers.unshift({
        id_number: "admin",
        name: "Administrator",
        password: "admin123",
        type: "SuperAdmin",
        recentLogin: "Never",
      });
    }

    setUsers(storedUsers);
  }, []);

  // ✅ Handle CSV Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const firstRow = results.data[0];
        if (
          !firstRow ||
          !firstRow.id_number ||
          !firstRow.name ||
          !firstRow.password
        ) {
          setMessageModal({
            isOpen: true,
            title: "Invalid CSV",
            message:
              "CSV must have headers: id_number, name, password. Please upload a valid file.",
            type: "error",
          });
          return;
        }

        let parsedUsers = results.data.map((row) => ({
          id_number: row.id_number,
          name: row.name,
          password: row.password,
          type: "Student",
          recentLogin: "Never",
        }));

        let existingUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

        // Merge: keep recentLogin if already exists
        parsedUsers.forEach((newUser) => {
          const existing = existingUsers.find(
            (u) => u.id_number === newUser.id_number
          );
          if (existing) {
            newUser.recentLogin = existing.recentLogin;
          }
        });

        // Merge without duplicates
        const merged = [
          ...existingUsers.filter(
            (u) => !parsedUsers.find((p) => p.id_number === u.id_number)
          ),
          ...parsedUsers,
        ];

        // Ensure Admin stays
        if (!merged.find((u) => u.id_number === "admin")) {
          merged.unshift({
            id_number: "admin",
            name: "Administrator",
            password: "admin123",
            type: "SuperAdmin",
            recentLogin: "Never",
          });
        }

        localStorage.setItem("userCSV", JSON.stringify(merged));
        setUsers(merged);

        setMessageModal({
          isOpen: true,
          title: "Upload Successful",
          message: "CSV uploaded successfully.",
          type: "success",
        });
      },
    });
  };

  // ✅ Filtering + Pagination
  const filteredUsers =
    filterType === "All"
      ? users
      : users.filter((u) => u.type === filterType);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // ✅ Reset logic
  const openModal = (type) => {
    setActiveReset(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveReset(null);
  };

  const handleConfirmReset = () => {
    if (activeReset === "transactions") {
      localStorage.removeItem("transactions");
    }
    if (activeReset === "voidLogs") {
      localStorage.removeItem("voidLogs");
    }
    if (activeReset === "salesReport") {
      localStorage.removeItem("salesReport");
    }
    if (activeReset === "users") {
      const adminOnly = [
        {
          id_number: "admin",
          name: "Administrator",
          password: "admin123",
          type: "SuperAdmin",
          recentLogin: "Never",
        },
      ];
      localStorage.setItem("userCSV", JSON.stringify(adminOnly));
      setUsers(adminOnly);
    }
    if (activeReset === "all") {
      localStorage.clear();
      const adminOnly = [
        {
          id_number: "admin",
          name: "Administrator",
          password: "admin123",
          type: "SuperAdmin",
          recentLogin: "Never",
        },
      ];
      localStorage.setItem("userCSV", JSON.stringify(adminOnly));
      setUsers(adminOnly);
    }
    window.dispatchEvent(new Event("storage"));
    closeModal();

    setMessageModal({
      isOpen: true,
      title: "Reset Successful",
      message: `${
        activeReset === "all" ? "System data" : activeReset
      } has been reset.`,
      type: "success",
    });
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

        {/* Top controls */}
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
              Reset Options
            </option>
            <option value="transactions">Reset Transactions</option>
            <option value="voidLogs">Reset Void Logs</option>
            <option value="salesReport">Reset Sales Report</option>
            <option value="users">Reset Users</option>
            <option value="all">Reset All</option>
          </select>

          <div className="flex gap-3">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-5 py-2 rounded-md">
              + Add User
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-black hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-md"
            >
              Upload CSV
            </button>
            {/* Hidden file input */}
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Users Table */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold flex items-center gap-2 text-lg">
              <FaUsers /> All Users
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
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Cashier">Cashier</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-4">SCHOOL ID</th>
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-4">RECENT LOGIN</th>
                  <th className="py-3 px-4">TYPE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id_number}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {user.recentLogin || "Never"}
                    </td>
                    <td className="py-3 px-4">{user.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
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

      {/* Message Modal (CSV + Reset feedback) */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() =>
          setMessageModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </div>
  );
};

export default SuperAdmin;
