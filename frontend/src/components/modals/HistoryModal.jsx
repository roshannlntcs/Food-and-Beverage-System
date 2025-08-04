// src/components/modals/HistoryModal.jsx
import React from "react";
import images from "../../utils/images";

export default function HistoryModal({
  transactions,
  setShowHistoryModal,
  setVoidContext,
  setShowVoidPassword
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[28rem] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#800000] px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl text-white font-bold">Transaction History</h2>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="text-gray hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {transactions.map(tx => (
            !tx.isVoidLog && (
              <div
                key={tx.id}
                className={`p-4 rounded-lg border ${
                  tx.voided
                    ? 'bg-gray-100 opacity-60'
                    : 'hover:shadow-md transition-shadow duration-150'
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
                        setVoidContext({ type: 'transaction', tx });
                        setShowVoidPassword(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <img src={images["void-trans.png"]} alt="Void Tx" className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Line items */}
                <div className="space-y-1">
                  {tx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className={item.voided ? 'line-through text-gray-500' : ''}>
                        {item.name} x{item.quantity} @ ₱{(item.totalPrice/item.quantity).toFixed(2)}
                      </div>
                      {!item.voided && !tx.voided && (
                        <button
                          onClick={() => {
                            setVoidContext({ type: 'item', tx, index: idx });
                            setShowVoidPassword(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <img src={images["void-item.png"]} alt="Void Item" className="w-4 h-4" />
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
          ))}
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