// src/components/modals/HistoryModal.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import images from "../../utils/images";

export default function HistoryModal({
  transactions,
  setShowHistoryModal,
  setVoidContext,
  setShowVoidPassword
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [voidFilter, setVoidFilter] = useState("all");
  const filterRef = useRef(null);

  // --- Close filter menu on outside click ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // --- Date helper: normalize to YYYY-MM-DD ---
  const normalizeDate = (d) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj)) return "";
    return dateObj.toISOString().split("T")[0]; // e.g. "2025-08-19"
  };

  // Filtering + sorting
  const filteredTx = useMemo(() => {
    let list = [...transactions];

    // filter by date range
    if (dateFrom || dateTo) {
      list = list.filter((tx) => {
        const txDate = normalizeDate(tx.date); // normalize transaction date
        if (!txDate) return false;

        if (dateFrom && dateTo && dateFrom === dateTo) {
          // exact date match
          return txDate === dateFrom;
        }
        if (dateFrom && txDate < dateFrom) return false;
        if (dateTo && txDate > dateTo) return false;
        return true;
      });
    }

    // filter by method
    if (method !== "All") {
      list = list.filter((tx) => tx.method === method);
    }

    // filter by void status
    if (voidFilter === "fullyVoided") {
      list = list.filter((tx) => tx.voided === true);
    } else if (voidFilter === "itemVoided") {
      list = list.filter(
        (tx) => tx.voided !== true && tx.items.some((it) => it.voided === true)
      );
    } else if (voidFilter === "noVoid") {
      list = list.filter(
        (tx) => tx.voided !== true && tx.items.every((it) => !it.voided)
      );
    }

    // sorting
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "highest") {
      list.sort((a, b) => b.total - a.total);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.total - b.total);
    }

    return list;
  }, [transactions, dateFrom, dateTo, method, sortBy, voidFilter]);

  // --- Reset all filters ---
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setMethod("All");
    setSortBy("newest");
    setVoidFilter("all");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[28rem] max-h-[80vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#800000] px-6 py-4 border-b flex justify-between items-center relative">
          <h2 className="text-xl text-white font-bold">Transaction History</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="text-white hover:opacity-80"
              title="Filter & Sort"
            >
              <img src={images["filterw.png"]} alt="Filter" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-gray-200 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Filter dropdown */}
          {showFilters && (
            <div
              ref={filterRef}
              className="absolute top-full right-6 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50 text-sm space-y-3"
            >
              {/* Date range */}
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Date From:
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Date To:
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Payment Method:
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option>All</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>QRS</option>
                </select>
              </div>

              {/* Void Status */}
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Void Status:
                </label>
                <select
                  value={voidFilter}
                  onChange={(e) => setVoidFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="all">All Transactions</option>
                  <option value="fullyVoided">Fully Voided</option>
                  <option value="itemVoided">Has Voided Items</option>
                  <option value="noVoid">No Void</option>
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Sort By:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>

              {/* Reset button */}
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 rounded-lg border text-center text-sm hover:bg-gray-100"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredTx.map(
            (tx) =>
              !tx.isVoidLog && (
                <div
                  key={tx.id}
                  className={`p-4 rounded-lg border ${
                    tx.voided
                      ? "bg-gray-100 opacity-60"
                      : "hover:shadow-md transition-shadow duration-150"
                  }`}
                >
                  {/* Transaction header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">
                        {tx.voided ? `${tx.id} (Voided)` : tx.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tx.date} • {tx.method}
                      </div>
                    </div>
                    {!tx.voided && (
                      <button
                        onClick={() => {
                          setVoidContext({ type: "transaction", tx });
                          setShowVoidPassword(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <img
                          src={images["void-trans.png"]}
                          alt="Void Tx"
                          className="w-5 h-5"
                        />
                      </button>
                    )}
                  </div>

                  {/* Line items */}
                  <div className="space-y-1">
                    {tx.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <div
                          className={
                            item.voided ? "line-through text-gray-500" : ""
                          }
                        >
                          {item.name} x{item.quantity} @ ₱
                          {(item.totalPrice / item.quantity).toFixed(2)}
                        </div>
                        {!item.voided && !tx.voided && (
                          <button
                            onClick={() => {
                              setVoidContext({ type: "item", tx, index: idx });
                              setShowVoidPassword(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <img
                              src={images["void-item.png"]}
                              alt="Void Item"
                              className="w-4 h-4"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 text-right text-sm font-medium">
                    Total: ₱{tx.total.toFixed(2)}
                  </div>
                </div>
              )
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-2 border-t bg-white flex justify-end">
          <button
            onClick={() => setShowHistoryModal(false)}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
