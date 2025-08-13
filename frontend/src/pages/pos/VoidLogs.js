import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { FaSearch } from "react-icons/fa";
import AdminInfo from "../../components/AdminInfo";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";

const VoidLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [voidLogs, setVoidLogs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    setVoidLogs(saved);
  }, []);

  const filteredData = voidLogs.filter((item) =>
    item.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
                  <th className="p-3">Type</th>
                  <th className="p-3">Voided Items</th>
                  <th className="p-3 text-center">Cashier</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={item.voidId} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.dateTime}</td>
                      <td className="p-3">{item.voidId}</td>
                      <td className="p-3">{item.transactionId}</td>
                      <td className="p-3">
                        {item.voidType
                          ? item.voidType
                          : Array.isArray(item.voidedItems) && item.totalItems
                          ? item.voidedItems.length === item.totalItems
                            ? "Transaction"
                            : "Item"
                          : "Item"}
                      </td>
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
                    <td colSpan="8" className="text-center p-4 text-gray-500">
                      No void logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Controls (center pagination, left show entries) */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
          <div className="self-start md:self-auto">
            <ShowEntries
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={setEntriesPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <div className="flex justify-center flex-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <div className="w-[150px]" /> {/* spacer to balance flex */}
        </div>
      </div>
    </div>
  );
};

export default VoidLogs;
