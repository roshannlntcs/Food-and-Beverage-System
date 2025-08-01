import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash } from "react-icons/fa";

const POSMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load transactions from localStorage
  useEffect(() => {
    const loadData = () => {
      const saved = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(saved);
    };
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

 const filteredTransactions = transactions.filter((tx) => {
  const txDate = new Date(tx.date);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const matchesSearch =
    tx.transactionID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.method.toLowerCase().includes(searchQuery.toLowerCase());

  const withinDateRange =
    (!start || txDate >= start) &&
    (!end || txDate <= end);

  return matchesSearch && withinDateRange;
});


  // Delete one transaction
  const deleteTransaction = (id) => {
    const updated = transactions.filter((tx) => tx.id !== id);
    setTransactions(updated);
    localStorage.setItem("transactions", JSON.stringify(updated));
  };

 

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <AdminInfo />
        </div>

        {/* Search and Date Filter Row */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              {/* Search Bar */}
              <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
                <input
                  type="text"
                  placeholder="Search Transaction, Cashier or Payment"
                  className="outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="text-gray-500" />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>


        {/* Table */}
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3 text-center">Cashier</th>
                  <th className="p-3 text-center">Payment</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Tax</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-[#f1f1f1]">
                       <td className="p-3">{i + 1}</td>
                      <td className="p-3">{tx.date}</td>
                      <td className="p-3">{tx.transactionID}</td>
                      <td className="p-3 text-center">{tx.cashier}</td>
                      <td className="p-3 text-center">{tx.method}</td>
                      <td className="p-3">
                        {tx.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                      </td>
                      <td className="p-3">₱{tx.subtotal.toFixed(2)}</td>
                      <td className="p-3">₱{tx.discountAmt.toFixed(2)}</td>
                      <td className="p-3">₱{tx.tax.toFixed(2)}</td>
                      <td className="p-3 font-semibold">₱{tx.total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons Below Table */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => navigate("/pos/sales-report")}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500 rounded-full"
          >
            View Sales Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSMonitoring;
