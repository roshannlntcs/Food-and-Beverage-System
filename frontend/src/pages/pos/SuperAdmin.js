import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";
import ResetConfirmationModal from "../../components/ResetConfirmationModal";
import MessageModal from "../../components/modals/MessageModal";
import AddUserModal from "../../components/modals/AddUserModal";
import EditUserModal from "../../components/modals/EditUserModal";
import DeleteUserConfirmModal from "../../components/modals/DeleteUserConfirmModal";
import { FaUsers, FaPen, FaTrash } from "react-icons/fa";
import { resetSystem, importUsers } from "../../api/admin";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../api/users";
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

const REQUIRED_CSV_HEADERS = ["Student ID No.", "Full Name"];
const PASSWORD_HEADER_CANDIDATES = ["Default Password", "Password"];
const CSV_SAMPLE_LIMIT = 5;

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
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleCsvImport = async (rows, headers = []) => {
    const headerList = Array.isArray(headers) ? headers : [];
    const headerLookup = new Map(
      headerList
        .filter((header) => typeof header === "string")
        .map((header) => [header.trim().toLowerCase(), header])
    );

    const resolveValue = (row, ...candidates) => {
      for (const candidate of candidates) {
        if (!candidate) continue;
        const normalized = String(candidate).trim().toLowerCase();
        const headerKey = headerLookup.get(normalized);
        if (headerKey && row && row[headerKey] !== undefined) return row[headerKey];
        const directKey =
          row &&
          Object.keys(row).find(
            (key) => String(key || "").trim().toLowerCase() === normalized
          );
        if (directKey) return row[directKey];
      }
      return undefined;
    };

    const missingHeaders = REQUIRED_CSV_HEADERS.filter(
      (header) => !headerLookup.has(header.toLowerCase())
    );
    const passwordHeader =
      headerList.find((header) =>
        PASSWORD_HEADER_CANDIDATES.some(
          (candidate) =>
            String(header || "").trim().toLowerCase() === candidate.toLowerCase()
        )
      ) ||
      PASSWORD_HEADER_CANDIDATES.find((candidate) =>
        headerLookup.has(candidate.toLowerCase())
      );

    if (missingHeaders.length || !passwordHeader) {
      const missing = [...missingHeaders];
      if (!passwordHeader) missing.push("Password / Default Password");
      showMessage(
        "CSV Missing Columns",
        `The uploaded file is missing the required column(s): ${missing.join(", ")}.`,
        "error"
      );
      return;
    }

    const duplicateRows = [];
    const skippedRows = [];
    const seenSchoolIds = new Set();
    const seenUsernames = new Set();
    const prepared = [];

    const formatSampleList = (entries, formatter) => {
      const sample = entries.slice(0, CSV_SAMPLE_LIMIT).map(formatter);
      const remaining = entries.length - sample.length;
      return `${sample.join(", ")}${remaining > 0 ? `, and ${remaining} more` : ""}`;
    };

    rows.forEach((row, index) => {
      if (!row || typeof row !== "object") {
        skippedRows.push(index + 2);
        return;
      }

      const schoolIdRaw = resolveValue(row, "Student ID No.", "Student ID");
      const usernameRaw = resolveValue(row, "Username", "User Name");
      const fullNameRaw = resolveValue(row, "Full Name", "Name");
      const passwordRaw = resolveValue(row, passwordHeader, ...PASSWORD_HEADER_CANDIDATES);

      const schoolId = String(schoolIdRaw || "").trim();
      const username = String((usernameRaw || schoolIdRaw) ?? "").trim();
      const fullName = String(fullNameRaw || "").trim();
      const password = String(passwordRaw || "").trim();
      const program = String(resolveValue(row, "Program") || "").trim();
      const section = String(resolveValue(row, "Section") || "").trim();
      const sex = String(resolveValue(row, "Sex") || "").trim();
      const role = mapCsvRole(resolveValue(row, "Role"));
      const rowNumber = index + 2;

      if (!schoolId || !username || !fullName || !password) {
        skippedRows.push(rowNumber);
        return;
      }

      const schoolKey = schoolId.toLowerCase();
      const usernameKey = username.toLowerCase();

      if (seenSchoolIds.has(schoolKey) || seenUsernames.has(usernameKey)) {
        duplicateRows.push({ row: rowNumber, schoolId, username });
        return;
      }

      seenSchoolIds.add(schoolKey);
      seenUsernames.add(usernameKey);

      prepared.push({
        schoolId,
        username,
        fullName,
        password,
        program,
        section,
        sex,
        role,
      });
    });

    if (!prepared.length) {
      showMessage(
        "No Valid Rows",
        "The CSV does not contain any complete user records.",
        "error"
      );
      return;
    }

    const existingIds = new Set(
      users
        .map((user) => String(user.schoolId || "").trim().toLowerCase())
        .filter(Boolean)
    );
    const existingUsernames = new Set(
      users
        .map((user) => String(user.username || "").trim().toLowerCase())
        .filter(Boolean)
    );

    const existingConflicts = [];
    const importable = prepared.filter((entry) => {
      const idKey = entry.schoolId.toLowerCase();
      const usernameKey = entry.username.toLowerCase();
      if (existingIds.has(idKey) || existingUsernames.has(usernameKey)) {
        existingConflicts.push(entry);
        return false;
      }
      return true;
    });

    if (!importable.length) {
      const notes = [];
      if (existingConflicts.length) {
        notes.push(
          `${existingConflicts.length} existing record${existingConflicts.length === 1 ? "" : "s"}`
        );
      }
      if (duplicateRows.length) {
        notes.push(
          `${duplicateRows.length} duplicate row${duplicateRows.length === 1 ? "" : "s"} inside the file`
        );
      }
      if (skippedRows.length) {
        notes.push(
          `${skippedRows.length} incomplete row${skippedRows.length === 1 ? "" : "s"}`
        );
      }
      const detail = notes.length
        ? `Nothing new to import. Skipped ${notes.join(", ")}.`
        : "No new user accounts were found in the uploaded file.";
      showMessage("No New Users", detail, "error");
      return;
    }

    try {
      await importUsers(importable);
      const fragments = [];
      fragments.push(
        `${importable.length} user${importable.length === 1 ? "" : "s"} imported successfully.`
      );
      if (existingConflicts.length) {
        const summary = formatSampleList(
          existingConflicts,
          (entry) => `${entry.fullName} (${entry.schoolId})`
        );
        fragments.push(
          `Skipped existing account${existingConflicts.length === 1 ? "" : "s"}: ${summary}.`
        );
      }
      if (duplicateRows.length) {
        const summary = formatSampleList(
          duplicateRows,
          (entry) => `row ${entry.row} (${entry.schoolId}/${entry.username})`
        );
        fragments.push(
          `Ignored duplicate row${duplicateRows.length === 1 ? "" : "s"} in the CSV: ${summary}.`
        );
      }
      if (skippedRows.length) {
        fragments.push(
          `Skipped ${skippedRows.length} incomplete row${skippedRows.length === 1 ? "" : "s"}.`
        );
      }
      showMessage("Upload Successful", fragments.join(" "), "success");
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

  const openEditUser = (record) => {
    if (!record) return;
    setEditingUser(record);
    setEditUserModalOpen(true);
  };

  const saveEditedUser = async (updatedForm) => {
    if (!editingUser) return;

    const clean = (value) => String(value || '').trim();
    const sexValue = clean(updatedForm.sex).toUpperCase();
    const normalizedSex =
      sexValue === 'M' || sexValue === 'F'
        ? sexValue
        : sexValue.startsWith('M')
        ? 'M'
        : sexValue.startsWith('F')
        ? 'F'
        : null;

    const payload = {
      schoolId: clean(updatedForm.schoolId),
      username: clean(updatedForm.username),
      fullName: clean(updatedForm.fullName),
      role: String(updatedForm.role || '').trim().toUpperCase() || 'CASHIER',
      program: clean(updatedForm.program) || null,
      section: clean(updatedForm.section) || null,
      sex: normalizedSex,
    };

    if (updatedForm.resetPassword && clean(updatedForm.resetPassword)) {
      payload.resetPassword = clean(updatedForm.resetPassword);
    }

    try {
      await updateUser(editingUser.id, payload);
      showMessage('User Updated', 'Changes saved successfully.');
      setEditUserModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Update user failed:', error);
      showMessage(
        'Unable to Update User',
        error?.message || 'Please review the details and try again.',
        'error'
      );
    }
  };

  const confirmDeleteUser = (record) => {
    if (!record) return;
    if (String(record.role || '').toUpperCase() === 'SUPER_ADMIN') {
      showMessage(
        'Action Not Allowed',
        'Super admin accounts cannot be deleted.',
        'error'
      );
      return;
    }
    setDeleteTarget(record);
    setDeleteUserModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteUser(deleteTarget.id);
      showMessage(
        "User Deleted",
        `${deleteTarget.fullName || deleteTarget.username || "User"} has been removed.`
      );
      setDeleteUserModalOpen(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      console.error("Delete user failed:", error);
      showMessage(
        "Unable to Delete User",
        error?.message || "Please try again later.",
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
      complete: async (results) => {
        try {
          await handleCsvImport(results.data || [], results.meta?.fields || []);
        } finally {
          event.target.value = "";
        }
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
      <div className="ml-20 w-full h-screen flex flex-col overflow-hidden">
        <div className="px-8 pt-8 pb-3 flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Administrator</h1>
          <AdminInfoDashboard2 />
        </div>

        <div className="flex-1 min-h-0 px-8 pb-8 overflow-hidden flex flex-col gap-6">
        <div className="flex justify-between items-center">
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

        <section className="flex flex-col bg-white rounded-lg shadow flex-none max-h-[65vh]">
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

          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto no-scrollbar max-h-[65vh]">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left border-b">
                  <th className="py-3 px-4">School ID</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">Recent Login</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  paginatedUsers.map((user) => {
                    const isSuperAdmin =
                      String(user.role || "").toUpperCase() === "SUPER_ADMIN";
                    return (
                      <tr key={user.id} className="border-b odd:bg-white even:bg-gray-50 hover:bg-[#f1f1f1]">
                        <td className="py-3 px-4">{user.schoolId || "N/A"}</td>
                        <td className="py-3 px-4">{user.username || "N/A"}</td>
                        <td className="py-3 px-4">{user.fullName || "N/A"}</td>
                        <td className="py-3 px-4">{user.program || "N/A"}</td>
                        <td className="py-3 px-4">{user.section || "N/A"}</td>
                        <td className="py-3 px-4">{user.sex || "N/A"}</td>
                        <td className="py-3 px-4">
                          {formatDateTime(user.lastLogin)}
                        </td>
                        <td className="py-3 px-4">
                          {ROLE_LABEL[user.role] || user.role || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-4">
                            <FaPen
                              title="Edit user"
                              aria-label="Edit user"
                              role="button"
                              tabIndex={0}
                              className="text-red-600 cursor-pointer outline-none"
                              onClick={() => openEditUser(user)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  openEditUser(user);
                                }
                              }}
                            />
                            <FaTrash
                              title={isSuperAdmin ? "Super admin cannot be deleted" : "Delete user"}
                              aria-label="Delete user"
                              role="button"
                              tabIndex={0}
                              className={`outline-none ${
                                isSuperAdmin
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-600 cursor-pointer"
                              }`}
                              onClick={() => {
                                if (!isSuperAdmin) confirmDeleteUser(user);
                              }}
                              onKeyDown={(event) => {
                                if ((event.key === "Enter" || event.key === " ") && !isSuperAdmin) {
                                  event.preventDefault();
                                  confirmDeleteUser(user);
                                }
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
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

      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={saveEditedUser}
      />

      <DeleteUserConfirmModal
        isOpen={deleteUserModalOpen}
        onCancel={() => {
          setDeleteUserModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteUser}
        userName={
          deleteTarget
            ? `${deleteTarget.fullName || deleteTarget.username || deleteTarget.schoolId || "User"}`
            : ""
        }
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







