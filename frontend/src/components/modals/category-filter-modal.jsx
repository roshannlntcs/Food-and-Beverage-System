import React from 'react';

export default function CategoryFilterModal({
  uniqueCategories = [],
  selectedCategory,
  onSelect,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        {/* Modal Title */}
        <h3 className="text-xl font-bold mb-4 text-center">Filter by Category</h3>

        {/* Category List */}
        <div className="space-y-2">
          {['All', ...uniqueCategories].map((cat) => (
            <button
              key={cat}
              className={`w-full px-4 py-2 rounded text-left border ${
                (selectedCategory === cat || (cat === 'All' && selectedCategory === ''))
                  ? 'bg-yellow-400'
                  : 'bg-white'
              } hover:bg-yellow-200`}
              onClick={() => onSelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
