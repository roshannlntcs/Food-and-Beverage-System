import React, { useCallback, useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { value: "CASHIER", label: "Cashier" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const normalizeSex = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";
  const upper = input.toUpperCase();
  if (upper === "M" || upper === "MALE") return "M";
  if (upper === "F" || upper === "FEMALE") return "F";
  return upper;
};

const normalizeRole = (value) => {
  const upper = String(value || "").trim().toUpperCase();
  return ROLE_OPTIONS.some((option) => option.value === upper)
    ? upper
    : "CASHIER";
};

const shapeForm = (user) => ({
  schoolId: user?.schoolId || "",
  username: user?.username || "",
  fullName: user?.fullName || "",
  program: user?.program || "",
  section: user?.section || "",
  sex: normalizeSex(user?.sex),
  role: normalizeRole(user?.role),
  resetPassword: "",
});

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [form, setForm] = useState(() => shapeForm(user));

  useEffect(() => {
    setForm(shapeForm(user));
  }, [user]);

  const closeModal = useCallback(() => {
    if (typeof onClose === "function") onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (typeof onSave !== "function") return;
    onSave(form);
  }, [form, onSave]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleSubmit, closeModal]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const roleOptions = ROLE_OPTIONS;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="bg-[#8B0000] text-white text-center py-2 rounded-t-lg text-lg font-semibold">
          Edit User
        </div>

        <div
          className="p-4 grid grid-cols-2 gap-2
            [&_input]:px-2 [&_input]:py-1 [&_input]:text-sm [&_input]:border [&_input]:border-gray-300 [&_input]:rounded
            [&_select]:px-2 [&_select]:py-1 [&_select]:text-sm [&_select]:border [&_select]:border-gray-300 [&_select]:rounded
            [&_label]:text-base [&_label]:font-semibold [&_label]:mb-1"
        >
          <div>
            <label>School ID</label>
            <input
              type="text"
              value={form.schoolId}
              onChange={(event) => updateField("schoolId", event.target.value)}
            />
          </div>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
            />
          </div>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>
          <div>
            <label>Program</label>
            <input
              type="text"
              value={form.program}
              onChange={(event) => updateField("program", event.target.value)}
            />
          </div>
          <div>
            <label>Section</label>
            <input
              type="text"
              value={form.section}
              onChange={(event) => updateField("section", event.target.value)}
            />
          </div>
          <div>
            <label>Sex</label>
            <select
              value={form.sex}
              onChange={(event) => updateField("sex", normalizeSex(event.target.value))}
            >
              <option value="">-</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label>Role</label>
            <select
              value={form.role}
              onChange={(event) => updateField("role", normalizeRole(event.target.value))}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label>Reset Password</label>
            <input
              type="password"
              value={form.resetPassword}
              onChange={(event) => updateField("resetPassword", event.target.value)}
              placeholder="Leave blank to keep the current password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2 px-4 pb-4">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
