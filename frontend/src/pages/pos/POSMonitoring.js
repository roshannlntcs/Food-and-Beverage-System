// ...imports
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash } from "react-icons/fa";

const POSMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

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
    const matchesSearch =
      tx.transactionID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredTransactions.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);

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

        {/* Controls Row */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white mx-auto">
            <input
              type="text"
              placeholder="Search Transaction, Cashier or Payment"
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <FaSearch className="text-gray-500" />
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-2 py-1 rounded-full text-gray-600 disabled:opacity-50"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2 py-1 rounded-full text-gray-600 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Table */}
     <div className="border rounded-md overflow-hidden bg-white">
  <div className="max-h-[500px] overflow-y-auto">
    <table className="w-full table-fixed border-collapse">
      <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
        <tr className="text-left">
          <th className="p-3 w-[40px]">No.</th>
          <th className="p-3 w-[120px]">Date</th>
          <th className="p-3 w-[160px]">Transaction ID</th>
          <th className="p-3 w-[100px] text-center">Cashier</th>
          <th className="p-3 w-[100px] text-center">Payment</th>
          <th className="p-3 w-[300px]">Items</th>
          <th className="p-3 w-[100px]">Subtotal</th>
          <th className="p-3 w-[100px]">Discount</th>
          <th className="p-3 w-[100px]">Tax</th>
          <th className="p-3 w-[100px]">Total</th>
          <th className="p-3 w-[80px] text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {currentEntries.length > 0 ? (
          currentEntries.map((tx, i) => (
            <tr key={i} className="bg-white border-b hover:bg-[#f1f1f1] align-top">
              <td className="p-3">{indexOfFirstEntry + i + 1}</td>
              <td className="p-3">{tx.date}</td>
              <td className="p-3">{tx.transactionID}</td>
              <td className="p-3 text-center">{tx.cashier}</td>
              <td className="p-3 text-center">{tx.method}</td>
              <td className="p-3 break-words whitespace-normal">
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
            <td colSpan="11" className="p-4 text-center text-gray-500">
              No transactions found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


        {/* Bottom Buttons */}
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
