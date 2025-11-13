import React, { useState } from "react";

const ROLE_OPTIONS = [
  { value: "cashier", label: "Cashier" },
  { value: "admin", label: "Admin" },
];

const AddUserModal = ({ isOpen, onClose, onSave, onValidationError }) => {
  const [form, setForm] = useState({
    schoolId: "",
    username: "",
    fullName: "",
    password: "",
    program: "",
    section: "",
    sex: "",
    role: "cashier",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      if (name === "schoolId") {
        const shouldSyncUsername =
          !prev.username ||
          prev.username === "" ||
          prev.username === prev.schoolId;
        return {
          ...prev,
          schoolId: value,
          username: shouldSyncUsername ? value : prev.username,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = () => {
    const requiredFields = [
      "schoolId",
      "username",
      "fullName",
      "password",
      "program",
      "section",
      "sex",
    ];

    const hasMissing = requiredFields.some((key) => {
      const value = form[key];
      return !value || String(value).trim() === "";
    });

    if (hasMissing) {
      if (typeof onValidationError === "function") {
        onValidationError("Please fill in all required fields before saving.");
      }
      return;
    }

    onSave(form);
    onClose();
    setForm({
      schoolId: "",
      username: "",
      fullName: "",
      password: "",
      program: "",
      section: "",
      sex: "",
      role: "cashier",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[600px] max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 bg-[#8B0000] rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">Add New User</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg font-bold"
          >
            X
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="schoolId"
              placeholder="School ID"
              value={form.schoolId}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              name="program"
              placeholder="Program"
              value={form.program}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              name="section"
              placeholder="Section"
              value={form.section}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <select
              name="sex"
              value={form.sex}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select Sex</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
