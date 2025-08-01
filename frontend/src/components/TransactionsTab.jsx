// src/components/TransactionsPanel.jsx
import React from "react";
import images from "../utils/images";

export default function TransactionsPanel({
  transactions,
  voidLogs,
  onTransactionSelect,   // callback(tx)
  onVoidSelect           // optional callback if you need it
}) {
  return (
    <div className="flex-1 p-2 flex flex-col h-full min-h-0">
      <h2 className="text-2xl font-bold mb-3">Transactions & Void Logs</h2>
      <div className="flex space-x-2 flex-1 h-full min-h-0">

        {/* ─── Transaction Logs ─── */}
        <div className="w-1/2 bg-white rounded-lg shadow p-2 flex flex-col h-full min-h-0">
          <h3 className="font-semibold mb-1">Transaction Logs</h3>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
            {transactions.map((tx) => (
              <button
                key={tx.transactionID}
                onClick={() => onTransactionSelect(tx)}
                className={`
                  w-full text-left p-2 rounded-lg border 
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
                    <span className="font-medium">
                      {tx.transactionID}
                      {tx.voided && " (Voided)"}
                      <div className="text-xs text-gray-600">
                        Order ID: {tx.orderID}
                      </div>
                    </span>
                  </div>
                  <span>₱{tx.total.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Void Logs ─── */}
        <div className="w-1/2 bg-white rounded-lg shadow p-2 flex flex-col h-full min-h-0">
          <h3 className="font-semibold mb-1">Void Logs</h3>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
            {voidLogs.length === 0 && (
              <div className="text-gray-400">No voids yet.</div>
            )}
            {voidLogs.map((vl) => (
              <div
                key={vl.voidId}
                className={`
                  p-2 rounded-lg border transition duration-150 hover:shadow-md
                  ${vl.fullyVoided ? "bg-red-50" : ""}
                `}
                onClick={() => onVoidSelect && onVoidSelect(vl)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img
                      src={images["void_log.png"]}
                      alt="Void Log"
                      className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                    />
                    <span className="font-medium">
                      {vl.voidId}
                      <div className="text-xs text-gray-600">
                        TRN ID: {vl.txId}
                      </div>
                    </span>
                  </div>
                  {vl.fullyVoided && (
                    <span className="text-xs text-gray-600">(Voided)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}