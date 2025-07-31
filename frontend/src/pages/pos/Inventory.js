import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaPen } from 'react-icons/fa';
import AdminInfo from '../../components/AdminInfo';
import AddItemModal from '../../components/modals/add-item-modal';
import EditItemModal from '../../components/modals/edit-item-modal';
import LogsModal from '../../components/modals/logs-modal';
import CategoryFilterModal from '../../components/modals/category-filter-modal';
import { allItemsFlat } from '../../utils/data';

const initialInventoryData = allItemsFlat;


export default function Inventory() {
  const [adminName, setAdminName] = useState(localStorage.getItem('adminFullName') || 'Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(initialInventoryData);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [newItem, setNewItem] = useState({name: '',price: '',category: '',quantity: '',status: 'Available',allergens: '',addons: [],description: ''});
  const [filterDate, setFilterDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);


  const uniqueCategories = [...new Set(inventory.map(item => item.category))];


 const filteredInventory = inventory.filter(item =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
  (selectedCategory === '' || item.category === selectedCategory)
);

 const filteredLogs = logs.filter(log =>
  !filterDate || log.datetime.startsWith(filterDate)
);


 const handleAddItem = () => {
  const newItemData = {
  ...newItem,
  price: parseFloat(newItem.price),
  quantity: parseInt(newItem.quantity),
  sizes: newItem.sizes || []
};


  setInventory([...inventory, newItemData]);
  setLogs([
    ...logs,
    {
      datetime: new Date().toISOString().slice(0, 16).replace("T", " "),
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
  setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' });
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

  // ✅ Format helper for size display
  const formatSizes = (sizes) => {
    return sizes.map(s =>
      typeof s === 'string'
        ? s
        : `${s.label}${s.price ? ` (₱${s.price})` : ''}`
    ).join(', ');
  };

  // ✅ Compare fields
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

  // ✅ Sizes comparison
  if (JSON.stringify(oldItem.sizes) !== JSON.stringify(updatedItem.sizes)) {
    changes.push(
      `sizes from "${formatSizes(oldItem.sizes)}" to "${formatSizes(updatedItem.sizes)}"`
    );
  }

  const detailText = changes.length > 0
    ? `Updated ${changes.join(', ')}`
    : `No changes made`;

  updated[selectedItemIndex] = updatedItem;
  setInventory(updated);

  setLogs([
    ...logs,
    {
      datetime: new Date().toISOString().slice(0, 16).replace("T", " "),
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
};




  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory </h1>
          <AdminInfo />
        </div>

       {/* Search & Add */}   
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {/* Search Box */}
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

          {/* Filter label beside search */}
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

        {/* Add Button */}
        <button
          onClick={() => {
            setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-lg font-semibold border border-yellow-500"
        >
          + Add Item
        </button>
      </div>

       

   {/* Inventory Table */}
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                 <th className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Category</span>
                      <div className="relative inline-block">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="appearance-none bg-[#8B0000] text-white pr-6 pl-2 py-1 rounded text-sm font-medium border-none cursor-pointer"
                          style={{ width: '24px' }} 
                        >
                          <option value="">All</option>
                          {uniqueCategories.map((cat, i) => (
                            <option key={i} value={cat}>{cat}</option>
                          ))}
                        </select>

                        {/* Custom arrow icon positioned over native arrow */}
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
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Edit</th>
                </tr>
              </thead>



              <tbody>
                {filteredInventory.map((item, index) => (
                 <tr key={index} className="bg-[#fdfdfd] border-b hover:bg-[#f1f1f1]">
                  <td className="p-3">{index + 1}</td>
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
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      item.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <FaPen
                      className="text-red-600 cursor-pointer mx-auto"
                      onClick={() => {
                        setSelectedItemIndex(index);
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


                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Logs Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowLogsModal(true)}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500"
          >
            View Logs
          </button>
        </div>

       {showAddModal && (
          <AddItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={uniqueCategories}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
          />
        )}



        {showEditModal && (
          <EditItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={uniqueCategories}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditItem}
          />
        )}



      {/* Category popup Modal */}
        {showCategoryFilter && (
          <CategoryFilterModal
            selectedCategory={selectedCategory}
            uniqueCategories={uniqueCategories}
            onSelect={(cat) => {
              setSelectedCategory(cat === 'All' ? '' : cat);
              setShowCategoryFilter(false);
            }}
            onClose={() => setShowCategoryFilter(false)}
          />
        )}

     {/* Logs Modal */}
      {showLogsModal && (
        <LogsModal
          logs={logs}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          onClose={() => setShowLogsModal(false)}
        />
        )}

</div>
</div>
  );
}