import React, { useEffect, useMemo, useRef, useState } from "react";
import images from "../../utils/images";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatMoney = (value) => pesoFormatter.format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

export default function HistoryModal({
  open,
  onClose,
  transactions = [],
  onRequestVoid,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [voidFilter, setVoidFilter] = useState("all");

  const filterRef = useRef(null);

  useEffect(() => {
    if (!showFilters) return undefined;
    const handleClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilters]);

  useEffect(() => {
    if (!open) {
      setShowFilters(false);
    }
  }, [open]);

  const filteredTransactions = useMemo(() => {
    let list = Array.isArray(transactions) ? [...transactions] : [];

    list = list.filter((tx) => {
      const dateKey = toDateKey(tx.createdAt || tx.date);

      if (dateFrom && dateTo && dateFrom === dateTo) {
        if (dateKey !== dateFrom) return false;
      } else {
        if (dateFrom && (!dateKey || dateKey < dateFrom)) return false;
        if (dateTo && (!dateKey || dateKey > dateTo)) return false;
      }

      if (
        method !== "All" &&
        String(tx.method || "").toUpperCase() !== method.toUpperCase()
      ) {
        return false;
      }

      if (voidFilter === "fullyVoided" && !tx.voided) return false;
      if (
        voidFilter === "itemVoided" &&
        !(Array.isArray(tx.items) && tx.items.some((item) => item.voided) && !tx.voided)
      ) {
        return false;
      }
      if (
        voidFilter === "noVoid" &&
        (tx.voided || (Array.isArray(tx.items) && tx.items.some((item) => item.voided)))
      ) {
        return false;
      }

      return true;
    });

    list.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.date || 0).getTime();
      const bTime = new Date(b.createdAt || b.date || 0).getTime();
      if (sortBy === "oldest") return aTime - bTime;
      if (sortBy === "highest") {
        return Number(b.total || 0) - Number(a.total || 0);
      }
      if (sortBy === "lowest") {
        return Number(a.total || 0) - Number(b.total || 0);
      }
      return bTime - aTime;
    });

    return list;
  }, [transactions, dateFrom, dateTo, method, voidFilter, sortBy]);

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setMethod("All");
    setSortBy("newest");
    setVoidFilter("all");
  };

  if (!open) return null;

  const handleClose = () => {
    setShowFilters(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[28rem] h-[80vh] flex flex-col overflow-hidden relative">
        <div className="bg-[#800000] px-6 py-4 border-b flex justify-between items-center relative">
          <h2 className="text-xl text-white font-bold">Transaction History</h2>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="text-white hover:opacity-80"
              title="Filter & Sort"
            >
              <img
                src={images["filterw.png"] || images["filter.png"]}
                alt="Filter"
                className="w-5 h-5"
              />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-200 hover:text-white text-xl leading-none"
              aria-label="Close history"
            >
              &times;
            </button>
          </div>

          {showFilters && (
            <div
              ref={filterRef}
              className="absolute top-full right-6 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50 text-sm space-y-3"
            >
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
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Method:
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="All">All</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="QR">QR</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Void Status:
                </label>
                <select
                  value={voidFilter}
                  onChange={(e) => setVoidFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="fullyVoided">Transaction Voids</option>
                  <option value="itemVoided">Item Voids</option>
                  <option value="noVoid">No Voids</option>
                </select>
              </div>
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
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full px-3 py-2 rounded-lg border text-center text-sm hover:bg-gray-100"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          {filteredTransactions.length === 0 && (
            <div className="text-center text-gray-500 text-sm">
              No transactions match the selected filters.
            </div>
          )}

          {filteredTransactions.map((tx) => {
            const methodLabel = String(tx.method || "Cash").toUpperCase();
            const logDate = tx.createdAt || tx.date;
            const items = Array.isArray(tx.items) ? tx.items : [];

            return (
              <div
                key={tx.id || tx.transactionID}
                className={`p-4 rounded-lg border transition-shadow duration-150 ${
                  tx.voided
                    ? "bg-gray-100 opacity-70"
                    : "bg-white hover:shadow-md hover:bg-[#fff7eb]"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">
                      {tx.transactionID || tx.id}
                      {tx.voided ? " (Voided)" : ""}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(logDate)} &middot; {methodLabel}
                    </div>
                  </div>
                  {!tx.voided && onRequestVoid && (
                    <button
                      type="button"
                      onClick={() => onRequestVoid(tx)}
                      className="text-red-600 hover:text-red-800"
                      title="Void entire transaction"
                    >
                      <img
                        src={images["void-trans.png"] || images["void.png"]}
                        alt="Void transaction"
                        className="w-5 h-5"
                      />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const lineTotal =
                      Number(item.totalPrice ?? 0) ||
                      Number(item.price || 0) * Number(item.quantity || 1);
                    const unitPrice =
                      lineTotal && item.quantity
                        ? lineTotal / Number(item.quantity || 1)
                        : Number(item.price || 0);
                    const disabled = item.voided || tx.voided;

                    return (
                      <div
                        key={`${item.id || item.orderItemId || idx}`}
                        className="flex justify-between items-center text-sm"
                      >
                        <div
                          className={
                            disabled ? "line-through text-gray-500" : ""
                          }
                        >
                          {item.name} &times; {item.quantity} @{" "}
                          {formatMoney(unitPrice)}
                        </div>
                        {!disabled && onRequestVoid && (
                          <button
                            type="button"
                            onClick={() => onRequestVoid(tx, idx)}
                            className="text-red-600 hover:text-red-800"
                            title="Void this item"
                          >
                            <img
                              src={images["void-item.png"] || images["void.png"]}
                              alt="Void item"
                              className="w-4 h-4"
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-right text-sm font-medium">
                  Total: {formatMoney(tx.total)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-2 border-t bg-white flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

