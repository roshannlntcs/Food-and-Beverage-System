import React from 'react';

export default function AddItemModal({
  newItem,
  setNewItem,
  uniqueCategories,
  onClose,
  onSave
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Header */}
        <div className="bg-[#8B0000] text-white text-center py-3 rounded-t-lg text-xl font-semibold">
          New Item
        </div>

        {/* Form */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="">Select category</option>
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description (Full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows="2"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-1">Price</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold mb-1">Quantity</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-semibold mb-1">Size</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={newItem.size || ''}
              onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
            />
          </div>

          {/* Add-ons */}
          <div>
            <label className="block text-sm font-semibold mb-1">Add-ons</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. Cheese (₱10), Bacon (₱15)"
              value={Array.isArray(newItem.addons) ? newItem.addons.join(', ') : newItem.addons}
              onChange={(e) => setNewItem({
                ...newItem,
                addons: e.target.value.split(',').map(a => a.trim())
              })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* Allergen */}
          <div>
            <label className="block text-sm font-semibold mb-1">Allergen</label>
            <input
              type="text"
              placeholder="Pls. specify"
              className="w-full border rounded px-3 py-2"
              value={newItem.allergens || ''}
              onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
            />
          </div>

          {/* Upload Image (Full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">Upload image</label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded px-4 py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M7 16v-4m0 0V9a4 4 0 014-4h1m4 0h1a4 4 0 014 4v2m0 4v4M3 16v-4m0 0V9a4 4 0 014-4h1" />
              </svg>
              <p className="text-sm mt-2 text-gray-600">
                Drop files here or <span className="text-blue-600 cursor-pointer underline">browse</span>
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pr-6">
          <button onClick={onClose} className="px-6 py-2 bg-black text-white rounded-full font-semibold">
            Cancel
          </button>
          <button onClick={onSave} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full font-semibold">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
