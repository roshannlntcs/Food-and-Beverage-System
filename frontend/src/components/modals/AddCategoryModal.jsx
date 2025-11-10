
import React, { useState } from "react";

const DEFAULT_ICON = "/assets/default-category.png";

export default function AddCategoryModal({ onClose, onAdded }) {
  const [categoryName, setCategoryName] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const cleanName = categoryName.trim();
    if (!cleanName || saving) return;

    setSaving(true);
    try {
      let iconData = null;
      if (iconFile) {
        iconData = await fileToDataUrl(iconFile);
      }

      if (typeof onAdded === "function") {
        await onAdded({
          name: cleanName,
          icon: iconData,
        });
      }

      if (typeof onClose === "function") onClose();
    } catch (error) {
      console.error("Failed to add category:", error);
      alert(error?.message || "Failed to add category. Please try again.");
    } finally {
      setSaving(false);
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
        <div className="px-10 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm font-semibold">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 border rounded px-3 py-2"
              disabled={saving}
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="w-32 text-sm font-semibold">Category Icon</label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700"
                disabled={saving}
              />
              <img
                src={iconPreview || DEFAULT_ICON}
                alt="Preview"
                className="w-16 h-16 object-cover rounded border"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-10 pb-6">
          <button
            onClick={() => {
              if (!saving && typeof onClose === "function") onClose();
            }}
            className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 disabled:opacity-60"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
