// src/pages/pos/SalesReport.js

import React from "react";
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
} from "recharts";

const revenueData = [
  { day: "Mon", sales: 4000 },
  { day: "Tue", sales: 3000 },
  { day: "Wed", sales: 5000 },
  { day: "Thu", sales: 4000 },
  { day: "Fri", sales: 6000 },
  { day: "Sat", sales: 7000 },
  { day: "Sun", sales: 5000 },
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
  { name: "McDonald's", sales: 56635 },
  { name: "Starbucks", sales: 74779 },
  { name: "eBay", sales: 19027 },
  { name: "L'Oréal", sales: 43887 },
  { name: "Apple", sales: 8142 },
];

const paymentTypeData = [
  { name: "Cash", value: 400 },
  { name: "Card", value: 300 },
  { name: "GCash", value: 300 },
];

const COLORS = ["#FF8042", "#0088FE", "#00C49F"];

export default function SalesReport() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#f9f6ee]">
      <Sidebar />
      <div className="ml-20 p-6 w-[calc(100%-5rem)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sales Report</h1>
          <AdminInfo />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-gray-500">Total Revenue</h2>
            <p className="text-2xl font-bold">$25,000</p>
            <p className="text-green-600">+5%</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-gray-500">Number of Transactions</h2>
            <p className="text-2xl font-bold">500</p>
            <p className="text-green-600">+10%</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-gray-500">Avg Transaction Value</h2>
            <p className="text-2xl font-bold">20</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Revenue Over Time */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Total Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Comparison */}
          <div className="bg-white p-4 rounded shadow">
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
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Selling Products */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Top-Selling Products</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Payment Type */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Revenue by Payment Type</h3>
            <ResponsiveContainer width="100%" height={250}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

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
