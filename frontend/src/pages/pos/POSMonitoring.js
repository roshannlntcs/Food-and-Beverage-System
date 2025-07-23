import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch } from 'react-icons/fa';

const generateRandomDate = () => {
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const dummyTransactions = Array.from({ length: 50 }, (_, i) => ({
  date: generateRandomDate(),
  userId: `USR-${1000 + i}`,
  transactionNo: `TXN-${2000 + i}`,
  orderedItems: ['2x Burger, 1x Fries', '1x Steak, 1x Mojito', '3x Pasta'][i % 3],
  paymentMethod: ['Cash', 'GCash', 'Card'][i % 3],
  status: ['Completed', 'Pending', 'Cancelled'][i % 3],
  amount: (Math.random() * 1000 + 100).toFixed(2),
}));

const POSMonitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filteredData = dummyTransactions.filter((txn) => {
    const matchSearch = txn.transactionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStart = !startDate || txn.date >= startDate;
    const matchEnd = !endDate || txn.date <= endDate;
    return matchSearch && matchStart && matchEnd;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transaction</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-200 px-4 py-2 rounded-full shadow">
              <i className="fas fa-user-circle text-xl mr-2" />
              <div>
                <div className="text-sm font-semibold">Neziel Aniga</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
            <input
              type="text"
              placeholder="Search Transaction No."
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="text-gray-500" />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="border px-3 py-2 rounded-md text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="mx-1 text-gray-600">to</span>
            <input
              type="date"
              className="border px-3 py-2 rounded-md text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="border rounded-md flex-1 overflow-hidden">
          <div className="h-full max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Transaction No.</th>
                  <th className="p-3">Ordered Items</th>
                  <th className="p-3 text-center">Payment Method</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((txn, index) => (
                    <tr key={index} className="bg-[#fdfdfd] border-b hover:bg-[#f1f1f1]">
                      <td className="p-3">{txn.date}</td>
                      <td className="p-3">{txn.userId}</td>
                      <td
                        className="p-3 text-blue-600 underline cursor-pointer"
                        onClick={() => setSelectedTransaction(txn)}
                      >
                        {txn.transactionNo}
                      </td>
                      <td className="p-3">{txn.orderedItems}</td>
                      <td className="p-3 text-center">{txn.paymentMethod}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            txn.status === 'Completed'
                              ? 'bg-green-500 text-white'
                              : txn.status === 'Pending'
                              ? 'bg-yellow-400 text-black'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="p-3">₱{txn.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500">
            View Sales Reports
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
    {selectedTransaction && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white w-[380px] rounded-lg shadow-lg p-4 font-mono">
      {/* Header */}
      <div className="text-center mb-4">
        <img
          src="https://via.placeholder.com/80x40?text=LOGO"
          alt="Logo"
          className="mx-auto mb-1"
        />
        <h2 className="text-lg font-bold">RENTAL CAFE POS</h2>
        <p className="text-xs text-gray-600">Davao City, Philippines</p>
        <p className="text-xs text-gray-600">Tel: (082) 123-4567</p>
      </div>

      {/* Receipt Details */}
      <div className="text-sm mb-2">
        <div className="flex justify-between">
          <span>Txn No:</span>
          <span>{selectedTransaction.transactionNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{selectedTransaction.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{selectedTransaction.userId}</span>
        </div>
      </div>

      <hr className="border-dashed my-2" />

      {/* Items Ordered */}
      <div className="text-sm mb-2">
        <div className="flex justify-between font-semibold">
          <span>QTY ITEM</span>
          <span>AMOUNT</span>
        </div>
        <div className="mt-1">
          {selectedTransaction.orderedItems.split(',').map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.trim()}</span>
              <span>₱{(Number(selectedTransaction.amount) / selectedTransaction.orderedItems.split(',').length).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-dashed my-2" />

      {/* Summary */}
      <div className="text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₱{(Number(selectedTransaction.amount) * 0.89).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (12%)</span>
          <span>₱{(Number(selectedTransaction.amount) * 0.11).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>Total</span>
          <span>₱{selectedTransaction.amount}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Payment Method</span>
          <span>{selectedTransaction.paymentMethod}</span>
        </div>
      </div>

      <hr className="border-dashed my-2" />

      {/* Footer */}
      <div className="text-center text-sm mt-2">
        <p className="text-gray-700">Thank you for dining with us!</p>
        <p className="text-gray-500 text-xs">This serves as your official receipt.</p>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setSelectedTransaction(null)}
          className="px-4 py-1 bg-gray-300 text-sm text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-1 bg-green-600 text-sm text-white rounded hover:bg-green-700"
        >
          Print
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default POSMonitoring;
