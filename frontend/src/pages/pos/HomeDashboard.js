import React from "react";
import Sidebar from "../../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function HomeDashboard() {
  const fullName = localStorage.getItem("adminFullName") || "Admin";

  const salesData = [
    { date: "Jul 1", sales: 25000 },
    { date: "Jul 2", sales: 20000 },
    { date: "Jul 3", sales: 27000 },
    { date: "Jul 4", sales: 30000 },
    { date: "Jul 5", sales: 15000 },
    { date: "Jul 6", sales: 28000 },
    { date: "Jul 7", sales: 22000 },
  ];

  const topProducts = [
    { name: "Cheeseburger", sold: 120 },
    { name: "Iced Tea", sold: 98 },
    { name: "Fries", sold: 90 },
    { name: "Pizza Slice", sold: 80 },
    { name: "Chocolate Cake", sold: 60 },
  ];

  return (
    <div className="flex bg-[#f9f6ee] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 ml-20 overflow-hidden">
        <div className="bg-[#800000] px-6 py-4 rounded-t-xl shadow mb-4">
            <h1 className="text-xl font-semibold text-white">Welcome, {fullName}</h1>
            <p className="text-sm text-gray-200">Here’s your business overview</p>
          </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xs text-gray-500">Total Sales</h2>
            <p className="text-2xl font-bold text-yellow-500">₱245,300</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xs text-gray-500">Orders Today</h2>
            <p className="text-2xl font-bold text-yellow-500">123</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xs text-gray-500">Inventory Items</h2>
            <p className="text-2xl font-bold text-yellow-500">874</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xs text-gray-500">Active POS</h2>
            <p className="text-2xl font-bold text-yellow-500">5</p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow h-[350px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Sales Trend (₱)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#facc15" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow h-[350px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Products</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="sold" fill="#facc15" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
