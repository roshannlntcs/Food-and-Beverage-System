// src/pages/pos/HomeDashboard.js
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Package, ShoppingCart, User, ChevronDown } from "lucide-react";

const topProducts = [
  { name: "Mechado", sales: 18500 },
  { name: "Chicken Adobo", sales: 22476 },
  { name: "Bicol Express", sales: 16000 },
  { name: "Pork Sisig", sales: 20123 },
  { name: "Laing", sales: 8567 },
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

const recentLogins = [
  { name: "Paula Marie Smith", username: "@paulwcszzz", time: "5 mins ago", img: "https://i.pravatar.cc/40?img=1" },
  { name: "Japit Self Fish", username: "@japitkupsiss", time: "3 days ago", img: "https://i.pravatar.cc/40?img=2" },
  { name: "Andrea Jane Swift", username: "@andreaas", time: "30 July 2025", img: "https://i.pravatar.cc/40?img=3" },
];

const notifications = [
  { icon: <Package size={16} />, text: "Low stock: Cheesecake (5 left)", time: "3:30 PM" },
  { icon: <ShoppingCart size={16} />, text: "New transaction: TXN-2045 completed", time: "3:30 PM" },
  { icon: <User size={16} />, text: "Inventory updated by Rose", time: "2:15 PM" },
  { icon: <Package size={16} />, text: "Low stock: Cheesecake (5 left)", time: "3:30 PM" },
  { icon: <ShoppingCart size={16} />, text: "New transaction: TXN-2045 completed", time: "3:30 PM" },
];

const categories = ["Soup", "Main Dish", "Dessert", "Drinks", "Snacks"];

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState("Soup");
  const [stockOpen, setStockOpen] = useState(false);
  const [selectedTop, setSelectedTop] = useState("Main Dish");
  const [topOpen, setTopOpen] = useState(false);

  return (
    <div className="bg-[#f9f6ee] h-screen w-screen p-4 font-sans flex">
      <Sidebar />

      <div className="flex flex-col w-full">
        {/* HEADER */}
        <div className="bg-[#8B0000] text-white rounded-lg px-6 py-4 flex justify-between items-center ml-20 w-[calc(100%-5rem)]">
          <div>
            <h1 className="text-2xl font-bold">Welcome, Admin!</h1>
            <p>Here&apos;s your business overview</p>
          </div>
          <div className="flex items-center gap-4">
            <AdminInfoDashboard2/>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-12 gap-2 mt-4 ml-20 w-[calc(100%-5rem)] h-[calc(100%-110px)]">
          {/* LEFT CONTENT */}
          <div className="col-span-9 flex flex-col gap-2">
            {/* TOP 4 CARDS */}
            <div className="grid grid-cols-4 gap-2 h-[100px]">
              <div className="bg-white rounded-lg p-4 flex flex-col justify-center shadow">
                <p className="text-gray-500">Revenue</p>
                <h2 className="text-2xl font-bold">₱25,000</h2>
                <p className="text-green-500 text-sm">↑ 5.67% from last week</p>
              </div>
              <div className="bg-white rounded-lg p-4 flex flex-col justify-center shadow">
                <p className="text-gray-500">Available stocks</p>
                <h2 className="text-2xl font-bold">2,536</h2>
                <p className="text-red-500 text-sm">↓ 6.24% from last week</p>
              </div>
              <div className="bg-white rounded-lg p-4 flex flex-col justify-center shadow">
                <p className="text-gray-500">Low stock</p>
                <h2 className="text-2xl font-bold">1,312</h2>
                <p className="text-green-500 text-sm">↑ 1.53% from last week</p>
              </div>
              <div className="bg-white rounded-lg p-4 flex flex-col justify-center shadow">
                <p className="text-gray-500">Out of stock</p>
                <h2 className="text-2xl font-bold">789</h2>
                <p className="text-red-500 text-sm">↓ 1.22% from last week</p>
              </div>
            </div>

            {/* STOCK LEVELS */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-4 shadow flex flex-col">
                <div className="flex justify-between items-center mb-2 relative">
                  <h2 className="font-bold">Stock Level</h2>
                  <div className="relative">
                    <button
                      onClick={() => setStockOpen(!stockOpen)}
                      className="flex items-center border border-gray-300 rounded-md px-3 py-1 text-gray-500 text-sm hover:bg-gray-50"
                    >
                      {selectedStock}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                    {stockOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
                        {categories.map((cat, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedStock(cat);
                              setStockOpen(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Chicken Adobo", current: 123, total: 500 },
                    { name: "Humba (Low stock)", current: 21, total: 150 },
                    { name: "French fries", current: 57, total: 150 },
                    { name: "Tinola", current: 82, total: 150 },
                    { name: "Kaldereta", current: 13, total: 150 },
                  ].map((item, idx) => {
                    const percentage = (item.current / item.total) * 100;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-medium">
                          <span>{item.name}</span>
                          <span>
                            {item.current}/{item.total}
                          </span>
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

              {/* Top Selling */}
              <div className="bg-white rounded-lg p-4 shadow flex flex-col">
                <div className="flex justify-between items-center mb-2 relative">
                  <h2 className="font-bold">Top Selling Products</h2>
                  <div className="relative">
                    <button
                      onClick={() => setTopOpen(!topOpen)}
                      className="flex items-center border border-gray-300 rounded-md px-3 py-1 text-gray-500 text-sm hover:bg-gray-50"
                    >
                      {selectedTop}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                    {topOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
                        {categories.map((cat, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedTop(cat);
                              setTopOpen(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-lg mt-12 p-4 shadow h-[200px]">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <p className="text-gray-500">Order Summary</p>
                  <h2 className="text-2xl font-bold">₱8,689</h2>
                  <p className="text-gray-400 text-sm">Total Profit</p>
                </div>
                <span className="text-gray-400 text-sm">This week</span>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={orderSummaryData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis hide />
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

          {/* RIGHT CONTENT */}
          <div className="col-span-3 flex flex-col gap-2">
            {/* RECENT LOGINS */}
            <div className="bg-white rounded-lg p-4 shadow h-[260px]">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Recent Logins</h2>
                <span className="text-gray-400 text-sm">This week</span>
              </div>
              <div className="mt-4 space-y-3">
                {recentLogins.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={user.img} alt={user.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.username}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">{user.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-lg p-4 shadow h-[300px]">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Notifications</h2>
                <span className="text-gray-400 text-sm">This week</span>
              </div>
              <div className="mt-4 space-y-3">
                {notifications.map((n, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2">
                      {n.icon}
                      <p>{n.text}</p>
                    </div>
                    <p className="text-gray-400 text-xs ml-6">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
