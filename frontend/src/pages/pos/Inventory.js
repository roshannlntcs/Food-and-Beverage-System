import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaPen } from 'react-icons/fa';

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

const dummyLogs = Array.from({ length: 20 }).map((_, i) => ({
  datetime: `2025-07-2${i % 9} 1${i}:00`,
  action: i % 3 === 0 ? 'Add' : i % 3 === 1 ? 'Update' : 'Restock',
  admin: 'Neziel Aniga',
  product: ['Cheesecake', 'Lemonade', 'Burger', 'Steak'][i % 4],
  field: ['New Product', 'Quantity', 'Price'][i % 3],
  stock: `${10 + i} pcs`,
  oldPrice: i % 2 === 0 ? `₱${100 + i}` : '',
  newPrice: i % 2 === 0 ? `₱${110 + i}` : '',
  category: ['Dessert', 'Drinks', 'Main Dish'][i % 3],
  detail: ['Added new dessert item', 'Updated Price for lemonade', 'Restocked Burger'][i % 3],
}));

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(initialInventoryData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '', quantity: '', status: 'Available' });
  const [filterDate, setFilterDate] = useState('');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = dummyLogs.filter(log =>
    !filterDate || log.datetime.startsWith(filterDate)
  );

  const handleAddItem = () => {
    setInventory([...inventory, { ...newItem, price: parseFloat(newItem.price), quantity: parseInt(newItem.quantity) }]);
    setShowAddModal(false);
    setNewItem({ name: '', price: '', category: '', quantity: '', status: 'Available' });
  };

  const handleEditItem = () => {
    const updated = [...inventory];
    updated[selectedItemIndex] = { ...newItem };
    setInventory(updated);
    setShowEditModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee]">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product List</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-200 px-4 py-2 rounded-full shadow">
              <div>
                <div className="text-sm font-semibold">Neziel Aniga</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add */}
        <div className="flex justify-between items-center mb-4">
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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded shadow text-lg font-semibold border border-yellow-500"
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
                  <th className="p-3">Category</th>
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
                          setNewItem(item);
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
                      <th className="p-2">Date/Time</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Admin Name</th>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Field</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Old Price</th>
                      <th className="p-2">New Price</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, i) => (
                      <tr key={i} className="odd:bg-white even:bg-gray-50">
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
