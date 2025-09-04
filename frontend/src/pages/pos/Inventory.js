// src/pages/admin/Inventory.js
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaPen } from 'react-icons/fa';
import AdminInfo from '../../components/AdminInfo';
import AddItemModal from '../../components/modals/add-item-modal';
import EditItemModal from '../../components/modals/edit-item-modal';
import LogsModal from '../../components/modals/logs-modal';
import CategoryFilterModal from '../../components/modals/category-filter-modal';
import { allItemsFlat } from '../../utils/data';
import ItemSaveSuccessModal from '../../components/modals/ItemSaveSuccessModal';
import ValidationErrorModal from '../../components/modals/ValidationErrorModal';
import AddCategoryModal from '../../components/modals/AddCategoryModal';
import ShowEntries from '../../components/ShowEntries';
import Pagination from '../../components/Pagination';
import { useCategories } from '../../contexts/CategoryContext';

const initialInventoryData = allItemsFlat;

export default function Inventory() {
  const [adminName, setAdminName] = useState(localStorage.getItem('fullName') || 'Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(initialInventoryData);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '', price: '', category: '', quantity: '', status: 'Available',
    allergens: '', addons: [], description: '', sizes: []
  });
  const [filterDate, setFilterDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // derive categories from inventory items (existing)
  const uniqueCategories = [...new Set(inventory.map(item => item.category))].filter(Boolean);

  // Use shared category context (so admin + POS share categories)
  // The provider must wrap the app (index.js) — defensive fallback to avoid crashes
  const categoriesCtx = useCategories() || {};
  const ctxCategoriesRaw = categoriesCtx.categories || [];
  const addCategory = categoriesCtx.addCategory || (() => {});

  // ctxCategoriesRaw entries may be strings OR objects like { key, icon }
  // map them to strings (keys)
  const ctxCategoryKeys = ctxCategoriesRaw
    .map(c => (typeof c === 'string' ? c : (c && c.key ? c.key : '')))
    .filter(Boolean);

  // Merge context categories and inventory-derived categories into a deduped array of strings
// Context categories take precedence over inventory-derived categories
const mergedCategoryKeys = (() => {
  const seen = new Map(); // lowercased key -> original casing

  // Add context categories first (objects or strings)
  ctxCategoriesRaw.forEach(c => {
    const key = typeof c === 'string' ? c.trim() : c?.key?.trim();
    if (!key) return;
    const lower = key.toLowerCase();
    if (!seen.has(lower)) seen.set(lower, key);
  });

  // Add inventory-derived categories (strings)
  uniqueCategories.forEach(c => {
    const key = c.trim();
    const lower = key.toLowerCase();
    if (!seen.has(lower)) seen.set(lower, key);
  });

  return Array.from(seen.values());
})();
  // control AddCategory modal visibility
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === '' || item.category === selectedCategory) &&
    (selectedStatus === '' || item.status === selectedStatus)
  );

  // pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / entriesPerPage));
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const filteredLogs = logs.filter(log =>
    !filterDate || log.datetime.startsWith(filterDate)
  );

  const formatDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || newItem.price === '' || newItem.quantity === '') {
      setErrorMessage('Please fill out all required fields: Name, Category, Price, and Quantity.');
      setShowErrorModal(true);
      return;
    }

    const price = parseFloat(newItem.price);
    const quantity = parseInt(newItem.quantity);

    if (isNaN(price) || isNaN(quantity)) {
      setErrorMessage('Invalid value for price or stock.');
      setShowErrorModal(true);
      return;
    }

    const newItemData = {
      ...newItem,
      price,
      quantity,
      sizes: newItem.sizes || [],
    };

    setInventory(prev => [...prev, newItemData]);


    setLogs(prev => [
      ...prev,
      {
        datetime: formatDateTime(),
        action: "Add",
        admin: adminName,
        product: newItemData.name,
        field: "New Product",
        stock: `${newItemData.quantity} pcs`,
        oldPrice: "",
        newPrice: `₱${newItemData.price}`,
        category: newItemData.category,
        detail: `Added new item: ${newItemData.name}`
      }
    ]);

    setShowAddModal(false);
    setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available', sizes: [] });
    setIsEditSuccess(false);
    setShowSaveModal(true);
  };

  const handleEditItem = () => {
    const updated = [...inventory];
    const oldItem = updated[selectedItemIndex];

    const updatedItem = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      quantity: parseInt(newItem.quantity),
      status: newItem.status,
      allergens: newItem.allergens || '',
      addons: newItem.addons || [],
      description: newItem.description || '',
      sizes: newItem.sizes || []
    };

    const formatSizes = (sizes) => {
      return sizes.map(s =>
        typeof s === 'string'
          ? s
          : `${s.label}${s.price ? ` (₱${s.price})` : ''}`
      ).join(', ');
    };

    let changes = [];
    if (oldItem.name !== updatedItem.name) {
      changes.push(`name from "${oldItem.name}" to "${updatedItem.name}"`);
    }
    if (oldItem.price !== updatedItem.price) {
      changes.push(`price from ₱${oldItem.price} to ₱${updatedItem.price}`);
    }
    if (oldItem.quantity !== updatedItem.quantity) {
      changes.push(`quantity from ${oldItem.quantity} to ${updatedItem.quantity}`);
    }
    if (oldItem.category !== updatedItem.category) {
      changes.push(`category from "${oldItem.category}" to "${updatedItem.category}"`);
    }
    if (oldItem.status !== updatedItem.status) {
      changes.push(`status from "${oldItem.status}" to "${updatedItem.status}"`);
    }
    if (oldItem.allergens !== updatedItem.allergens) {
      changes.push(`allergens changed`);
    }
    if (JSON.stringify(oldItem.addons) !== JSON.stringify(updatedItem.addons)) {
      changes.push(`addons changed`);
    }
    if (oldItem.description !== updatedItem.description) {
      changes.push(`description updated`);
    }
    if (JSON.stringify(oldItem.sizes) !== JSON.stringify(updatedItem.sizes)) {
      changes.push(`sizes from "${formatSizes(oldItem.sizes)}" to "${formatSizes(updatedItem.sizes)}"`);
    }

    const detailText = changes.length > 0
      ? `Updated ${changes.join(', ')}`
      : `No changes made`;

    updated[selectedItemIndex] = updatedItem;
    setInventory(updated);

    // if edited category is new, add to context
    const editCatLower = (updatedItem.category || '').toLowerCase();
    const existsEdit = mergedCategoryKeys.some(k => k.toLowerCase() === editCatLower);
    if (updatedItem.category && !existsEdit) {
      try {
        addCategory({ key: updatedItem.category, icon: '/assets/default-category.png' });
      } catch (e) {}
    }

    setLogs(prev => [
      ...prev,
      {
        datetime: formatDateTime(),
        action: "Update",
        admin: adminName || '—',
        product: updatedItem.name || '—',
        field: "Edited Fields",
        stock: `${updatedItem.quantity ?? 0} pcs`,
        oldPrice: updatedItem.price ? `₱${oldItem.price}` : '—',
        newPrice: updatedItem.price ? `₱${updatedItem.price}` : '—',
        category: updatedItem.category || '—',
        detail: detailText
      }
    ]);

    setShowEditModal(false);
    setIsEditSuccess(true);
    setShowSaveModal(true);
  };

  // called when admin AddCategoryModal reports new category; we also add to context
 const handleAdminAddCategory = (newCatRaw) => {
  const clean = (newCatRaw || '').trim();
  if (!clean) return;

  // Add to context (so POS and other admin pages see it)
  try {
    addCategory({ key: clean, icon: '/assets/default-category.png' });
  } catch (e) {}

  // Add a log entry for the new category
  setLogs(prevLogs => [
    ...prevLogs,
    {
      datetime: formatDateTime(),
      action: "Add",
      admin: adminName,
      product: "—",
      field: "Category",
      stock: "—",
      oldPrice: "",
      newPrice: "",
      category: clean,          // show the newly added category
       detail: `added new category: "${clean}"`   // detail text
    }
  ]);
};
  

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <AdminInfo />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
              <input
                type="text"
                placeholder="Search"
                className="outline-none w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="text-gray-500 text-sm" />
            </div>

            {selectedCategory && (
              <div className="text-sm text-gray-700 flex items-center">
                Filter: <span className="font-semibold ml-1">{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-sm font-semibold border border-yellow-500 rounded-full"
            >
              + Add Category
            </button>

            <button
              onClick={() => {
                setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' });
                setShowAddModal(true);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-sm font-semibold border border-yellow-500 rounded-full"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
  <tr className="text-left">
    <th className="p-3">No.</th>
    <th className="p-3">Name</th>
    <th className="p-3">Price</th>
    <th className="p-3">
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">Category</span>
        <div className="relative inline-block">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-[#8B0000] text-white pr-6 pl-2 py-1 rounded text-sm font-medium border-none cursor-pointer"
            style={{ width: '24px' }}
          >
            <option value="">All</option>
            {mergedCategoryKeys.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </th>
    <th className="p-3">Allergens</th>
    <th className="p-3">Add-ons</th>
    <th className="p-3">Description</th>
    <th className="p-3">Sizes</th>
    <th className="p-3 text-center">Stock</th>
    <th className="p-3 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-white font-semibold">Status</span>
        <div className="relative inline-block">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
             className="appearance-none bg-[#8B0000] text-white pr-6 pl-2 py-0.5 rounded text-xs font-medium border-none cursor-pointer"
            style={{ width: '24px' }}
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
          <div className="pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </th>
    <th className="p-3 text-center">Edit</th>
  </tr>
</thead>




              <tbody>
                {paginatedInventory.map((item, index) => (
                  <tr key={index} className="bg-[#fdfdfd] border-b hover:bg-[#f1f1f1]">
                    <td className="p-3">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">₱{item.price.toFixed(2)}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.allergens || '—'}</td>
                    <td className="p-3">
                      {Array.isArray(item.addons)
                        ? item.addons.map(a =>
                          typeof a === 'string'
                            ? a
                            : `${a.label}${a.price ? ` (₱${a.price})` : ''}`
                        ).join(', ')
                        : '—'}
                    </td>
                    <td className="p-3">{item.description || '—'}</td>
                    <td className="p-3">
                      {Array.isArray(item.sizes)
                        ? item.sizes.map(size =>
                          typeof size === 'string'
                            ? size
                            : `${size.label}${size.price ? ` (₱${size.price})` : ''}`
                        ).join(', ')
                        : '—'}
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${item.status === 'Available' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <FaPen
                        className="text-red-600 cursor-pointer mx-auto"
                        onClick={() => {
                          setSelectedItemIndex((currentPage - 1) * entriesPerPage + index);
                          setNewItem({
                            name: item.name,
                            price: item.price,
                            category: item.category,
                            quantity: item.quantity,
                            status: item.status,
                            allergens: item.allergens,
                            addons: item.addons,
                            description: item.description,
                            sizes: item.sizes || []
                          });
                          setShowEditModal(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}

                {paginatedInventory.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* footer controls */}
        <div className="mt-4 flex justify-between items-center">
          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={(n) => { setEntriesPerPage(n); setCurrentPage(1); }}
            setCurrentPage={setCurrentPage}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />

          <button
            onClick={() => setShowLogsModal(true)}
            className="px-5 py-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500 rounded-full text-sm"
          >
            View Logs
          </button>
        </div>

        {showAddModal && (
          <AddItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategoryKeys}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
          />
        )}

        {showEditModal && (
          <EditItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategoryKeys}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditItem}
          />
        )}

        {showCategoryFilter && (
          <CategoryFilterModal
            selectedCategory={selectedCategory}
            uniqueCategories={mergedCategoryKeys}
            onSelect={(cat) => {
              setSelectedCategory(cat === 'All' ? '' : cat);
              setShowCategoryFilter(false);
            }}
            onClose={() => setShowCategoryFilter(false)}
          />
        )}

        {showLogsModal && (
          <LogsModal
            logs={logs}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onClose={() => setShowLogsModal(false)}
          />
        )}
        {showSaveModal && (
          <ItemSaveSuccessModal
            onClose={() => setShowSaveModal(false)}
            isEdit={isEditSuccess}
          />
        )}
        {showErrorModal && (
          <ValidationErrorModal
            message={errorMessage}
            onClose={() => setShowErrorModal(false)}
          />
        )}
        
       {showAddCategoryModal && (
  <AddCategoryModal
    onClose={() => setShowAddCategoryModal(false)}
    onAdded={(newCat, iconPath) => {
      const clean = (newCat || "").trim();
      if (!clean) return setShowAddCategoryModal(false);

      // Add to context once
      try {
        addCategory({ key: clean, icon: iconPath || "/assets/default-category.png" });
      } catch (e) {}

      // Add log entry
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          datetime: formatDateTime(),
          action: "Add",
          admin: adminName,
          product: "—",
          field: "Category",
          stock: "—",
          oldPrice: "",
          newPrice: "",
          category: clean,
          detail: `Added new category: "${clean}"`
        }
      ]);

      setShowAddCategoryModal(false);
    }}
  />
)}

      </div>
    </div>
  );
}
