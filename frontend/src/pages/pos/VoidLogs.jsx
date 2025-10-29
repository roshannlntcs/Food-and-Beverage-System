// src/pages/pos/VoidLogs.jsx
import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import ShowEntries from "../../components/ShowEntries";
import Pagination from "../../components/Pagination";
import { FaSearch } from "react-icons/fa";
import { fetchVoidLogs } from "../../api/orders";
import VoidDetailModal from "../../components/modals/VoidDetailModal";

const formatDateTime = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const source = typeof value === "number" ? value : String(value);
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" && value.trim() ? value : "-";
  }
  return date.toLocaleString();
};

const normalizeTransactionId = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const stripped = raw.replace(/^(?:ORD|TRANS?)[-_]?/i, "").replace(/^TRN[-_]?/i, "");
  const payload = stripped.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return payload ? `TRN-${payload}` : raw.toUpperCase().startsWith("TRN") ? raw.toUpperCase() : raw;
};

const collectSpecialInstructions = (item) => {
  if (!item || typeof item !== "object") return "";
  return (
    [
      item.notes,
      item.specialInstructions,
      item.instructions,
      item.customerNote,
      item.remark,
      item.remarks,
    ]
      .map((candidate) =>
        typeof candidate === "string" ? candidate.trim() : candidate ?? ""
      )
      .find((candidate) => Boolean(candidate)) || ""
  );
};

const mapVoidedItemsForDetail = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    const quantity = Number(item?.qty ?? item?.quantity ?? 0) || 0;
    const lineTotal = Number(
      item?.lineTotal ?? item?.totalPrice ?? item?.subtotal ?? 0
    );
    const basePrice = Number(item?.price ?? item?.basePrice ?? 0);
    const unitPrice =
      quantity > 0 && lineTotal > 0
        ? lineTotal / quantity
        : basePrice || Number(item?.unitPrice ?? 0);
    const selectedAddons = Array.isArray(item?.selectedAddons)
      ? item.selectedAddons
      : Array.isArray(item?.addons)
      ? item.addons
      : [];

    return {
      name: item?.name || `Item ${index + 1}`,
      quantity,
      price: unitPrice,
      size: item?.size || null,
      selectedAddons,
      notes: collectSpecialInstructions(item),
    };
  });
};

const resolveVoidTypeLabel = (row = {}) => {
  const type = row.voidType || row.type;
  if (String(type).toUpperCase() === "TRANSACTION") return "Full Transaction Void";
  if (String(type).toUpperCase() === "ITEM") return "Item Void";
  return type || "Void Entry";
};

export default function VoidLogs() {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedVoidLog, setSelectedVoidLog] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const response = await fetchVoidLogs({ take: 100 });
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.voidLogs)
          ? response.voidLogs
          : Array.isArray(response)
          ? response
          : [];
        if (active) setRows(list);
      } catch (error) {
        console.error("Failed to load void logs:", error);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const normalizedRows = useMemo(() => {
    return rows.map((row) => {
      const timestamp =
        row.approvedAt ||
        row.requestedAt ||
        row.voidedAt ||
        row.voided_at ||
        row.dateTime ||
        row.date_time ||
        row.date ||
        row.date_at ||
        row.timestamp ||
        row.createdAt ||
        row.created_at ||
        row.updatedAt ||
        row.updated_at ||
        row.order?.createdAt ||
        row.order?.updatedAt ||
        row.order?.dateTime ||
        row.order?.timestamp ||
        row.order?.date;
      const items = Array.isArray(row.items) ? row.items : [];
      return {
        ...row,
        transactionId: normalizeTransactionId(row.transactionId || row.order?.orderCode || row.orderCode),
        cashierName:
          row.cashier?.fullName || row.cashier?.username || row.cashierName || row.cashier || "-",
        managerName:
          row.manager?.fullName || row.manager?.username || row.managerName || row.manager || "-",
        displayDateTime: formatDateTime(timestamp),
        items,
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return normalizedRows;
    return normalizedRows.filter((row) => {
      const matchesTx = String(row.transactionId || "").toLowerCase().includes(query);
      const matchesVoidId = String(row.voidId || row.id || "").toLowerCase().includes(query);
      const matchesReason = String(row.reason || "").toLowerCase().includes(query);
      const matchesItem =
        Array.isArray(row.items) &&
        row.items.some((item) => String(item?.name || "").toLowerCase().includes(query));
      return matchesTx || matchesVoidId || matchesReason || matchesItem;
    });
  }, [normalizedRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / entriesPerPage) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const currentPageRows = filteredRows.slice(startIndex, startIndex + entriesPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const handleRowClick = (row) => {
    if (!row) return;
    const detailPayload = {
      voidId: row.voidId || row.id || "Void Entry",
      transactionId: row.transactionId,
      cashier: row.cashierName,
      manager: row.managerName,
      dateTime: row.displayDateTime,
      type: resolveVoidTypeLabel(row),
      reason: row.reason || "-",
      voidedItemsDetailed: mapVoidedItemsForDetail(row.items),
    };
    setSelectedVoidLog(detailPayload);
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 w-full h-screen flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Void Logs</h1>
          <AdminInfoDashboard2 />
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by transaction, item, or reason"
                className="outline-none w-full text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <ShowEntries
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={setEntriesPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <div className="flex-none bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-y-auto no-scrollbar max-h-[65vh]">
              <table className="w-full text-sm">
                <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-center w-16">No.</th>
                    <th className="text-left p-3 w-48">Date &amp; Time</th>
                    <th className="text-left p-3">Void ID</th>
                    <th className="text-left p-3">Transaction ID</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Voided Items</th>
                    <th className="text-left p-3">Cashier</th>
                    <th className="text-left p-3">Manager</th>
                    <th className="text-left p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : currentPageRows.length ? (
                    currentPageRows.map((row, idx) => (
                      <tr
                        key={row.id ?? row.voidId}
                        className="border-b align-top odd:bg-white even:bg-gray-50 hover:bg-[#f1f1f1] cursor-pointer transition-colors"
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="p-3 text-center">{startIndex + idx + 1}</td>
                        <td className="p-3">{row.displayDateTime}</td>
                        <td className="p-3 font-medium">{row.voidId || row.id}</td>
                        <td className="p-3">{row.transactionId}</td>
                        <td className="p-3">
                          {row.voidType === "TRANSACTION" || row.type === "TRANSACTION"
                            ? "Transaction"
                            : "Item"}
                        </td>
                        <td className="p-3">
                          {row.items.length ? (
                            row.items.map((item, itemIdx) => (
                              <div
                                key={item.orderItemId || itemIdx}
                                className="flex justify-between gap-4"
                              >
                                <span className="truncate">
                                  {item.name || `#${item.orderItemId}`}
                                </span>
                                <span className="text-gray-600 whitespace-nowrap">
                                  x{item.qty ?? item.quantity ?? 0}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="p-3">{row.cashierName}</td>
                        <td className="p-3">{row.managerName}</td>
                        <td className="p-3">{row.reason || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {selectedVoidLog && (
        <VoidDetailModal
          voidLog={selectedVoidLog}
          onClose={() => setSelectedVoidLog(null)}
        />
      )}
    </div>
  );
}

