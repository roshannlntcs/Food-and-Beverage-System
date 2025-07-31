import React from "react";

export default function ReceiptModal({ transaction, onClose, shopDetails }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 print:bg-transparent">
      <div className="printable-receipt bg-white w-80 max-h-[90vh] rounded-xl flex flex-col p-4 shadow print:shadow-none print:w-full print:max-h-full">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold">{shopDetails.name}</h2>
          <p className="text-xs">{shopDetails.address}</p>
          <p className="text-xs">{shopDetails.contact}</p>
        </div>

        {/* Transaction Info */}
        <div className="text-xs mb-2">
          <div>Transaction ID: {transaction.transactionID}</div>
          <div>Date: {transaction.date}</div>
          <div>Cashier: {transaction.cashier}</div>
          <div>Payment Method: {transaction.method}</div>
        </div>

        {/* Items List */}
        <div className="border-t border-b py-2 mb-2 space-y-2 text-xs">
          {transaction.items.map((item, idx) => {
            const base = item.price;
            const sizeUp = item.size.price;
            const selectedAddons = item.selectedAddons || [];
            const addonsTotal = selectedAddons.reduce((a, x) => a + x.price, 0);
            const addonNames = selectedAddons.map(a => a.label).join(", ") || "";
            const lineTotal = (base + sizeUp) * item.quantity;

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span>{item.name} ({item.size.label}) x{item.quantity}</span>
                  <span>₱{lineTotal.toFixed(2)}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between pl-2">
                    <span>Add-ons: {addonNames}</span>
                    <span>₱{addonsTotal.toFixed(2)}</span>
                  </div>
                )}
                {item.notes && (
                  <div className="pl-2 italic">Notes: {item.notes}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₱{transaction.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12%):</span>
            <span>₱{transaction.tax.toFixed(2)}</span>
          </div>
          {transaction.discountPct > 0 && (
            <div className="flex justify-between">
              <span>
                Discount ({transaction.discountPct}% {transaction.discountType || ""})
              </span>
              <span>-₱{transaction.discountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t my-1"></div>
          <div className="flex justify-between font-bold text-sm">
            <span>Total:</span>
            <span>₱{transaction.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-around mt-4 print:hidden">
        <button
            onClick={onClose}
            className="bg-gray-300 text-black px-12 py-1 rounded-lg text-sm hover:bg-gray-400"
          >
            Done
          </button>
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-12 py-1 rounded-lg text-sm hover:bg-green-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
