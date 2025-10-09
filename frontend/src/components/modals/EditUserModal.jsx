import React, { useEffect, useState } from "react";

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [form, setForm] = useState(user || {});

  useEffect(() => setForm(user || {}), [user]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Enter") { e.preventDefault(); onSave(form); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, form, onSave, onClose]);

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
              value={form.id_number || ""}
              onChange={(e) => update("id_number", e.target.value)}
            />
          </div>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div>
            <label>Program</label>
            <input
              type="text"
              value={form.program || ""}
              onChange={(e) => update("program", e.target.value)}
            />
          </div>
          <div>
            <label>Section</label>
            <input
              type="text"
              value={form.section || ""}
              onChange={(e) => update("section", e.target.value)}
            />
          </div>
          <div>
            <label>Sex</label>
            <select
              value={form.sex || ""}
              onChange={(e) => update("sex", e.target.value)}
            >
              <option value="">-</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label>Type</label>
            <select
              value={form.type || "Student"}
              onChange={(e) => update("type", e.target.value)}
            >
              <option>Student</option>
              <option>Admin</option>
              <option>SuperAdmin</option>
            </select>
          </div>
          <div className="col-span-2">
            <label>Password</label>
            <input
              type="text"
              value={form.password || ""}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2 px-4 pb-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
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
