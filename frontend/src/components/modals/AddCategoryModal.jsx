import React, { useState } from "react";

export default function AddCategoryModal({ onClose, onAdd }) {
  const [categoryName, setCategoryName] = useState("");

  const handleSave = () => {
    const cleanName = categoryName.trim();
    if (cleanName) {
      onAdd(cleanName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#8B0000] text-white text-center py-5 rounded-t-2xl">
          <h2 className="text-lg font-bold">Add New Category</h2>
        </div>

        {/* Body */}
        <div className="px-10 py-8 space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm font-semibold">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-10 pb-6">
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
