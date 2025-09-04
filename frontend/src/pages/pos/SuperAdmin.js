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
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeReset, setActiveReset] = useState(null);

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // ✅ NEW: for dynamic section dropdown
  const [sections, setSections] = useState([]);
  const [filterSection, setFilterSection] = useState("All");

  const fileInputRef = useRef(null);

  // ✅ Load stored users + ensure SuperAdmin exists
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

    if (!storedUsers.find((u) => u.id_number === "admin")) {
      storedUsers.unshift({
        id_number: "admin",
        name: "Administrator",
        password: "admin123",
        program: "-",
        section: "-",
        type: "SuperAdmin",
        recentLogin: "Never",
      });
    }

    setUsers(storedUsers);
  }, []);

  // ✅ Extract unique sections whenever users update
  useEffect(() => {
    const uniqueSections = [
      ...new Set(users.map((u) => u.section).filter((s) => s && s !== "-")),
    ];
    setSections(uniqueSections);
  }, [users]);

  // ✅ Handle CSV Upload (UTF-8 + trim fix)
  // Utility: create a simple hash from text
const hashString = (str) => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    let csvText;
    try {
      const decoder = new TextDecoder("utf-8", { fatal: true });
      csvText = decoder.decode(e.target.result);
    } catch (err) {
      const fallbackDecoder = new TextDecoder("latin1");
      csvText = fallbackDecoder.decode(e.target.result);
    }

    // 🔹 Step 1: hash file content
    const newFileHash = hashString(csvText);

    // 🔹 Step 2: check stored file hashes
    let uploadedFiles = JSON.parse(localStorage.getItem("uploadedFileHashes")) || [];
    if (uploadedFiles.includes(newFileHash)) {
      setMessageModal({
        isOpen: true,
        title: "Duplicate File",
        message: "This CSV file has already been uploaded.",
        type: "error",
      });
      return;
    }

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const firstRow = results.data[0];
        if (
          !firstRow ||
          !firstRow["Student ID No."] ||
          !firstRow["Full Name"] ||
          !firstRow["Default Password"] ||
          !firstRow["Program"] ||
          !firstRow["Section"]
        ) {
          setMessageModal({
            isOpen: true,
            title: "Invalid CSV",
            message:
              "CSV must have headers: Student ID No., Full Name, Default Password, Program, Section. Please upload a valid file.",
            type: "error",
          });
          return;
        }

        let parsedUsers = results.data.map((row) => ({
          id_number: row["Student ID No."].trim(),
          name: row["Full Name"].trim(),
          password: row["Default Password"].trim(),
          program: row["Program"].trim(),
          section: row["Section"].trim(),
          type: "Student",
          recentLogin: "Never",
        }));

        let existingUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

        // 🔹 Step 3: remove duplicate users by id_number
        parsedUsers = parsedUsers.filter(
          (newUser) => !existingUsers.some((u) => u.id_number === newUser.id_number)
        );

        if (parsedUsers.length === 0) {
          setMessageModal({
            isOpen: true,
            title: "No New Users",
            message: "This file contains only duplicate users. Nothing was added.",
            type: "error",
          });
          return;
        }

        const merged = [...existingUsers, ...parsedUsers];

        // Keep SuperAdmin
        if (!merged.find((u) => u.id_number === "admin")) {
          merged.unshift({
            id_number: "admin",
            name: "Administrator",
            password: "admin123",
            program: "-",
            section: "-",
            type: "SuperAdmin",
            recentLogin: "Never",
          });
        }

        // 🔹 Step 4: save file hash to prevent future duplicate uploads
        uploadedFiles.push(newFileHash);
        localStorage.setItem("uploadedFileHashes", JSON.stringify(uploadedFiles));

        // Save users
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

  reader.readAsArrayBuffer(file);
};


  // ✅ Filtering + Pagination (now by section)
  const filteredUsers =
    filterSection === "All"
      ? users
      : users.filter((u) => u.section === filterSection);

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
          program: "-",
          section: "-",
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
          program: "-",
          section: "-",
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
        <div className="flex justify-between items-center mb-12">
          {/* Reset dropdown */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
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
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-5 py-2 rounded-md text-sm">
              + Add User
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-black hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-md text-sm"
            >
              Upload CSV
            </button>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <FaUsers /> Users
            </h2>

            {/* ✅ Dynamic Section Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs text-gray-700"
              value={filterSection}
              onChange={(e) => {
                setFilterSection(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Sections</option>
              {sections.map((sec, idx) => (
                <option key={idx} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-4">SCHOOL ID</th>
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-4">PROGRAM</th>
                  <th className="py-3 px-4">SECTION</th>
                  <th className="py-3 px-4">RECENT LOGIN</th>
                  <th className="py-3 px-4">TYPE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id_number}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.program || "-"}</td>
                    <td className="py-3 px-4">{user.section || "-"}</td>
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

      {/* Message Modal */}
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
