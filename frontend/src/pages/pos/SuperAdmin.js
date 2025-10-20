import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";
import MessageModal from "../../components/modals/MessageModal";
import AddUserModal from "../../components/modals/AddUserModal";
import { FaUsers } from "react-icons/fa";
import { resetSystem, importUsers } from "../../api/admin";
import { fetchUsers, createUser } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";

const ROLE_LABEL = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CASHIER: "Cashier",
};

const RESET_WARNINGS = {
  transactions:
    "This will remove all transaction records (orders, order items, and payments). Do you want to continue?",
  voids: "This will remove all void logs. Do you want to continue?",
  users:
    "This will remove non-super-admin accounts. The current super admin will remain signed in. Do you want to continue?",
  categories:
    "This will remove all categories and products, then restore the default set. Transactions and void logs will also be cleared. Continue?",
  products:
    "This will remove all products and inventory logs, then restore the default catalog. Transactions and void logs will also be cleared. Continue?",
  all:
    "This will remove all transactions, void logs, products, categories, and non-super-admin users. Do you want to continue?",
};

const RESET_SUCCESS = {
  transactions: "All transactions have been cleared.",
  voids: "Void logs have been cleared.",
  users: "User accounts have been reset.",
  categories: "Categories and products have been restored to defaults.",
  products: "Products have been restored to defaults.",
  all: "System data has been reset to defaults.",
};

const formatDateTime = (value) => {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const mapCsvRole = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  return "CASHIER";
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { currentUser, authLoaded } = useAuth() || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSection, setFilterSection] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [pendingResetScope, setPendingResetScope] = useState("all");

  const fileInputRef = useRef(null);
  const resetMenuRef = useRef(null);

  const resetOptions = useMemo(
    () => [
      {
        scope: "transactions",
        label: "Reset Transactions",
        helper: "Clears orders and payments.",
      },
      {
        scope: "voids",
        label: "Reset Void Logs",
        helper: "Clears manager-approved void logs.",
      },
      {
        scope: "users",
        label: "Reset Users",
        helper: "Removes non-super-admin accounts.",
      },
      {
        scope: "categories",
        label: "Reset Categories",
        helper: "Restores default categories and products.",
      },
      {
        scope: "products",
        label: "Reset Products",
        helper: "Restores the default product catalog.",
      },
      {
        scope: "all",
        label: "Reset All Data",
        helper: "Clears everything and restores defaults.",
        accent: true,
      },
    ],
    []
  );

  const showMessage = useCallback((title, message, type = "success") => {
    setMessageModal({
      isOpen: true,
      title,
      message,
      type,
    });
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : []
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showMessage(
        "Unable to Load Users",
        error?.message || "Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    if (!authLoaded) return;

    if (!currentUser) {
      showMessage(
        "Authentication Required",
        "Please sign in again to access the superadmin tools.",
        "error"
      );
      navigate("/user-login");
      return;
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)) {
      showMessage(
        "Access Denied",
        "Only admins and superadmins can view this page.",
        "error"
      );
      return;
    }

    loadUsers();
  }, [authLoaded, currentUser, loadUsers, navigate, showMessage]);

  useEffect(() => {
    const handler = (event) => {
      if (showResetMenu && resetMenuRef.current && !resetMenuRef.current.contains(event.target)) {
        setShowResetMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showResetMenu]);

  const sections = useMemo(() => {
    return Array.from(
      new Set(
        users
          .map((user) => (user.section || "").trim())
          .filter((section) => section)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const section = filterSection.toLowerCase();
    return users.filter((user) => {
      const matchesSection =
        filterSection === "All" ||
        String(user.section || "")
          .toLowerCase()
          .includes(section);
      const matchesSearch =
        !query ||
        String(user.fullName || "")
          .toLowerCase()
          .includes(query) ||
        String(user.schoolId || "")
          .toLowerCase()
          .includes(query) ||
        String(user.username || "")
          .toLowerCase()
          .includes(query);

      return matchesSection && matchesSearch;
    });
  }, [users, searchTerm, filterSection]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / entriesPerPage)
  );
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleReset = async () => {
    const scope = pendingResetScope || "all";
    try {
      await resetSystem(scope);
      showMessage(
        "Reset Complete",
        RESET_SUCCESS[scope] || RESET_SUCCESS.all,
        "success"
      );
      await loadUsers();
    } catch (error) {
      console.error("Reset failed:", error);
      showMessage(
        "Reset Failed",
        error?.message || "Please try again later.",
        "error"
      );
    } finally {
      setResetModalOpen(false);
      setShowResetMenu(false);
      setPendingResetScope("all");
    }
  };

  const handleAddUser = async (form) => {
    const payload = {
      schoolId: form.schoolId.trim(),
      username: (form.username || form.schoolId).trim(),
      fullName: form.fullName.trim(),
      password: form.password.trim(),
      role: form.role === "admin" ? "ADMIN" : "CASHIER",
      program: form.program.trim() || null,
      section: form.section.trim() || null,
      sex: form.sex.trim() || null,
    };

    try {
      await createUser(payload);
      showMessage("User Added", "The user has been created successfully.");
      await loadUsers();
    } catch (error) {
      console.error("Create user failed:", error);
      showMessage(
        "Unable to Add User",
        error?.message || "Please review the details and try again.",
        "error"
      );
    }
  };

  const handleCsvImport = async (rows) => {
    const prepared = rows
      .map((row) => ({
        schoolId: row["Student ID No."]?.trim(),
        username: row["Username"]?.trim() || row["Student ID No."]?.trim(),
        fullName: row["Full Name"]?.trim(),
        password: row["Default Password"]?.trim() || row["Password"]?.trim(),
        program: row["Program"]?.trim(),
        section: row["Section"]?.trim(),
        sex: row["Sex"]?.trim(),
        role: mapCsvRole(row["Role"]),
      }))
      .filter(
        (user) =>
          user.schoolId &&
          user.username &&
          user.fullName &&
          user.password
      );

    if (!prepared.length) {
      showMessage(
        "No Valid Rows",
        "The CSV does not contain any valid user records.",
        "error"
      );
      return;
    }

    try {
      await importUsers(prepared);
      showMessage(
        "Upload Successful",
        `${prepared.length} users imported successfully.`
      );
      await loadUsers();
    } catch (error) {
      console.error("Import users failed:", error);
      showMessage(
        "Upload Failed",
        error?.message || "Please review the file and try again.",
        "error"
      );
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        handleCsvImport(results.data || []);
        event.target.value = "";
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        showMessage(
          "Upload Failed",
          "Unable to read the CSV file. Please try again.",
          "error"
        );
        event.target.value = "";
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f8f5f0]">
      <Sidebar />
      <div className="ml-20 p-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Administrator</h1>
          <AdminInfo />
        </div>

        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-3">
            <div className="relative z-40" ref={resetMenuRef}>
              <button
                type="button"
                onClick={() => setShowResetMenu((prev) => !prev)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition"
              >
                Reset System Data
              </button>
              {showResetMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 divide-y divide-gray-100">
                  {resetOptions.map((option) => (
                    <button
                      key={option.scope}
                      type="button"
                      onClick={() => {
                        setPendingResetScope(option.scope);
                        setShowResetMenu(false);
                        setResetModalOpen(true);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${option.accent ? "text-red-700 font-semibold hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <div>{option.label}</div>
                      <div className="text-xs text-gray-500">{option.helper}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition"
            >
              Import Users (CSV)
            </button>
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition text-sm"
            >
              + Add User
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <section className="bg-white rounded-lg shadow">
          <header className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <FaUsers /> Users
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name, ID, or username..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs text-gray-700"
                value={filterSection}
                onChange={(e) => {
                  setFilterSection(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left border-b">
                  <th className="py-3 px-4">School ID</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">Recent Login</th>
                  <th className="py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.schoolId || "—"}</td>
                      <td className="py-3 px-4">{user.username || "—"}</td>
                      <td className="py-3 px-4">{user.fullName || "—"}</td>
                      <td className="py-3 px-4">{user.program || "—"}</td>
                      <td className="py-3 px-4">{user.section || "—"}</td>
                      <td className="py-3 px-4">{user.sex || "—"}</td>
                      <td className="py-3 px-4">
                        {formatDateTime(user.lastLogin)}
                      </td>
                      <td className="py-3 px-4">
                        {ROLE_LABEL[user.role] || user.role || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
            <ShowEntries
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={(value) => {
                setEntriesPerPage(value);
                setCurrentPage(1);
              }}
              setCurrentPage={setCurrentPage}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
            <div className="w-[150px]" />
          </div>
        </section>
      </div>

      <ResetConfirmationModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setShowResetMenu(false);
          setPendingResetScope("all");
        }}
        onConfirm={handleReset}
        warningText={RESET_WARNINGS[pendingResetScope] || RESET_WARNINGS.all}
      />

      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onSave={handleAddUser}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </div>
  );
};

export default SuperAdmin;
