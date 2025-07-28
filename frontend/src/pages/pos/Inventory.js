import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaPen } from 'react-icons/fa';
import AdminInfo from '../../components/AdminInfo';

const initialInventoryData = [
  { name: 'Arozcaldo', price: 80, category: 'Soup', quantity: 50, status: 'Available' },
  { name: 'Steak', price: 300, category: 'Main dish', quantity: 100, status: 'Available' },
  { name: 'Mojito', price: 350, category: 'Liquor', quantity: 30, status: 'Available' },
  { name: 'French fries', price: 75, category: 'Appetizer', quantity: 50, status: 'Available' },
  { name: 'Cheesecake', price: 299, category: 'Dessert', quantity: 0, status: 'Unavailable' },
  { name: 'Iced Tea', price: 50, category: 'Drinks', quantity: 30, status: 'Available' },
  { name: 'Beef Stew', price: 350, category: 'Main dish', quantity: 0, status: 'Unavailable' },
  { name: 'Pasta', price: 250, category: 'Main dish', quantity: 20, status: 'Available' },
  { name: 'Burger', price: 200, category: 'Main dish', quantity: 40, status: 'Available' },
  { name: 'Sundae', price: 100, category: 'Dessert', quantity: 10, status: 'Available' },
];



export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(initialInventoryData);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '', quantity: '', status: 'Available' });
  const [filterDate, setFilterDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);


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
    quantity: parseInt(newItem.quantity)
  };

  setInventory([...inventory, newItemData]);
  setLogs([
    ...logs,
    {
      datetime: new Date().toISOString().slice(0, 16).replace("T", " "),
      action: "Add",
      admin: "Neziel Aniga",
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
    status: newItem.status
  };

  // Build detailed change description
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

  const detailText = changes.length > 0
    ? `Updated ${changes.join(', ')}`
    : `No changes made`;

  // Apply update and log it
  updated[selectedItemIndex] = updatedItem;
  setInventory(updated);

  setLogs([
    ...logs,
    {
      datetime: new Date().toISOString().slice(0, 16).replace("T", " "),
      action: "Update",
      admin: "Neziel Aniga",
      product: updatedItem.name,
      field: "Edited Fields",
      stock: `${updatedItem.quantity} pcs`,
      oldPrice: `₱${oldItem.price}`,
      newPrice: `₱${updatedItem.price}`,
      category: updatedItem.category,
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
              
            </div>

            {/* Add Button */}
         <button
  onClick={() => {
    setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' }); // Reset form
    setShowAddModal(true);
  }}
  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-lg font-semibold border border-yellow-500"
>
  + Add Item
</button>
          </div>

            {selectedCategory && (
  <div className="text-sm text-gray-600 mb-2">
    Filter: <span className="font-semibold">{selectedCategory}</span>
    <button
      onClick={() => setSelectedCategory('')}
      className="ml-2 text-blue-600 hover:underline"
    >
      Clear
    </button>
  </div>
)}


        {/* Inventory Table */}
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 relative">
  <div className="flex items-center gap-1">
    <span>Category</span>
    <button
      onClick={() => setShowCategoryFilter(true)}
      className="focus:outline-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white hover:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
</th>


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
                          setSelectedItemIndex(index);
                          setNewItem({
                                name: item.name,
                                price: item.price,
                                category: item.category,
                                quantity: item.quantity,
                                status: item.status
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

        {/* Add Modal */}
       {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-center">Add New Item</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Item Name</label>
          <input
            type="text"
            placeholder="e.g. Burger"
            className="w-full border rounded px-4 py-2"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Price</label>
          <input
            type="number"
            placeholder="₱"
            className="w-full border rounded px-4 py-2"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <input
            type="text"
            placeholder="e.g. Main Dish"
            className="w-full border rounded px-4 py-2"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Quantity</label>
          <input
            type="number"
            placeholder="e.g. 100"
            className="w-full border rounded px-4 py-2"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
{showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-center">Edit Item</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Item Name</label>
          <input
            type="text"
            className="w-full border rounded px-4 py-2"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Price</label>
          <input
            type="number"
            className="w-full border rounded px-4 py-2"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <input
            type="text"
            className="w-full border rounded px-4 py-2"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Quantity</label>
          <input
            type="number"
            className="w-full border rounded px-4 py-2"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          />
        </div>
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

      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleEditItem}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold"
        >
          Update
        </button>
      </div>
    </div>
  </div>
)}

      {/* Category popup Modal */}
  {showCategoryFilter && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <h3 className="text-xl font-bold mb-4 text-center">Filter by Category</h3>
      <div className="space-y-2">
        {['All', 'Main dish', 'Appetizer', 'Side dish', 'Soup', 'Dessert', 'Drinks'].map((cat) => (
          <button
            key={cat}
            className={`w-full px-4 py-2 rounded text-left border ${
              (selectedCategory === cat || (cat === 'All' && selectedCategory === '')) ? 'bg-yellow-400' : 'bg-white'
            } hover:bg-yellow-200`}
            onClick={() => {
              setSelectedCategory(cat === 'All' ? '' : cat);
              setShowCategoryFilter(false);
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => setShowCategoryFilter(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


        {/* Logs Modal */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white p-6 rounded shadow w-[90%] max-h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Inventory Logs</h2>
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="overflow-auto max-h-[60vh] border rounded">
                <table className="table-auto w-full text-sm">
                 <thead className="bg-[#8B0000] text-white sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Date/Time</th>
                        <th className="p-2 text-left">Action</th>
                        <th className="p-2 text-left">Admin</th>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">Field</th>
                        <th className="p-2 text-left">Stock</th>
                        <th className="p-2 text-left">Old Price</th>
                        <th className="p-2 text-left">New Price</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Detail</th>
                      </tr>
                    </thead>

                 <tbody>
                      {filteredLogs.map((log, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2">{log.datetime}</td>
                          <td className="p-2">{log.action}</td>
                          <td className="p-2">{log.admin}</td>
                          <td className="p-2">{log.product}</td>
                          <td className="p-2">{log.field}</td>
                          <td className="p-2">{log.stock}</td>
                          <td className="p-2">{log.oldPrice}</td>
                          <td className="p-2">{log.newPrice}</td>
                          <td className="p-2">{log.category}</td>
                          <td className="p-2">{log.detail}</td>
                        </tr>
                      ))}
                    </tbody>

                </table>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
