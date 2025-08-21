// src/pages/pos/SalesReport.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Download, FileText, Printer, Package, ShoppingCart, User, X } from "lucide-react";

// --- Sample Data ---
const revenueData = [
  { day: "Mon", sales: 4000 },
  { day: "Tue", sales: 3000 },
  { day: "Wed", sales: 5000 },
  { day: "Thu", sales: 4000 },
  { day: "Fri", sales: 6000 },
  { day: "Sat", sales: 7000 },
  { day: "Sun", sales: 5000 },
];

const monthlyRevenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 49000 },
  { month: "Apr", revenue: 58000 },
  { month: "May", revenue: 62000 },
  { month: "Jun", revenue: 68000 },
  { month: "Jul", revenue: 72000 },
];

const salesComparisonData = [
  { day: "Mon", current: 4000, previous: 3000 },
  { day: "Tue", current: 4500, previous: 3200 },
  { day: "Wed", current: 5000, previous: 4000 },
  { day: "Thu", current: 5500, previous: 3500 },
  { day: "Fri", current: 6000, previous: 4500 },
  { day: "Sat", current: 7000, previous: 5000 },
  { day: "Sun", current: 4800, previous: 4200 },
];

const topProducts = [
  { name: "Mechado", sales: 18500 },
  { name: "Chicken Adobo", sales: 22476 },
  { name: "Bicol Express", sales: 16000 },
  { name: "Pork Sisig", sales: 20123 },
  { name: "Laing", sales: 8567 },
];

// drill-down data (sample daily sales trends per product)
const productSalesTrends = {
  "Mechado": [
    { day: "Mon", sales: 2500 },
    { day: "Tue", sales: 3000 },
    { day: "Wed", sales: 2800 },
    { day: "Thu", sales: 2600 },
    { day: "Fri", sales: 3100 },
    { day: "Sat", sales: 3500 },
    { day: "Sun", sales: 3000 },
  ],
  "Chicken Adobo": [
    { day: "Mon", sales: 3200 },
    { day: "Tue", sales: 3400 },
    { day: "Wed", sales: 3300 },
    { day: "Thu", sales: 3100 },
    { day: "Fri", sales: 3600 },
    { day: "Sat", sales: 3900 },
    { day: "Sun", sales: 3400 },
  ],
};

const paymentTypeData = [
  { name: "Cash", value: 400 },
  { name: "Card", value: 300 },
  { name: "GCash", value: 300 },
];

const orderSummaryData = [
  { name: "Mon", profit: 500 },
  { name: "Tue", profit: 1000 },
  { name: "Wed", profit: 1200 },
  { name: "Thu", profit: 1674 },
  { name: "Fri", profit: 1500 },
  { name: "Sat", profit: 1800 },
  { name: "Sun", profit: 1600 },
];

const stockData = [
  { name: "Chicken Adobo", current: 123, total: 500 },
  { name: "Humba (Low stock)", current: 21, total: 150 },
  { name: "French fries", current: 57, total: 150 },
  { name: "Tinola", current: 82, total: 150 },
  { name: "Kaldereta", current: 13, total: 150 },
];

const notifications = [
  { icon: <Package size={16} />, text: "Low stock: Cheesecake (5 left)", time: "3:30 PM" },
  { icon: <ShoppingCart size={16} />, text: "New transaction: TXN-2045 completed", time: "3:30 PM" },
  { icon: <User size={16} />, text: "Inventory updated by Rose", time: "2:15 PM" },
];

const COLORS = ["#FF8042", "#0088FE", "#00C49F"];

export default function SalesReport() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="flex min-h-screen bg-[#f9f6ee]">
      <Sidebar />
      <div className="ml-20 p-6 w-[calc(100%-5rem)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Detailed Sales Report</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
              <FileText size={16}/> Export CSV
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
              <Download size={16}/> Export PDF
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => window.print()}>
              <Printer size={16}/> Print
            </button>
            <AdminInfo />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Total Revenue</p>
            <h2 className="text-2xl font-bold">₱25,000</h2>
            <p className="text-green-500 text-sm">↑ 5% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Transactions</p>
            <h2 className="text-2xl font-bold">500</h2>
            <p className="text-green-500 text-sm">↑ 10% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Avg Transaction Value</p>
            <h2 className="text-2xl font-bold">₱50</h2>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Available Stocks</p>
            <h2 className="text-2xl font-bold">2,536</h2>
            <p className="text-red-500 text-sm">↓ 6.24% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Low Stock</p>
            <h2 className="text-2xl font-bold">1,312</h2>
            <p className="text-green-500 text-sm">↑ 1.53% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500">Out of Stock</p>
            <h2 className="text-2xl font-bold">789</h2>
            <p className="text-red-500 text-sm">↓ 1.22% from last week</p>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Total Revenue (Daily)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Revenue (Monthly)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8B0000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Comparison + Order Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Sales Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesComparisonData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#ff0000" />
                <Line type="monotone" dataKey="previous" stroke="#000000" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Order Summary (Profit)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={orderSummaryData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products + Stock */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Top Selling Products (Click to Drill Down)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={topProducts}
                onClick={(data) => setSelectedProduct(data?.activeLabel)}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Stock Level Breakdown</h3>
            <div className="space-y-3">
              {stockData.map((item, idx) => {
                const percentage = (item.current / item.total) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-medium">
                      <span>{item.name}</span>
                      <span>{item.current}/{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage < 30
                            ? "bg-red-500"
                            : percentage < 70
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment + Notifications */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Revenue by Payment Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentTypeData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {paymentTypeData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">Notifications</h3>
            {notifications.map((n, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-2">
                  {n.icon}
                  <p>{n.text}</p>
                </div>
                <p className="text-gray-400 text-xs ml-6">{n.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Drill-Down Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedProduct} - Daily Sales Trend</h2>
                <button onClick={() => setSelectedProduct(null)}>
                  <X size={20} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={productSalesTrends[selectedProduct] || []}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
