import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { FaSearch, FaTrash, FaTimes } from "react-icons/fa";
import AdminInfo from "../../components/AdminInfo";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";

const POSMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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
      (tx.transactionID || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.cashier || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.method || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = filterDate === "" || (tx.date && tx.date.startsWith(filterDate));

    return matchesSearch && matchesDate;
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

        {/* Search & Calendar Row */}
        <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
          <div className="flex items-center border rounded-md px-4 py-2 w-full sm:w-96 bg-white">
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

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 text-gray-700 shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
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
                    <tr key={i} className="border-b hover:bg-gray-50 align-top">
                      <td className="p-3">{indexOfFirstEntry + i + 1}</td>
                      <td className="p-3">{tx.date}</td>
                      <td
                        className="p-3 text-blue-600 cursor-pointer underline"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        {tx.transactionID}
                      </td>
                      <td className="p-3 text-center">{tx.cashier}</td>
                      <td className="p-3 text-center">{tx.method}</td>
                      <td className="p-3 break-words whitespace-normal">
                        {tx.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                      </td>
                      <td className="p-3">₱{tx.subtotal?.toFixed(2)}</td>
                      <td className="p-3">₱{tx.discountAmt?.toFixed(2)}</td>
                      <td className="p-3">₱{tx.tax?.toFixed(2)}</td>
                      <td className="p-3 font-semibold">₱{tx.total?.toFixed(2)}</td>
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

        {/* Bottom Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
            setCurrentPage={setCurrentPage}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />

          <button
            onClick={() => window.location.assign("/pos/sales-report")}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow border border-yellow-500 rounded-full"
          >
            View Sales Reports
          </button>
        </div>
      </div>

     {/* Receipt Modal */}
{selectedTransaction && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">
      <div className="flex justify-end mb-2">
        
      </div>
      <div className="text-center mb-4">
        <img src="/splice.png" alt="Splice Logo" className="mx-auto h-16 mb-2" />
        <p className="text-gray-600 text-sm">Transaction Receipt</p>
      </div>
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p><strong>Transaction ID:</strong> {selectedTransaction.transactionID}</p>
        <p><strong>Date:</strong> {selectedTransaction.date}</p>
        <p><strong>Cashier:</strong> {selectedTransaction.cashier}</p>
        <p><strong>Payment Method:</strong> {selectedTransaction.method}</p>
      </div>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr>
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1 w-12">Qty</th>
            <th className="text-right py-1">Price</th>
          </tr>
        </thead>
        <tbody>
          {selectedTransaction.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1">{item.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">₱{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-sm space-y-1 mb-2 mt-6">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₱{selectedTransaction.subtotal?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>-₱{selectedTransaction.discountAmt?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>₱{selectedTransaction.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>₱{selectedTransaction.total?.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-4">
        Thank you for your purchase!
      </p>

      {/* ✅ Buttons at the bottom */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => window.print()}
          className="bg-yellow-500 text-black px-5 py-2 rounded-full hover:bg-yellow-600"
        >
          Print
        </button>
        <button
          onClick={() => setSelectedTransaction(null)}
          className=" bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default POSMonitoring;
