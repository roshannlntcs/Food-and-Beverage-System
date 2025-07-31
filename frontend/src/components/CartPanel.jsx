// src/components/CartPanel.jsx
import React from "react";
import images from "../utils/images";

export default function CartPanel({
  cart,
  subtotal,
  discountPct,
  discountAmt,
  tax,
  total,
  paymentMethod,
  setPaymentMethod,
  openEditModal,
  removeCartItem,
  processTransaction,
  setShowHistoryModal,
  transactions
}) {
  return (
    <div className="w-80 bg-[#F6F3EA] border-l border-gray-200 p-6 flex flex-col overflow-hidden shadow">
      <div className="flex-1 flex flex-col h-full">
        {/* Title + History & Void Launcher */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Order Details</h3>
          <button
            onClick={() => transactions.length && setShowHistoryModal(true)}
            disabled={!transactions.length}
            className={`p-1 rounded ${
              transactions.length ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <img
              src={images["void-trans.png"]}
              alt="History & Void"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-gray-400 text-sm">No items added.</div>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="relative group">
                {/* Sliding content */}
                <div
                  className="
                    bg-white rounded p-2
                    transform transition-transform duration-200
                    group-hover:-translate-x-8
                  "
                  onClick={() => openEditModal(item, i)}
                >
                  <div className="flex justify-between items-start">
                    {/* Left: image + details */}
                    <div className="flex space-x-1.5 flex-1 min-w-0">
                      <img
                        src={images[item.image] || images["react.svg"]}
                        alt={item.name}
                        className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-700 truncate">
                          Size: {item.size.label}
                        </div>
                        <div className="text-[10px] text-gray-700">
                          {item.quantity} × ₱
                          {(item.totalPrice / item.quantity).toFixed(2)}
                        </div>
                        {item.addons.length > 0 && (
                          <div className="text-[10px] text-gray-700 truncate">
                            Add‑ons: {item.addons.map(a => a.label).join(", ")}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] italic text-gray-600 truncate">
                            “{item.notes}”
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right: line total */}
                    <div className="flex flex-col items-end justify-between h-full ml-2">
                      <div className="text-xs font-semibold whitespace-nowrap">
                        ₱{item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reveal-on-hover Trash button */}
                <button
                  onClick={() => removeCartItem(i)}
                  className="
                    absolute inset-y-0 right-0 flex items-center justify-center
                    w-8 bg-red-100 rounded-r
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                  "
                  title="Remove item"
                >
                  <img
                    src={images["remove_item.png"]}
                    alt="Remove"
                    className="w-5 h-5 rounded-sm object-cover flex-shrink-0"
                  />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="bg-white p-3 rounded-lg mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          {discountPct > 0 && (
            <div className="flex justify-between">
              <span>Discount ({discountPct}%)</span>
              <span>₱{discountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax (12%)</span>
            <span>₱{tax.toFixed(2)}</span>
          </div>
          <hr className="border-t border-gray-300 my-1" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Buttons */}
        <div className="space-y-3">
          <div className="flex justify-around">
            {[
              { key: "Cash", icon: "cash.png" },
              { key: "Card", icon: "card.png" },
              { key: "QRS", icon: "qrs.png" }
            ].map((method) => (
              <button
                key={method.key}
                onClick={() =>
                  setPaymentMethod(prev =>
                    prev === method.key ? "" : method.key
                  )
                }
                className={`bg-white h-16 w-16 rounded-lg flex flex-col items-center justify-center space-y-1 ${
                  paymentMethod === method.key
                    ? "bg-yellow-100 scale-105"
                    : "hover:scale-105 shadow-md transition-shadow"
                }`}
              >
                <img
                  src={images[method.icon]}
                  alt={method.key}
                  className="w-6 h-6"
                />
                <span className="text-[10px]">{method.key}</span>
              </button>
            ))}
          </div>
          <button
            onClick={processTransaction}
            className="w-full bg-red-800 text-white py-2 rounded-lg font-semibold text-sm"
          >
            Process Transaction
          </button>
        </div>
      </div>
    </div>
  );
}