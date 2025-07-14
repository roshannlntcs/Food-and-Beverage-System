import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [activeSection, setActiveSection] = useState("homepage");

  useEffect(() => {
    const storedName = localStorage.getItem("adminFullName");
    if (storedName) {
      setAdminName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminFullName");
    navigate("/roles");
  };

  const navigationItems = [
    { id: "homepage", label: "Home" },
    { id: "inventory", label: "Inventory" },
    { id: "pos", label: "POS Monitoring" },
    { id: "suppliers", label: "Supplier Records" },
    { id: "voidlogs", label: "Void Logs" },
  ];

  const renderHomepage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-lg font-semibold">Stocks Overview</h3>
          <div className="mt-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-lg font-semibold">Sales by Category</h3>
          <div className="mt-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
            Pie Chart Placeholder
          </div>
        </div>
        <div className="bg-white shadow p-6 rounded col-span-2">
          <h3 className="text-lg font-semibold mb-4">Today's Top Selling</h3>
          <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-500">
            Bar Chart Placeholder
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Revenue</p>
          <h2 className="text-xl font-bold">₱25,000</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">500</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <h2 className="text-xl font-bold">20</h2>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product List</h2>
        <button className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">
          + Add Item
        </button>
      </div>
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">No.</th>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Price</th>
              <th className="text-left p-3 border">Category</th>
              <th className="text-left p-3 border">Quantity</th>
              <th className="text-left p-3 border">Status</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Avocados", price: 92.0, category: "Soup", qty: 50, status: "Available" },
              { name: "Shorak", price: 120.0, category: "Main Dish", qty: 30, status: "Available" },
              { name: "Majito", price: 250.0, category: "Liquor", qty: 10, status: "Unavailable" },
              { name: "French Fries", price: 75.0, category: "Appetizer", qty: 15, status: "Available" },
              { name: "Cheesecake", price: 120.0, category: "Dessert", qty: 40, status: "Available" },
              { name: "Salad Trio", price: 110.0, category: "Main Dish", qty: 60, status: "Available" },
              { name: "Beef Stew", price: 260.0, category: "Main Dish", qty: 0, status: "Unavailable" },
            ].map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{item.name}</td>
                <td className="p-3 border">₱{item.price.toFixed(2)}</td>
                <td className="p-3 border">{item.category}</td>
                <td className="p-3 border">{item.qty}</td>
                <td className="p-3 border">{item.status}</td>
                <td className="p-3 border">
                  <button className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right">
        <button className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">
          View Logs
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "homepage": return renderHomepage();
      case "inventory": return renderInventory();
      case "pos": return <h2 className="text-2xl font-bold">POS Monitoring</h2>;
      case "suppliers": return <h2 className="text-2xl font-bold">Supplier Records</h2>;
      case "voidlogs": return <h2 className="text-2xl font-bold">Void Logs</h2>;
      default: return renderHomepage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EA] text-gray-800">
      <div className="flex">
        <div className="w-64 bg-white border-r min-h-screen p-6">
          <h1 className="text-xl font-bold mb-2">🍴 Splice</h1>
          {adminName && <p className="text-sm mb-6">Hello, {adminName}</p>}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-[#F6EBCE] text-black font-semibold"
                    : "hover:bg-[#F6EBCE] text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-10 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
