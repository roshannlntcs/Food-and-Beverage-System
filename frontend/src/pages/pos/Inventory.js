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

  const uniqueCategories = [...new Set(inventory.map(item => item.category))];
  const [categories, setCategories] = useState(uniqueCategories);
  const mergedCategories = Array.from(new Set([...(categories || []), ...uniqueCategories]));
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === '' || item.category === selectedCategory) &&
    (selectedStatus === '' || item.status === selectedStatus)
  );

  // pagination logic
  const totalPages = Math.ceil(filteredInventory.length / entriesPerPage);
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

    setInventory([...inventory, newItemData]);

    if (newItemData.category && !categories.includes(newItemData.category)) {
      setCategories(prev => [...prev, newItemData.category]);
    }

    setLogs([...logs, {
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
    }]);

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

    if (updatedItem.category && !categories.includes(updatedItem.category)) {
      setCategories(prev => [...prev, updatedItem.category]);
    }

    setLogs([
      ...logs,
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
                className="outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="text-gray-500" />
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
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-lg font-semibold border border-yellow-500 rounded-full"
            >
              + Add Category
            </button>

            <button
              onClick={() => {
                setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' });
                setShowAddModal(true);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-lg font-semibold border border-yellow-500 rounded-full"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Allergens</th>
                  <th className="p-3">Add-ons</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Sizes</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3 text-center">Status</th>
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
            setEntriesPerPage={setEntriesPerPage}
            setCurrentPage={setCurrentPage}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />

          <button
            onClick={() => setShowLogsModal(true)}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500 rounded-full"
          >
            View Logs
          </button>
        </div>

        {showAddModal && (
          <AddItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategories}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
          />
        )}

        {showEditModal && (
          <EditItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategories}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditItem}
          />
        )}

        {showCategoryFilter && (
          <CategoryFilterModal
            selectedCategory={selectedCategory}
            uniqueCategories={mergedCategories}
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
            onAdd={(newCat) => {
              const clean = (newCat || '').trim();
              if (!clean) return setShowAddCategoryModal(false);
              if (!categories.includes(clean)) {
                setCategories(prev => [...prev, clean]);
                setLogs((prevLogs) => [
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
                  },
                  ...prevLogs,
                ]);
              }
              setShowAddCategoryModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
