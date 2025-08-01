import React from 'react';

export default function LogsModal({
  logs,
  filterDate,
  setFilterDate,
  onClose
}) {
  const filteredLogs = logs.filter(log =>
    !filterDate || log.datetime.startsWith(filterDate)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white p-6 rounded shadow w-[90%] max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Inventory Logs</h2>
          <input
            type="date"
            className="border p-2 rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh] border rounded">
          <table className="table-auto w-full text-sm">
            <thead className="bg-[#8B0000] text-white sticky top-0">
              <tr>
                <th className="p-2 text-left">Date/Time</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Admin</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Old Price</th>
                <th className="p-2 text-left">New Price</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2">{log.datetime}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2">{log.admin}</td>
                  <td className="p-2">{log.product}</td>
                  <td className="p-2">{log.stock}</td>
                  <td className="p-2">{log.oldPrice}</td>
                  <td className="p-2">{log.newPrice}</td>
                  <td className="p-2">{log.category}</td>
                  <td className="p-2">{log.detail}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
