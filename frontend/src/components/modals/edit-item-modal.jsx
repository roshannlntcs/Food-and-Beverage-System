import React from 'react';

export default function EditItemModal({
  newItem,
  setNewItem,
  onClose,
  onSave
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-center">Edit Item</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Item Name</label>
            <input
              type="text"
              className="w-full border rounded px-4 py-2"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-1">Price</label>
            <input
              type="number"
              className="w-full border rounded px-4 py-2"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <input
              type="text"
              className="w-full border rounded px-4 py-2"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold mb-1">Quantity</label>
            <input
              type="number"
              className="w-full border rounded px-4 py-2"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select
              className="w-full border rounded px-4 py-2"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-semibold mb-1">Allergens</label>
            <input
              type="text"
              placeholder="e.g. dairy, nuts"
              className="w-full border rounded px-4 py-2"
              value={newItem.allergens || ''}
              onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
            />
          </div>

          {/* Add-ons */}
          <div>
            <label className="block text-sm font-semibold mb-1">Add-ons</label>
            <input
              type="text"
              placeholder="e.g. Cheese (₱10), Bacon (₱15)"
              className="w-full border rounded px-4 py-2"
              value={
                Array.isArray(newItem.addons)
                  ? newItem.addons.map(addon =>
                      typeof addon === 'string'
                        ? addon
                        : `${addon.label}${addon.price ? ` (₱${addon.price})` : ''}`
                    ).join(', ')
                  : newItem.addons
              }
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  addons: e.target.value.split(',').map(a => a.trim())
                })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              placeholder="Short product description"
              className="w-full border rounded px-4 py-2"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
