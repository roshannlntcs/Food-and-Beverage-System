import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaTrash, FaEdit, FaCheckCircle } from "react-icons/fa";
import { useCategories } from "../../contexts/CategoryContext";

const DEFAULT_ICON = "/icons/pizza.png";

const DEFAULT_CATEGORIES = [
  { key: "Main Dish", icon: "/icons/rice_bowl.png", locked: true },
  { key: "Appetizers", icon: "/icons/guacamole.png", locked: true },
  { key: "Side Dish", icon: "/icons/potato.png", locked: true },
  { key: "Soup", icon: "/icons/soup_plate.png", locked: true },
  { key: "Dessert", icon: "/icons/birthday_cake.png", locked: true },
  { key: "Drinks", icon: "/icons/bottled_water.png", locked: true },
];

const OPTIONAL_CATEGORIES = [
  { key: "Pizza", icon: "/icons/pizza.png" },
  { key: "Pasta", icon: "/icons/spaghetti.png" },
  { key: "Rice Bowl", icon: "/icons/rice_bowl.png" },
  { key: "Cakes", icon: "/icons/birthday_cake.png" },
  { key: "Noodles", icon: "/icons/noodles.png" },
  { key: "Alcohol", icon: "/icons/alcoholic_cocktail.png" },
  { key: "Snacks", icon: "/icons/potato.png" },
  { key: "Wine", icon: "/icons/wine_glass.png" },
];

const canonicalKey = (name) => String(name || "").trim().toLowerCase();

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the selected image."));
    reader.readAsDataURL(file);
  });

const resolveIconSrc = (icon) => {
  if (!icon) return DEFAULT_ICON;
  if (
    icon.startsWith("http") ||
    icon.startsWith("data:") ||
    icon.startsWith("blob:")
  ) {
    return icon;
  }
  if (icon.startsWith("/")) return icon;
  return `/icons/${icon.replace(/^\/+/, "")}`;
};

const ManageCategoryModal = ({ isOpen = true, onClose }) => {
  const {
    categories: contextCategories = [],
    addCategory,
    updateCategory,
    removeCategory,
    refresh,
  } = useCategories() || {};

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [iconPreview, setIconPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOptionals, setSelectedOptionals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const defaultsLookup = useMemo(() => {
    const map = new Map();
    DEFAULT_CATEGORIES.forEach((cat) =>
      map.set(canonicalKey(cat.key), { ...cat })
    );
    return map;
  }, []);

  const syncCategories = useCallback(() => {
    const merged = [];
    const seen = new Set();

    contextCategories.forEach((cat) => {
      const canonical = canonicalKey(cat.name);
      const defaultPreset = defaultsLookup.get(canonical);
      merged.push({
        id: cat.id ?? null,
        key: cat.name,
        icon: cat.icon || cat.iconUrl || defaultPreset?.icon || DEFAULT_ICON,
        locked: Boolean(defaultPreset),
      });
      seen.add(canonical);
    });

    DEFAULT_CATEGORIES.forEach((cat) => {
      const canonical = canonicalKey(cat.key);
      if (!seen.has(canonical)) {
        merged.push({ ...cat, id: null });
      }
    });

    merged.sort((a, b) => a.key.localeCompare(b.key));
    setCategories(merged);
  }, [contextCategories, defaultsLookup]);

  useEffect(() => {
    if (!isOpen) return;
    syncCategories();
    setCategoryName("");
    setIconPreview(null);
    setEditTarget(null);
    setSelectedOptionals([]);
    setShowEditModal(false);
    setShowConfirm(false);
    setPendingDelete(null);
  }, [isOpen, syncCategories]);

  useEffect(() => {
    if (!isOpen) return;
    syncCategories();
  }, [contextCategories, isOpen, syncCategories]);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setShowConfirm(false);
      setShowEditModal(false);
      setPendingDelete(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (iconPreview && iconPreview.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  if (!isOpen) return null;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await toDataUrl(file);
      setIconPreview(dataUrl);
    } catch (err) {
      setSuccessMessage(err.message);
      setShowSuccess(true);
    }
  };

  const handleDeleteClick = (category) => {
    setPendingDelete(category);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.id) {
        await removeCategory?.(pendingDelete.id);
        await refresh?.();
      }
      setSuccessMessage("Category removed successfully!");
      setShowSuccess(true);
    } catch (err) {
      setSuccessMessage(err?.message || "Failed to remove category.");
      setShowSuccess(true);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPendingDelete(null);
  };

  const handleSave = async () => {
    const trimmedName = categoryName.trim();
    const isEditing = Boolean(editTarget);
    const optionalAdds = selectedOptionals.filter(
      (opt) =>
        !categories.some((cat) => canonicalKey(cat.key) === canonicalKey(opt.key))
    );

    if (!trimmedName && !isEditing && optionalAdds.length === 0) return;

    setSaving(true);
    try {
      if (trimmedName) {
        if (isEditing) {
          const payload = {
            name: editTarget.locked ? editTarget.key : trimmedName,
            icon: iconPreview || editTarget.icon || DEFAULT_ICON,
          };
          await updateCategory?.(editTarget.id, payload);
          setSuccessMessage("Category updated successfully!");
        } else if (!isEditing) {
          await addCategory?.({
            name: trimmedName,
            icon: iconPreview || DEFAULT_ICON,
          });
          setSuccessMessage("Category added successfully!");
        }
      }

      if (optionalAdds.length) {
        for (const opt of optionalAdds) {
          await addCategory?.({
            name: opt.key,
            icon: opt.icon || DEFAULT_ICON,
          });
        }
        if (!trimmedName) {
          setSuccessMessage("Optional categories added successfully!");
        }
      }

      await refresh?.();
      setShowSuccess(true);
    } catch (err) {
      setSuccessMessage(err?.message || "Failed to save category changes.");
      setShowSuccess(true);
    } finally {
      setSaving(false);
      setCategoryName("");
      setIconPreview(null);
      setEditTarget(null);
      setSelectedOptionals([]);
      setShowEditModal(false);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.key);
    setIconPreview(category.icon || DEFAULT_ICON);
    setEditTarget(category);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setCategoryName("");
    setIconPreview(null);
    setEditTarget(null);
    setShowEditModal(false);
  };

  const toggleOptional = (cat) => {
    const exists = selectedOptionals.some(
      (opt) => canonicalKey(opt.key) === canonicalKey(cat.key)
    );
    if (exists) {
      setSelectedOptionals((prev) =>
        prev.filter(
          (opt) => canonicalKey(opt.key) !== canonicalKey(cat.key)
        )
      );
    } else {
      setSelectedOptionals((prev) => [...prev, cat]);
    }
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    if (typeof onClose === "function") onClose();
  };

  const renderedOptional = OPTIONAL_CATEGORIES.map((opt) => {
    const alreadyExists = categories.some(
      (cat) => canonicalKey(cat.key) === canonicalKey(opt.key)
    );
    const isSelected = selectedOptionals.some(
      (cat) => canonicalKey(cat.key) === canonicalKey(opt.key)
    );
    return {
      ...opt,
      disabled: alreadyExists && !isSelected,
      checked: isSelected || alreadyExists,
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {!showSuccess && !showConfirm && !showEditModal && (
        <div className="bg-white w-[480px] rounded-2xl shadow-lg border border-[#800000] overflow-hidden">
          <div className="bg-[#8B0000] text-white text-center py-4 rounded-t-2xl">
            <h2 className="text-lg font-bold">Manage Category</h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">
                Add new category name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Enter here (e.g. Snacks)"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <label className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                📁 Upload Image
              </label>
            </div>

            {iconPreview && (
              <div className="ml-40">
                <img
                  src={iconPreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded border"
                />
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-2">Categories:</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                {categories.map((cat, index) => {
                  const isDefault = Boolean(cat.locked);
                  return (
                    <div
                      key={`${cat.key}-${index}`}
                      className={`flex items-center justify-between gap-3 rounded px-1 py-1 ${
                        isDefault ? "bg-gray-50" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 flex-1 ${
                          isDefault ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        <img
                          src={resolveIconSrc(cat.icon)}
                          alt={`${cat.key} icon`}
                          className={`w-6 h-6 object-contain border rounded bg-white ${
                            isDefault ? "opacity-70" : ""
                          }`}
                        />
                        <span className="flex-1 truncate">{cat.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(cat)}
                          className="text-[#800000] hover:text-red-700"
                          title="Edit category"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="text-[#800000] hover:text-red-700"
                          title={
                            isDefault
                              ? "Remove (restored after Reset Categories)"
                              : "Remove"
                          }
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">
                Optional Categories
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                {renderedOptional.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="accent-[#8B0000]"
                      checked={cat.checked}
                      disabled={cat.disabled}
                      onChange={() => toggleOptional(cat)}
                    />
                    <img
                      src={resolveIconSrc(cat.icon)}
                      alt={`${cat.key} icon`}
                      className="w-6 h-6 object-contain border rounded bg-white"
                    />
                    <span className="flex-1 text-gray-700 truncate">{cat.key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="bg-white w-[420px] rounded-2xl shadow-lg overflow-hidden text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center">
              <span className="text-white text-3xl">!</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Remove category warning</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove this category?
            <br />
            This will remove all items in this category.
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-60"
            >
              {deleting ? "Removing..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={cancelDelete}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="bg-white w-[360px] rounded-2xl shadow-lg overflow-hidden text-center p-8 space-y-4">
          <div className="flex items-center justify-center">
            <FaCheckCircle className="text-green-500 text-5xl" aria-hidden="true" />
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {successMessage || "Category saved successfully!"}
          </p>
          <button
            type="button"
            onClick={closeSuccess}
            className="bg-yellow-500 text-black px-8 py-2 rounded-full hover:bg-yellow-600"
          >
            OK
          </button>
        </div>
      )}

      {showEditModal && (
        <div className="bg-white w-[500px] rounded-2xl shadow-lg border border-[#800000] overflow-hidden p-8">
            <h3 className=" text-lg font-bold mb-6 text-left">Edit Category</h3>
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold mb-2">
              Change Category name :
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter category name"
            />
          </div>

          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold mb-2">
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

          <div className="mb-6 text-left">
            <p className="text-sm font-semibold mb-2">
              Or choose image below :
            </p>
            <div className="grid grid-cols-6 gap-3">
              {OPTIONAL_CATEGORIES.map((opt, index) => (
                <button
                  type="button"
                  key={`${opt.key}-${index}`}
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseEdit}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategoryModal;
