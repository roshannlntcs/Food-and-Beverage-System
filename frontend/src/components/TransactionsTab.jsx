// src/components/TransactionsPanel.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import images from "../utils/images";

export default function TransactionsPanel({
  transactions,
  voidLogs,
  onTransactionSelect,
  onVoidSelect
}) {
  // --- Helper: normalize to YYYY-MM-DD ---
  const normalizeDate = (d) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj)) return "";
    return dateObj.toISOString().split("T")[0];
  };

  // ─── Transaction Filters ─────────────────────────
  const [showTxFilter, setShowTxFilter] = useState(false);
  const [txFrom, setTxFrom]             = useState("");
  const [txTo, setTxTo]                 = useState("");
  const [txMethod, setTxMethod]         = useState("");
  const [txVoidFilter, setTxVoidFilter] = useState("all"); // all, full, items, none
  const [txSort, setTxSort]             = useState("newest");
  const txFilterRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (showTxFilter && txFilterRef.current && !txFilterRef.current.contains(e.target)) {
        setShowTxFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTxFilter]);

  const filteredTx = useMemo(() => {
    let list = [...transactions];
    list = list.filter(t => {
      const rawDate = t.createdAt || t.date;
      const txDate = normalizeDate(rawDate);
      if (!txDate) return false;

      if (txFrom && txTo && txFrom === txTo) {
        if (txDate !== txFrom) return false;
      } else {
        if (txFrom && txDate < txFrom) return false;
        if (txTo && txDate > txTo) return false;
      }

      if (
        txMethod &&
        String(t.method || "").toUpperCase() !== txMethod.toUpperCase()
      ) {
        return false;
      }

      // ─── New Void Filter Logic ─────────────────
      if (txVoidFilter === "full" && !t.voided) return false;
      if (txVoidFilter === "items" && !(t.items?.some(i => i.voided) && !t.voided)) return false;
      if (txVoidFilter === "none" && (t.voided || t.items?.some(i => i.voided))) return false;

      return true;
    });

    list.sort((a, b) => {
      const dA = new Date(a.createdAt || a.date || 0);
      const dB = new Date(b.createdAt || b.date || 0);
      if (txSort === "newest") return dB - dA;
      if (txSort === "oldest") return dA - dB;
      if (txSort === "high") return b.total - a.total;
      if (txSort === "low") return a.total - b.total;
      return 0;
    });

    return list;
  }, [transactions, txFrom, txTo, txMethod, txVoidFilter, txSort]);

  const resetTxFilters = () => {
    setTxFrom(""); setTxTo(""); setTxMethod(""); setTxVoidFilter("all"); setTxSort("newest");
  };

  // ─── Void Filters ───────────────────────────────
  const [showVoidFilter, setShowVoidFilter] = useState(false);
  const [voidFrom, setVoidFrom]             = useState("");
  const [voidTo, setVoidTo]                 = useState("");
  const [voidSort, setVoidSort]             = useState("newest");
  const [voidType, setVoidType]             = useState("");
  const voidFilterRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (showVoidFilter && voidFilterRef.current && !voidFilterRef.current.contains(e.target)) {
        setShowVoidFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVoidFilter]);

  const filteredVoids = useMemo(() => {
    let list = [...voidLogs];
    list = list.filter(v => {
      const vDate = normalizeDate(v.dateTime);
      if (!vDate) return false;

      if (voidFrom && voidTo && voidFrom === voidTo) {
        if (vDate !== voidFrom) return false;
      } else {
        if (voidFrom && vDate < voidFrom) return false;
        if (voidTo && vDate > voidTo) return false;
      }

      if (voidType) {
        if (voidType === "transaction" && v.type !== "Full Transaction Void") return false;
        if (voidType === "item" && v.type !== "Item Void") return false;
      }

      return true;
    });

    list.sort((a, b) => {
      const dA = new Date(a.dateTime);
      const dB = new Date(b.dateTime);
      return voidSort === "newest" ? dB - dA : dA - dB;
    });

    return list;
  }, [voidLogs, voidFrom, voidTo, voidSort, voidType]);

  const resetVoidFilters = () => {
    setVoidFrom(""); setVoidTo(""); setVoidSort("newest"); setVoidType("");
  };

  return (
    <div className="flex-1 p-4 flex space-x-4 h-full">
      {/* ─── Transactions Panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Transaction Logs</h2>
          <div className="relative" ref={txFilterRef}>
            <button
              onClick={() => setShowTxFilter(v => !v)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Filter Transactions"
            >
              <img src={images["filter.png"]} alt="Filter" className="w-5 h-5" />
            </button>

            {showTxFilter && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50 text-sm space-y-3">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Date From:</label>
                  <input type="date" value={txFrom} onChange={e => setTxFrom(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Date To:</label>
                  <input type="date" value={txTo} onChange={e => setTxTo(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Payment Method:</label>
                  <select value={txMethod} onChange={e => setTxMethod(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">All</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="QR">QR</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Void Status:</label>
                  <select value={txVoidFilter} onChange={e => setTxVoidFilter(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="all">All Transactions</option>
                    <option value="full">Full Voided</option>
                    <option value="items">Has Voided Items</option>
                    <option value="none">No Void</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Sort By:</label>
                  <select value={txSort} onChange={e => setTxSort(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="high">Highest Amount</option>
                    <option value="low">Lowest Amount</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button onClick={resetTxFilters} className="w-full px-3 py-2 rounded-lg border text-center text-sm hover:bg-gray-100">
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 space-y-0.5">
          {filteredTx.map(tx => (
            <button
              key={tx.transactionID}
              onClick={() => onTransactionSelect(tx)}
              className={`bg-white w-full text-left p-2 rounded-lg border transition duration-150 hover:shadow-md hover:bg-[#fff7eb] ${
                tx.voided ? "bg-red-300" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <img src={images["trans_log.png"]} alt="Transaction Logs" className="w-8 h-8 rounded-sm object-cover flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-medium">{tx.transactionID}{tx.voided && " (Voided)"}</div>
                    <div className="text-xs text-gray-600">Order ID: {tx.orderID}</div>
                  </div>
                </div>
                <span>₱{tx.total.toFixed(2)}</span>
              </div>
            </button>
          ))}
          {filteredTx.length === 0 && <div className="text-gray-400 text-sm">No transactions found.</div>}
        </div>
      </div>

      {/* ─── Void Logs Panel (unchanged except style) ───────────────── */}
      <div className="w-1/2 flex flex-col relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Void Logs</h2>
          <div className="relative" ref={voidFilterRef}>
            <button
              onClick={() => setShowVoidFilter(v => !v)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Filter Void Logs"
            >
              <img src={images["filter.png"]} alt="Filter" className="w-5 h-5" />
            </button>

            {showVoidFilter && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50 text-sm space-y-3">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Date From:</label>
                  <input type="date" value={voidFrom} onChange={e => setVoidFrom(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Date To:</label>
                  <input type="date" value={voidTo} onChange={e => setVoidTo(e.target.value)} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Sort By:</label>
                  <select value={voidSort} onChange={e => setVoidSort(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Type:</label>
                  <select value={voidType} onChange={e => setVoidType(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">All</option>
                    <option value="transaction">Transaction Void</option>
                    <option value="item">Item Void</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button onClick={resetVoidFilters} className="w-full px-3 py-2 rounded-lg border text-center text-sm hover:bg-gray-100">
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 space-y-0.5">
          {filteredVoids.length === 0 && <div className="text-gray-400">No voids yet.</div>}
          {filteredVoids.map(vl => (
            <div
              key={vl.voidId}
              onClick={() => onVoidSelect && onVoidSelect(vl)}
              className={`bg-white p-2 rounded-lg border transition duration-150 hover:shadow-md hover:bg-[#fff7eb] flex justify-between items-center ${
                vl.fullyVoided ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <img
                  src={vl.type === "Full Transaction Void" ? images["trans_void.png"] : images["item_void.png"]}
                  alt={vl.type}
                  className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                />
                <div>
                  <div className="font-medium">{vl.voidId}</div>
                  <div className="text-xs text-gray-600">TRN ID: {vl.txId}</div>
                </div>
              </div>
              {vl.type === "Full Transaction Void"
                ? <span className="text-xs text-red-700 font-medium">Transaction Voided</span>
                : <span className="text-xs text-orange-700 font-medium">Item Voided</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
