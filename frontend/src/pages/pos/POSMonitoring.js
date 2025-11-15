// src/pages/pos/POSMonitoring.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";
import { FaSearch } from "react-icons/fa";
import { fetchOrders } from "../../api/orders";
import { mapOrderToTx } from "../../utils/mapOrder";
import ReceiptModal from "../../components/modals/ReceiptModal";
import { shopDetails } from "../../utils/data";

export default function POSMonitoring() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetchOrders({ take: 100 });
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response)
          ? response
          : [];
        if (!active) return;
        const mapped = list.map(mapOrderToTx).sort((a, b) => {
          const aTime = new Date(a.createdAt || a.date || 0).getTime();
          const bTime = new Date(b.createdAt || b.date || 0).getTime();
          return aTime - bTime;
        });
        setRows(mapped);
      } catch (error) {
        console.error("Failed to load orders for POS monitoring:", error);
        if (active) setRows([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cashierOptions = useMemo(() => {
    const seen = new Map();
    rows.forEach((tx) => {
      const id =
        tx.cashierId != null
          ? String(tx.cashierId)
          : String(tx.cashier || "").trim();
      if (!id) return;
      if (seen.has(id)) return;
      seen.set(id, tx.cashier || `Cashier ${id}`);
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [rows]);

  const paymentOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((tx) => {
      const method = String(tx?.method || "").toUpperCase();
      if (method) set.add(method);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((t) => {
      const idMatch = String(t.transactionID || "").toLowerCase().includes(q);
      const normalizedCashier =
        t.cashierId != null
          ? String(t.cashierId)
          : String(t.cashier || "").trim();
      const cashierMatch =
        !cashierFilter || normalizedCashier === cashierFilter;
      const methodMatch =
        !methodFilter ||
        String(t.method || "").toUpperCase() === methodFilter;
      const createdStamp = t.createdAt || t.date || null;
      const dateObj = createdStamp ? new Date(createdStamp) : null;
      const dayKey =
        dateObj && !Number.isNaN(dateObj.getTime())
          ? dateObj.toISOString().split("T")[0]
          : "";
      const dateMatch = !filterDate || dayKey === filterDate;
      return idMatch && cashierMatch && dateMatch && methodMatch;
    });
  }, [rows, searchQuery, filterDate, cashierFilter, methodFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterDate("");
    setCashierFilter("");
    setMethodFilter("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const currentPageData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderItems = (items = []) => {
    if (!Array.isArray(items) || !items.length) {
      return <span>-</span>;
    }

    const formatted = items.map((item, index) => {
      const name = item?.name || `Item ${index + 1}`;
      const quantity = Number(item?.quantity ?? item?.qty ?? 0) || 0;
      return `${name} x${quantity}`;
    });

    const preview = formatted.slice(0, 2).join(", ");
    const remainder = formatted.length > 2 ? `, +${formatted.length - 2} more` : "";

    return (
      <span className="block truncate max-w-xs" title={formatted.join(", ")}>
        {preview}
        {remainder}
      </span>
    );
  };

  const handleDeleteClick = (event, tx) => {
    event.stopPropagation();
    window.alert(
      `Deleting transactions from monitoring is currently restricted.\nPlease use the void workflow in the POS to remove ${tx?.transactionID || "this transaction"}.`
    );
  };

  return (
    <>
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 w-full h-screen flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold">POS Monitoring</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/pos/sales-report")}
              className="px-4 py-2 text-sm font-semibold bg-[#800000] text-white rounded-lg shadow hover:bg-[#a40000] transition-colors"
            >
              Sales Report
            </button>
            <AdminInfoDashboard2 />
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border rounded-md px-4 py-2 w-72 bg-white">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search Transaction ID"
                  className="outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <select
                value={cashierFilter}
                onChange={(e) => {
                  setCashierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-md px-3 py-2 text-sm bg-white min-w-[180px]"
              >
                <option value="">All cashiers</option>
                {cashierOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-md px-3 py-2 text-sm bg-white min-w-[160px]"
              >
                <option value="">All methods</option>
                {paymentOptions.map((method) => (
                  <option key={method} value={method}>
                    {method.charAt(0) + method.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border rounded-md px-3 py-2 text-sm bg-white"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="flex-none bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-y-auto no-scrollbar max-h-[73vh]">
              <table className="w-full text-sm">
                <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-center w-16">No.</th>
                    <th className="text-left p-3 w-48">Date</th>
                    <th className="text-left p-3">Transaction ID</th>
                    <th className="text-left p-3">Cashier</th>
                    <th className="text-left p-3">Method</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-right p-3">Subtotal</th>
                    <th className="text-right p-3">Discount</th>
                    <th className="text-right p-3">Tax</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-center p-3 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((t, idx) => (
                    <tr
                      key={t.id}
                      className="border-b odd:bg-white even:bg-gray-50 hover:bg-[#f1f1f1] cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedTransaction(t);
                        setShowReceiptModal(true);
                      }}
                    >
                      <td className="p-3 text-center">{startIndex + idx + 1}</td>
                      <td className="p-3">{formatDateTime(t.createdAt || t.date)}</td>
                      <td className="p-3 font-medium">{t.transactionID}</td>
                      <td className="p-3">{t.cashier}</td>
                      <td className="p-3">{t.method}</td>
                      <td className="p-3 align-top">{renderItems(t.items)}</td>
                      <td className="p-3 text-right">{formatCurrency(t.subtotal)}</td>
                      <td className="p-3 text-right">
                        {formatCurrency(t.discountAmt ?? t.discount ?? 0)}
                      </td>
                      <td className="p-3 text-right">{formatCurrency(t.tax ?? 0)}</td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(t.total)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition"
                          onClick={(event) => handleDeleteClick(event, t)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!currentPageData.length && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={11}>
                        No records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
          </div>
        </div>
      </div>
    </div>
    <ReceiptModal
        open={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        amountPaid={selectedTransaction?.tendered ?? selectedTransaction?.paymentDetails?.tendered ?? selectedTransaction?.total ?? 0}
        changeDue={selectedTransaction?.change ?? selectedTransaction?.paymentDetails?.change ?? 0}
        shopDetails={shopDetails}
      />
    </>
  );
}

