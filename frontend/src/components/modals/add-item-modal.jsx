import React, { useState, useEffect } from 'react';

export default function AddItemModal({
  newItem,
  setNewItem,
  uniqueCategories,
  onClose,
  onSave,
  showErrorModal
}) {

  const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
    const handleKeyDown = (e) => {
      if (showErrorModal) {
        if (e.key === 'Escape') {
          e.preventDefault();         
          e.stopPropagation();        
        } else if (e.key === 'Enter') {
          e.preventDefault();         
        }
      } else {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();                  
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onSave();                   
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSave, showErrorModal]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
    {/* Header */}
    <div className="bg-[#8B0000] text-white text-center py-2 rounded-t-lg text-lg font-semibold">
      New Item
    </div>

    {/* Form */}
    <div className="p-4 grid grid-cols-2 gap-2 
    [&_input]:px-2 [&_input]:py-1 [&_input]:text-sm [&_input]:border [&_input]:border-gray-300 [&_input]:rounded [&_input]:focus:border-gray-500 [&_input]:focus:ring-1 [&_input]:focus:ring-gray-400
    [&_textarea]:px-2 [&_textarea]:py-1 [&_textarea]:text-sm [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:rounded [&_textarea]:focus:border-gray-500 [&_textarea]:focus:ring-1 [&_textarea]:focus:ring-gray-400
    [&_select]:px-2 [&_select]:py-1 [&_select]:text-sm [&_select]:border [&_select]:border-gray-300 [&_select]:rounded [&_select]:focus:border-gray-500 [&_select]:focus:ring-1 [&_select]:focus:ring-gray-400
    [&_label]:text-base [&_label]:font-semibold [&_label]:mb-1">

      
      {/* Name */}
      <div>
        <label className="block font-semibold">Name</label>
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block font-semibold">Category</label>
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        >
          <option value="">Select category</option>
          {uniqueCategories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

     {/* Description */}
<div className="col-span-2">
  <label className="block font-semibold">Description</label>
  <textarea
    className="w-full h-25 resize-y"
    value={newItem.description}
    onChange={(e) =>
      setNewItem({ ...newItem, description: e.target.value })
    }
  />
</div>


      {/* Price */}
      <div>
        <label className="block font-semibold">Price</label>
        <input
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block font-semibold">Stock</label>
        <input
          type="number"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
        />
      </div>

      {/* Sizes */}
      <div className="col-span-2">
        <label className="block font-semibold">Sizes</label>
        <input
          type="text"
          placeholder="e.g. Regular (₱0), Large (₱20)"
          value={Array.isArray(newItem.sizes)
            ? newItem.sizes.map(s =>
                typeof s === 'string'
                  ? s
                  : `${s.label}${s.price ? ` (₱${s.price})` : ''}`
              ).join(', ')
            : ''}
          onChange={(e) => {
            const parsedSizes = e.target.value.split(',').map(str => {
              const match = str.trim().match(/^(.+?)\s*\(₱?(\d+)\)$/);
              return match
                ? { label: match[1].trim(), price: parseFloat(match[2]) }
                : { label: str.trim(), price: 0 };
            });
            setNewItem({ ...newItem, sizes: parsedSizes });
          }}
        />
      </div>

      {/* Add-ons */}
      <div>
        <label className="block font-semibold">Add-ons</label>
        <input
          type="text"
          placeholder="e.g. Cheese (₱10), Bacon (₱15)"
          value={Array.isArray(newItem.addons) ? newItem.addons.join(', ') : newItem.addons}
          onChange={(e) => setNewItem({
            ...newItem,
            addons: e.target.value.split(',').map(a => a.trim())
          })}
        />
      </div>

      {/* Allergen */}
      <div>
        <label className="block font-semibold">Allergen</label>
        <input
          type="text"
          placeholder="e.g. Chicken, Nuts"
          value={newItem.allergens || ''}
          onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
        />
      </div>

      {/* Upload Image */}
      <div className="col-span-2">
        <label className="block font-semibold">Upload image</label>
        <div className="w-full border-2 border-dashed border-gray-300 rounded px-3 py-4 text-center text-sm">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
                setNewItem({ ...newItem, image: imageUrl });
              }
            }}
            className="hidden"
            id="add-upload-image"
          />
          <label htmlFor="add-upload-image" className="cursor-pointer block">
            <p className="text-xs text-gray-600">
              Drop files here or <span className="text-blue-600 underline">browse</span>
            </p>
          </label>

          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto h-16 w-16 rounded object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-2 mt-4 pr-4 pb-4">
      <button onClick={onClose} className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold">
        Cancel
      </button>
      <button onClick={onSave} className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full text-sm font-semibold">
        Save
      </button>
    </div>
  </div>
</div>

  );
}
