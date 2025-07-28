import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { FaSearch } from "react-icons/fa";
import AdminInfo from "../../components/AdminInfo";

const VoidLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [voidLogs, setVoidLogs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    setVoidLogs(saved);
  }, []);

  const filteredData = voidLogs.filter((item) =>
    item.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearVoidLogs = () => {
    if (window.confirm("Are you sure you want to clear all void logs?")) {
      localStorage.removeItem("voidLogs");
      setVoidLogs([]);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Void Logs</h1>
          <AdminInfo />
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
            <input
              type="text"
              placeholder="Search Transaction ID"
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="text-gray-500" />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Void ID</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Voided Items</th>
                  <th className="p-3 text-center">Cashier</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.voidId} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.dateTime}</td>
                      <td className="p-3">{item.voidId}</td>
                      <td className="p-3">{item.transactionId}</td>
                      <td className="p-3">
                        {Array.isArray(item.voidedItems)
                          ? item.voidedItems.join(", ")
                          : item.voidedItems}
                      </td>
                      <td className="p-3 text-center">{item.cashier}</td>
                      <td className="p-3 text-center">{item.manager}</td>
                      <td className="p-3">{item.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      No void logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clear Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearVoidLogs}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow"
          >
            Clear Void Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoidLogs;
