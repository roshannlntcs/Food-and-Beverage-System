// src/pages/pos/VoidLogs.js
import React, { useEffect, useState } from "react";
import { fetchVoidLogs } from "../../api/orders";

export default function VoidLogs() {
  const [voids, setVoids] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchVoidLogs(search ? { search } : {});
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (mounted) setVoids(arr);
      } catch (e) {
        console.error("Failed to load void logs:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Void Logs</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by transaction, reason, cashier…"
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Void ID</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Cashier</th>
                <th className="px-4 py-2">Manager</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {voids.map((v) => (
                <tr key={v.id || v.voidId} className="border-t">
                  <td className="px-4 py-2">{v.code || v.voidId || v.id}</td>
                  <td className="px-4 py-2">{v.order?.code || v.orderId || v.transactionId || "—"}</td>
                  <td className="px-4 py-2">{v.type || v.voidType || "—"}</td>
                  <td className="px-4 py-2">
                    {v.cashier?.fullName || v.cashierName || v.cashier || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {v.manager?.fullName || v.managerName || v.manager || "—"}
                  </td>
                  <td className="px-4 py-2">{v.reason || "—"}</td>
                  <td className="px-4 py-2">
                    {new Date(v.createdAt || v.updatedAt || v.dateTime).toLocaleString()}
                  </td>
                </tr>
              ))}
              {voids.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    No voids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
