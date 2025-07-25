// src/pages/pos/VoidLogs.js

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch } from 'react-icons/fa';
import AdminInfo from '../../components/AdminInfo';

const voidLogsData = [
  { voidId: 0, transactionId: '111-000291', cashier: 'Ethan', manager: 'Z', reason: 'Wrong item entered', dateTime: 'Apr 29, 2025 4:20 PM' },
  { voidId: 1, transactionId: '111-000292', cashier: 'Rose', manager: 'Ethan', reason: 'Customer Canceled', dateTime: 'Apr 29, 2025 4:35 PM' },
  { voidId: 2, transactionId: '111-000293', cashier: 'Mike', manager: 'Ar', reason: 'Wrong item entered', dateTime: 'Apr 30, 2025 1:20 PM' },
  { voidId: 3, transactionId: '111-000294', cashier: 'Z', manager: 'Mike', reason: 'Misclicked Quantity', dateTime: 'May 30, 2025 3:23 PM' },
  { voidId: 4, transactionId: '111-000295', cashier: 'Ar', manager: 'Joshua', reason: 'Wrong item entered', dateTime: 'May 30, 2025 3:23 PM' },
  { voidId: 5, transactionId: '111-000296', cashier: 'Paulie', manager: 'Geno', reason: 'Misclicked Quantity', dateTime: 'Jun 30, 2025 3:23 PM' },
  { voidId: 6, transactionId: '111-000297', cashier: 'Geno', manager: 'Paulie', reason: 'Customer Canceled', dateTime: 'Jun 30, 2025 3:23 PM' },
  { voidId: 7, transactionId: '111-000298', cashier: 'Joshua', manager: 'Rose', reason: 'Customer Canceled', dateTime: 'Jun 22, 2025 4:23 PM' },
  { voidId: 8, transactionId: '111-000299', cashier: 'Nash', manager: 'Mike', reason: 'Wrong item entered', dateTime: 'Jul 2, 2025 10:05 AM' },
  { voidId: 9, transactionId: '111-000300', cashier: 'Zack', manager: 'Ethan', reason: 'Misclicked Quantity', dateTime: 'Jul 5, 2025 2:15 PM' },
  { voidId: 10, transactionId: '111-000301', cashier: 'Cleo', manager: 'Ar', reason: 'Customer Canceled', dateTime: 'Jul 6, 2025 11:00 AM' },
];

const VoidLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = voidLogsData.filter((item) =>
    item.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Void Logs</h1>
          <AdminInfo />
        </div>

        {/* Search */}
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

        {/* Scrollable Table */}
        <div className="border rounded-md max-h-[500px] overflow-y-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Void ID</th>
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">User Name</th>
                <th className="p-3 text-left">Admin Name</th>
                <th className="p-3 text-left">Reason for Void</th>
                <th className="p-3 text-left">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.voidId} className="bg-[#fdfdfd] border-b hover:bg-[#f1f1f1]">
                  <td className="p-3">{item.voidId}</td>
                  <td className="p-3">{item.transactionId}</td>
                  <td className="p-3">{item.cashier}</td>
                  <td className="p-3">{item.manager}</td>
                  <td className="p-3">{item.reason}</td>
                  <td className="p-3">{item.dateTime}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoidLogs;
