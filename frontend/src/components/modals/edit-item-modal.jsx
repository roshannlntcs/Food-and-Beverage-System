import React, { useEffect, useState } from 'react';

const PESO = '\u20B1';

const parseOptionList = (value) =>
  value
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return null;
      const match = trimmed.match(/^(.+?)\s*\(\u20B1?\s*([0-9]+(?:\.[0-9]+)?)\)$/i);
      if (match) {
        return { label: match[1].trim(), price: Number(match[2]) };
      }
      return { label: trimmed, price: 0 };
    })
    .filter(Boolean);

const formatOptionList = (list) =>
  Array.isArray(list)
    ? list
        .map((entry) =>
          typeof entry === 'string'
            ? entry
            : `${entry.label}${entry.price ? ` (${PESO}${Number(entry.price).toFixed(2)})` : ''}`
        )
        .join(', ')
    : '';

const compressFileToDataUrl = (file, maxSide = 800, quality = 0.75) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width: w, height: h } = img;
        const max = Math.max(w, h);
        if (max > maxSide) {
          const ratio = maxSide / max;
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function EditItemModal({
  newItem,
  setNewItem,
  uniqueCategories,
  onClose,
  onSave,
  deriveStatus,
}) {
  const [imagePreview, setImagePreview] = useState(newItem?.image || null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSave]);

  useEffect(() => {
    setImagePreview(newItem?.image || null);
  }, [newItem?.image]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await compressFileToDataUrl(file, 600, 0.75);
      setImagePreview(dataUrl);
      setNewItem((prev) => ({ ...prev, image: dataUrl }));
    } catch (error) {
      console.error('Image compression failed', error);
    }
  };

  const handleQuantityChange = (value) => {
    const qtyNumber = Number(value);
    setNewItem((prev) => ({
      ...prev,
      quantity: value,
      status: deriveStatus ? deriveStatus(qtyNumber) : prev.status,
    }));
  };

  const statusLabel =
    newItem.status ||
    (deriveStatus ? deriveStatus(Number(newItem.quantity || 0)) : 'Available');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-[#8B0000] text-white text-center py-2 rounded-t-lg text-lg font-semibold">
          Edit Item
        </div>

        <div
          className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2
            [&_input]:px-2 [&_input]:py-1 [&_input]:text-sm [&_input]:border [&_input]:border-gray-300 [&_input]:rounded [&_input]:focus:border-gray-500 [&_input]:focus:ring-1 [&_input]:focus:ring-gray-400
            [&_textarea]:px-2 [&_textarea]:py-1 [&_textarea]:text-sm [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:rounded [&_textarea]:focus:border-gray-500 [&_textarea]:focus:ring-1 [&_textarea]:focus:ring-gray-400
            [&_select]:px-2 [&_select]:py-1 [&_select]:text-sm [&_select]:border [&_select]:border-gray-300 [&_select]:rounded [&_select]:focus:border-gray-500 [&_select]:focus:ring-1 [&_select]:focus:ring-gray-400
            [&_label]:text-sm [&_label]:font-semibold [&_label]:mb-1"
        >
          <div>
            <label className="block font-semibold">Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold">Category</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="">Select category</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block font-semibold">Description</label>
            <textarea
              className="w-full h-20 resize-y"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold">Price</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold">Stock</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Status: {statusLabel}</p>
          </div>

          <div className="col-span-2">
            <label className="block font-semibold">Sizes</label>
            <input
              type="text"
              placeholder={`e.g. Large (${PESO}20), Extra Large (${PESO}35)`}
              value={formatOptionList(newItem.sizes)}
              onChange={(e) =>
                setNewItem({ ...newItem, sizes: parseOptionList(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block font-semibold">Add-ons</label>
            <input
              type="text"
              placeholder={`e.g. Cheese (${PESO}10)`}
              value={formatOptionList(newItem.addons)}
              onChange={(e) =>
                setNewItem({ ...newItem, addons: parseOptionList(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block font-semibold">Allergen</label>
            <input
              type="text"
              placeholder="e.g. Chicken, Nuts"
              value={newItem.allergens || ''}
              onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="block font-semibold">Upload image</label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded px-3 py-4 text-center text-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="edit-upload-image"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
              <label htmlFor="edit-upload-image" className="cursor-pointer block">
                <p className="text-xs text-gray-600">
                  Drop files here or <span className="text-blue-600 underline">browse</span>
                </p>
              </label>

              {imagePreview ? (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-12 w-12 rounded object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-500">No image attached</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pr-4 pb-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
