// src/components/admin/ManageCategoryModal.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useCategories } from "../../contexts/CategoryContext";

export default function ManageCategoryModal({ onClose }) {
  const { addCategory, removeCategory } = useCategories();

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [iconPreview, setIconPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // delete confirm states
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Default locked categories
  const defaults = [
    { key: "Main Dish", icon: "/assets/default-category.png", locked: true },
    { key: "Appetizers", icon: "/assets/default-category.png", locked: true },
    { key: "Side Dish", icon: "/assets/default-category.png", locked: true },
    { key: "Soup", icon: "/assets/default-category.png", locked: true },
    { key: "Desserts", icon: "/assets/default-category.png", locked: true },
    { key: "Drinks", icon: "/assets/default-category.png", locked: true },
  ];

  // ✅ Optional categories (fixed names + spelling)
  const optionalCategories = [
    { key: "Alcoholic Cocktail", icon: "/icons/alcoholic_cocktail.png" },
    { key: "Banana Split", icon: "/icons/banana_split.png" },
    { key: "Birthday Cake", icon: "/icons/birthday_cake.png" },
    { key: "Bottle of Water", icon: "/icons/bottled_water.png" },
    { key: "Dessert", icon: "/icons/dessert.png" },
    { key: "Guacamole", icon: "/icons/guacamole.png" },
    { key: "Lemonade", icon: "/icons/lemonade.png" },
    { key: "Macaron", icon: "/icons/macaron.png" },
    { key: "Milkshake", icon: "/icons/milkshake.png" },
    { key: "Nachos", icon: "/icons/nachos.png" },
    { key: "Noodles", icon: "/icons/noodles.png" },
    { key: "Pie", icon: "/icons/pie.png" },
    { key: "Pizza", icon: "/icons/pizza.png" },
    { key: "Potato", icon: "/icons/potato.png" },
    { key: "Rice Bowl", icon: "/icons/rice_bowl.png" },
    { key: "Soup Plate", icon: "/icons/soup_plate.png" },
    { key: "Spaghetti", icon: "/icons/spaghetti.png" },
    { key: "Wine", icon: "/icons/wine_glass.png" },
  ];

  const [selectedOptionals, setSelectedOptionals] = useState([]);

  // ✅ Load categories from storage + merge with defaults
  useEffect(() => {
    let custom = [];
    const saved = localStorage.getItem("categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        custom = parsed.filter((c) => !defaults.some((d) => d.key === c.key));
      } catch (e) {}
    }

    const merged = [...defaults, ...custom];
    setCategories(merged);
    localStorage.setItem("categories", JSON.stringify(merged));
  }, []);

  const updateStorage = (updated) => {
    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Open delete confirm
  const handleDeleteClick = (catKey) => {
    const target = categories.find((c) => c.key === catKey);
    if (target?.locked) return;
    setPendingDelete(catKey);
    setShowConfirm(true);
  };

  // ✅ Confirm deletion
  const confirmDelete = () => {
    if (!pendingDelete) return;

    const updated = categories.filter((cat) => cat.key !== pendingDelete);
    updateStorage(updated);

    try {
      removeCategory(pendingDelete);
    } catch (e) {}

    setPendingDelete(null);
    setShowConfirm(false);
    setSuccessMessage("Category removed successfully!");
    setShowSuccess(true);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setShowConfirm(false);
  };

  // ✅ Save new + edit + optional
  const handleSave = () => {
    let updated = [...categories];
    let didSomething = false;

    const clean = categoryName.trim();
    if (clean) {
      didSomething = true;
      if (editIndex !== null) {
        if (!categories[editIndex]?.locked) {
          updated = categories.map((cat, i) =>
            i === editIndex
              ? { key: clean, icon: iconPreview || cat.icon }
              : cat
          );
          setSuccessMessage("Category updated successfully!");
        }
      } else {
        const newCat = {
          key: clean,
          icon: iconPreview || "/assets/default-category.png",
        };
        updated = [...categories, newCat];
        try {
          addCategory(newCat);
        } catch (e) {}
        setSuccessMessage("Category added successfully!");
      }
    }

    if (selectedOptionals.length > 0) {
      didSomething = true;
      selectedOptionals.forEach((opt) => {
        if (!updated.some((c) => c.key === opt.key)) {
          updated.push(opt);
          try {
            addCategory(opt);
          } catch (e) {}
        }
      });

      if (!clean && editIndex === null) {
        setSuccessMessage("Optional categories added successfully!");
      }
    }

    if (!didSomething) return;

    updateStorage(updated);
    setShowSuccess(true);

    setCategoryName("");
    setIconPreview(null);
    setEditIndex(null);
    setSelectedOptionals([]);
    setShowEditModal(false);
  };

  const handleEdit = (index) => {
    const cat = categories[index];
    if (cat?.locked) return;

    setCategoryName(cat.key);
    setIconPreview(cat.icon);
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setCategoryName("");
    setIconPreview(null);
    setEditIndex(null);
    setShowEditModal(false);
  };

  const handleToggleOptional = (cat) => {
    if (selectedOptionals.some((c) => c.key === cat.key)) {
      setSelectedOptionals(selectedOptionals.filter((c) => c.key !== cat.key));
    } else {
      setSelectedOptionals([...selectedOptionals, cat]);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Main Modal */}
      {!showSuccess && !showConfirm && !showEditModal && (
        <div className="bg-white w-[500px] rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#8B0000] text-white text-center py-4 rounded-t-2xl">
            <h2 className="text-lg font-bold">Manage Category</h2>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Add New */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">
                Enter new category name:
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Type here..."
                className="flex-1 border rounded px-3 py-2"
              />
              <label className="cursor-pointer text-sm font-medium text-gray-700">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                📁 Upload Image
              </label>
            </div>

            {iconPreview && (
              <div className="ml-40">
                <img src={iconPreview} alt="Preview" className="w-16 h-16 object-cover rounded border" />
              </div>
            )}

            {/* Available */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Available</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                {categories.map((cat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" className="accent-[#8B0000]" />
                    <span className="flex-1 text-gray-700">{cat.key}</span>
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-[#800000] hover:text-red-700"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat.key)}
                      className="text-[#800000] hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Optional Categories</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                {optionalCategories.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-[#8B0000]"
                      checked={
                        selectedOptionals.some((c) => c.key === cat.key) ||
                        categories.some((c) => c.key === cat.key)
                      }
                      onChange={() => handleToggleOptional(cat)}
                    />
                    <span className="flex-1 text-gray-700">{cat.key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 pb-6">
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
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="bg-white w-[420px] rounded-2xl shadow-lg overflow-hidden text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center">
              <span className="text-white text-3xl">!</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Remove category warning</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove this category?<br />
            This will remove all items in this category.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={confirmDelete}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600"
            >
              Confirm
            </button>
            <button
              onClick={cancelDelete}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="bg-white w-[400px] rounded-2xl shadow-lg overflow-hidden text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-3xl">✔</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">{successMessage}</h3>
          <button
            onClick={handleCloseSuccess}
            className="bg-yellow-500 text-black px-8 py-2 rounded-full hover:bg-yellow-600"
          >
            OK
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="bg-white w-[500px] rounded-2xl shadow-lg overflow-hidden p-8">
          <h3 className="text-lg font-bold mb-6 text-left">Edit Category</h3>

          {/* Change Category Name */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold mb-1">
              Change Category name :
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter category name"
            />
          </div>

          {/* Change Image */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold mb-1">
              Change Image :
            </label>
            <div className="flex items-center gap-3">
              {iconPreview && (
                <img
                  src={iconPreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded border"
                />
              )}
              <label className="cursor-pointer text-sm text-blue-600 underline">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                Click here to browse
              </label>
            </div>
          </div>

          {/* Choose from preset icons */}
          <div className="mb-6 text-left">
            <p className="text-sm font-semibold mb-2">
              Or choose image below :
            </p>
            <div className="grid grid-cols-6 gap-3">
              {optionalCategories.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setIconPreview(opt.icon)}
                  className={`p-2 border rounded hover:border-yellow-500 ${
                    iconPreview === opt.icon
                      ? "border-yellow-500"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={opt.icon}
                    alt="icon"
                    className="w-8 h-8 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCloseEdit}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
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
      )}
    </div>
  );
}
