// src/pages/admin/SuperAdmin.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { FaUsers, FaPen, FaTrash } from "react-icons/fa";
import Pagination from "../../components/Pagination";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";
import MessageModal from "../../components/modals/MessageModal";
import Papa from "papaparse";
import AddUserModal from "../../components/modals/AddUserModal";
import ShowEntries from "../../components/ShowEntries";
import { useInventory } from "../../contexts/InventoryContext";
import EditUserModal from "../../components/modals/EditUserModal";
import DeleteUserConfirmModal from "../../components/modals/DeleteUserConfirmModal";

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
    "Are you sure you want to reset EVERYTHING (Users, Transactions, Void Logs, Sales Report, Inventory)? This action cannot be undone.",
  inventorySeed:
    "Restore inventory to DEFAULT items only? This will remove all added items.",
  stocksTo100:
    "Reset ALL item stocks to 100? (Both default and added items.)",
};

const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const { resetToSeed, resetAllStocks } = useInventory();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReset, setActiveReset] = useState(null);

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [sections, setSections] = useState([]);
  const [filterSection, setFilterSection] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  // Edit/Delete modals state
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fileInputRef = useRef(null);

  // Load users from storage
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

    if (!storedUsers.find((u) => u.id_number === "admin")) {
      storedUsers.unshift({
        id_number: "admin",
        name: "Administrator",
        password: "admin123",
        program: "-",
        section: "-",
        sex: "-",
        type: "SuperAdmin",
        recentLogin: "Never",
      });
    }

    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    const uniqueSections = [
      ...new Set(users.map((u) => u.section).filter((s) => s && s !== "-")),
    ];
    setSections(uniqueSections);
  }, [users]);


  // Manual Add User
  const handleAddUser = (newUser) => {
    let existingUsers = JSON.parse(localStorage.getItem("userCSV")) || [];

    const userToAdd = {
      id_number: newUser.schoolId.trim(),
      name: newUser.fullName.trim(),
      password: newUser.password.trim(),
      program: newUser.program.trim(),
      section: newUser.section.trim(),
      sex: newUser.sex.trim(),
      type: newUser.role === "admin" ? "Admin" : "Student",
      recentLogin: "Never",
    };

    if (existingUsers.some((u) => u.id_number === userToAdd.id_number)) {
      setMessageModal({
        isOpen: true,
        title: "Duplicate User",
        message: "A user with this ID already exists.",
        type: "error",
      });
      return;
    }

    const updatedUsers = [...existingUsers, userToAdd];
    localStorage.setItem("userCSV", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    setMessageModal({
      isOpen: true,
      title: "Success",
      message: "User added successfully!",
      type: "success",
    });
  };

// CSV upload 
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const normalizeId = (s) => (s || "").toString().trim().toLowerCase();

  const reader = new FileReader();
  reader.onload = (e) => {
    const decoder = new TextDecoder("latin1");
    const csvText = decoder.decode(e.target.result);

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
          !firstRow["Section"] ||
          !firstRow["Sex"]
        ) {
          setMessageModal({
            isOpen: true,
            title: "Invalid CSV",
            message:
              "CSV must have headers: Student ID No., Full Name, Default Password, Program, Section, Sex. Please upload a valid file.",
            type: "error",
          });
          return;
        }

        // Parse rows -> normalized objects
        const parsedUsers = results.data.map((row) => ({
          id_number: (row["Student ID No."] || "").toString().trim(),
          name: (row["Full Name"] || "").toString().trim(),
          password: (row["Default Password"] || "").toString().trim(),
          program: (row["Program"] || "").toString().trim(),
          section: (row["Section"] || "").toString().trim(),
          sex: (row["Sex"] || "").toString().trim(),
          type: "Student",
          recentLogin: "Never",
        }));

        const existingUsers = JSON.parse(localStorage.getItem("userCSV")) || [];
        const existingIds = new Set(
          existingUsers.map((u) => normalizeId(u.id_number))
        );

        // Dedupe within the CSV AND against existing users
        const seenInFile = new Set();
        const toAdd = [];
        let skippedInFileDup = 0;
        let skippedExistingDup = 0;

        for (const u of parsedUsers) {
          const key = normalizeId(u.id_number);
          if (!key) continue; // skip blanks

          if (existingIds.has(key)) {
            skippedExistingDup++;
            continue;
          }
          if (seenInFile.has(key)) {
            skippedInFileDup++;
            continue;
          }
          seenInFile.add(key);
          toAdd.push(u);
        }

        if (toAdd.length === 0) {
          setMessageModal({
            isOpen: true,
            title: "Duplicate File",
            message:
              "No new users were added. All entries already exist or are duplicates within the file.",
            type: "error",
          });
          return;
        }

        // Merge and ensure SuperAdmin exists
        const merged = [...existingUsers, ...toAdd];
        if (!merged.find((u) => u.id_number === "admin")) {
          merged.unshift({
            id_number: "admin",
            name: "Administrator",
            password: "admin123",
            program: "-",
            section: "-",
            sex: "-",
            type: "SuperAdmin",
            recentLogin: "Never",
          });
        }

        localStorage.setItem("userCSV", JSON.stringify(merged));
        setUsers(merged);

        const skippedTotal = skippedInFileDup + skippedExistingDup;
        setMessageModal({
          isOpen: true,
          title: "Upload Result",
          message: `${toAdd.length} new user(s) added. ${skippedTotal} duplicate(s) skipped (${skippedInFileDup} in-file, ${skippedExistingDup} already existed).`,
          type: "success",
        });
      },
    });
  };

  reader.readAsArrayBuffer(file);
};


  // Filtering + Pagination
  const filteredUsers = users.filter((u) => {
    const matchesSection =
      filterSection === "All" ? true : u.section === filterSection;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // Reset modals
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
          sex: "-",
          type: "SuperAdmin",
          recentLogin: "Never",
        },
      ];
      localStorage.setItem("userCSV", JSON.stringify(adminOnly));
      localStorage.removeItem("uploadedFileHashes");
      setUsers(adminOnly);
    }

    // these must NOT be inside the "users" block
    if (activeReset === "inventorySeed") {
        try { localStorage.removeItem("inventoryLogs"); } catch {}
      resetToSeed(); 
    }
    
    if (activeReset === "stocksTo100") {
      resetAllStocks(); // sets quantity=100 for ALL items (seed + added)
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
          sex: "-",
          type: "SuperAdmin",
          recentLogin: "Never",
        },
      ];
      localStorage.setItem("userCSV", JSON.stringify(adminOnly));
      setUsers(adminOnly);

      resetToSeed();
    }

    closeModal();

    const msg =
      activeReset === "inventorySeed"
        ? "Inventory restored to default items."
        : activeReset === "stocksTo100"
        ? "All item stocks reset to 100."
        : activeReset === "all"
        ? "System data has been reset."
        : `${activeReset} has been reset.`;

    setMessageModal({
      isOpen: true,
      title: "Reset Successful",
      message: msg,
      type: "success",
    });
  };

  // ---- Edit/Delete handlers (for ACTIONS column) ----
  const openEditUser = (user) => {
    setEditingUser(user);
    setEditUserModalOpen(true);
  };

  const saveEditedUser = (updated) => {
    // protect SuperAdmin identity
    if (editingUser?.id_number === "admin" && updated.id_number !== "admin") {
      setMessageModal({
        isOpen: true,
        title: "Not Allowed",
        message: "You cannot change the SuperAdmin's ID.",
        type: "error",
      });
      return;
    }

    const existing = JSON.parse(localStorage.getItem("userCSV")) || [];
    // block duplicate IDs when changing id_number
    if (
      updated.id_number !== editingUser.id_number &&
      existing.some((u) => u.id_number === updated.id_number)
    ) {
      setMessageModal({
        isOpen: true,
        title: "Duplicate User",
        message: "A user with this ID already exists.",
        type: "error",
      });
      return;
    }

    const newList = users.map((u) =>
      u.id_number === editingUser.id_number ? { ...u, ...updated } : u
    );

    localStorage.setItem("userCSV", JSON.stringify(newList));
    setUsers(newList);

    setEditUserModalOpen(false);
    setEditingUser(null);

    setMessageModal({
      isOpen: true,
      title: "Success",
      message: "User updated successfully!",
      type: "success",
    });
  };

  const confirmDeleteUser = (user) => {
    if (user.id_number === "admin") {
      setMessageModal({
        isOpen: true,
        title: "Not Allowed",
        message: "You cannot delete the SuperAdmin account.",
        type: "error",
      });
      return;
    }
    setDeleteTarget(user);
    setDeleteUserModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (!deleteTarget) return;

    const newList = users.filter((u) => u.id_number !== deleteTarget.id_number);
    localStorage.setItem("userCSV", JSON.stringify(newList));
    setUsers(newList);

    setDeleteUserModalOpen(false);
    setDeleteTarget(null);

    setMessageModal({
      isOpen: true,
      title: "Deleted",
      message: "User removed successfully.",
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
            <button
              type="button"
              onClick={() => {
                setActiveReset("inventorySeed");
                setModalOpen(true);
              }}
              className="bg-white hover:bg-gray-100 text-black font-medium px-5 py-2 rounded-full text-sm border border-gray-300"
              title="Replace inventory with default seed items"
            >
              Reset Inventory
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveReset("stocksTo100");
                setModalOpen(true);
              }}
              className="bg-white hover:bg-gray-100 text-black font-medium px-5 py-2 rounded-full text-sm border border-gray-300"
              title="Reset all item stocks to 100"
            >
              Reset Stocks
            </button>

            <button
              onClick={() => setAddUserModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-5 py-1 rounded-full text-sm"
            >
              + Add User
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-black hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-full text-sm"
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

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by Name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />

              {/* Section Filter */}
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
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(9 * 3rem)" }}
            >
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="text-left border-b">
                    <th className="py-3 px-4">SCHOOL ID</th>
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-4">PROGRAM</th>
                    <th className="py-3 px-4">SECTION</th>
                    <th className="py-3 px-4">SEX</th>
                    <th className="py-3 px-4">RECENT LOGIN</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.id_number}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.program || "-"}</td>
                      <td className="py-3 px-4">{user.section || "-"}</td>
                      <td className="py-3 px-4">{user.sex || "-"}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {user.recentLogin || "Never"}
                      </td>
                      <td className="py-3 px-4">{user.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-4">
                          <FaPen
                            title="Edit"
                            aria-label="Edit user"
                            role="button"
                            tabIndex={0}
                            className="text-red-600 cursor-pointer outline-none"
                            onClick={() => openEditUser(user)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                openEditUser(user);
                            }}
                          />
                          <FaTrash
                            title="Delete"
                            aria-label="Delete user"
                            role="button"
                            tabIndex={0}
                            className="text-red-600 cursor-pointer outline-none"
                            onClick={() => confirmDeleteUser(user)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                confirmDeleteUser(user);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-4 text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Controls (Show Entries + Pagination) */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            <div className="self-start md:self-auto">
              <ShowEntries
                entriesPerPage={entriesPerPage}
                setEntriesPerPage={setEntriesPerPage}
                setCurrentPage={setCurrentPage}
              />
            </div>

            <div className="flex justify-center flex-1">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>

            <div className="w-[150px]" /> {/* spacer to balance flex */}
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

      {/* Add User Modal */}
      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onSave={handleAddUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={saveEditedUser}
      />

      {/* Delete User Confirm */}
      <DeleteUserConfirmModal
        isOpen={deleteUserModalOpen}
        onCancel={() => {
          setDeleteUserModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteUser}
        displayName={
          deleteTarget ? `${deleteTarget.name} (${deleteTarget.id_number})` : ""
        }
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

