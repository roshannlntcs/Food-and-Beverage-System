// src/components/TransactionsPanel.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import images from "../utils/images";

export default function TransactionsPanel({
  transactions,
  voidLogs,
  onTransactionSelect,
  onVoidSelect
}) {
  // ─── Transaction Filters ─────────────────────────
  const [showTxFilter, setShowTxFilter] = useState(false);
  const [txFrom, setTxFrom]             = useState("");
  const [txTo, setTxTo]                 = useState("");
  const [txMethod, setTxMethod]         = useState("");
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
    return transactions.filter(t => {
      if (txFrom && new Date(t.date) < new Date(txFrom)) return false;
      if (txTo   && new Date(t.date) > new Date(txTo))   return false;
      if (txMethod && t.method !== txMethod)             return false;
      return true;
    });
  }, [transactions, txFrom, txTo, txMethod]);

  // ─── Void Filters ───────────────────────────────
  const [showVoidFilter, setShowVoidFilter] = useState(false);
  const [voidFrom, setVoidFrom]             = useState("");
  const [voidTo, setVoidTo]                 = useState("");
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
    return voidLogs.filter(v => {
      if (voidFrom && new Date(v.dateTime) < new Date(voidFrom)) return false;
      if (voidTo   && new Date(v.dateTime) > new Date(voidTo))   return false;
      return true;
    });
  }, [voidLogs, voidFrom, voidTo]);

  return (
    <div className="flex-1 p-4 flex space-x-4 h-full">
    {/* ─── Transactions Panel ──────────────────────────────── */}
    <div className="flex-1 flex flex-col relative" ref={txFilterRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Transaction Log</h2>
            <button
              onClick={() => setShowTxFilter(v => !v)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Filter Transactions"
            >
              <img src={images["filter.png"]} alt="Filter" className="w-5 h-5" />
            </button>
          </div>

          {showTxFilter && (
            <div className="absolute top-9 right-2 w-48 bg-white border rounded shadow-lg p-3 z-10">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium">From</label>
                  <input
                    type="date"
                    value={txFrom}
                    onChange={e => setTxFrom(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium">To</label>
                  <input
                    type="date"
                    value={txTo}
                    onChange={e => setTxTo(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium">Method</label>
                  <select
                    value={txMethod}
                    onChange={e => setTxMethod(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="QRS">QRS</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setTxFrom(""); setTxTo(""); setTxMethod("");
                  }}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
            {filteredTx.map(tx => (
              <button
                key={tx.transactionID}
                onClick={() => onTransactionSelect(tx)}
                className={`
                  bg-white w-full text-left p-2 rounded-lg border 
                  transition duration-150 hover:shadow-md
                  ${tx.voided ? "bg-gray-100 opacity-60" : ""}
                `}
              >
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img
                      src={images["trans_log.png"]}
                      alt="Transaction Log"
                      className="w-8 h-8 rounded-sm object-cover flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="font-medium">
                        {tx.transactionID}{tx.voided && " (Voided)"}
                        </div>
                        <div className="text-xs text-gray-600">
                          Order ID: {tx.orderID}
                          </div>
                          </div>
                  </div>
                  <span>₱{tx.total.toFixed(2)}</span>
                </div>
              </button>
            ))}
            {filteredTx.length === 0 && (
              <div className="text-gray-400 text-sm">No transactions found.</div>
            )}
          </div>
        </div>

        {/* ─── Void Logs Panel ──────────────────────────────────── */}
      <div className="w-1/2 flex flex-col relative" ref={voidFilterRef}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Void Logs</h2>
            <button
              onClick={() => setShowVoidFilter(v => !v)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Filter Void Logs"
            >
              <img src={images["filter.png"]} alt="Filter" className="w-5 h-5" />
            </button>
          </div>

          {showVoidFilter && (
            <div className="absolute top-9 right-2 w-48 bg-white border rounded shadow-lg p-3 z-10">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium">From</label>
                  <input
                    type="date"
                    value={voidFrom}
                    onChange={e => setVoidFrom(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium">To</label>
                  <input
                    type="date"
                    value={voidTo}
                    onChange={e => setVoidTo(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <button
                  onClick={() => { setVoidFrom(""); setVoidTo(""); }}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
            {voidLogs.length === 0 && (
              <div className="text-gray-400">No voids yet.</div>
            )}
            {filteredVoids.map(vl => (
              <div
                key={vl.voidId}
                onClick={() => onVoidSelect && onVoidSelect(vl)}
                className={`
                  bg-white p-2 rounded-lg border transition duration-150 hover:shadow-md flex justify-between items-center
                  ${vl.fullyVoided ? "bg-red-50" : ""}
                `}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={images["void_log.png"]}
                    alt="Void Log"
                    className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium">{vl.voidId}</div>
                    <div className="text-xs text-gray-600">TRN ID: {vl.txId}</div>
                  </div>
                </div>
                {vl.type === "Full Transaction Void" ? (
  <span className="text-xs text-gray-600">Transaction Voided</span>
) : (
  <span className="text-xs text-gray-600">Item Voided</span>
)}
              </div>
            ))}
          </div>
        </div>

      </div>
  );
}
