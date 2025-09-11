import React from "react";
import images from "../utils/images";
import { useToast } from "./ToastProvider"; // correct relative path (same folder)

export default function CartPanel({
  cart,
  subtotal,
  discountPct,
  discountAmt,
  discountType,   // NEW
  couponCode,     // NEW
  tax,
  total,
  paymentMethod,
  setPaymentMethod,
  openEditModal,
  removeCartItem,
  initiatePayment,
  setShowHistoryModal,
  transactions,
  customerConfirmed, // kept for backwards compatibility but not used (customer view is read-only)
  openCustomerView
}) {
  const { showToast } = useToast();

  const handleSelectPayment = (method) => {
    if (!cart || cart.length === 0) {
      showToast({ message: "Cart is empty.", type: "warning", ttl: 2000, anchorId: "cartpanel-toasts" });
      return;
    }
    setPaymentMethod(prev => prev === method ? "" : method);
  };

  const handleProceed = () => {
    if (!cart || cart.length === 0) {
      showToast({ message: "Cart is empty.", type: "warning", ttl: 2000, anchorId: "cartpanel-toasts" });
      return;
    }
    if (!paymentMethod) {
      showToast({ message: "Select payment method.", type: "info", ttl: 2000, anchorId: "cartpanel-toasts" });
      return;
    }
    initiatePayment && initiatePayment();
  };

  return (
    <div className="w-80 bg-[#F6F3EA] border-l border-gray-200 p-6 flex flex-col overflow-hidden shadow relative">
      {/* toast anchor */}
      <div
        id="cartpanel-toasts"
        aria-live="polite"
        aria-atomic="true"
        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
      />

      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Order Details</h3>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openCustomerView && openCustomerView()}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Open Customer View"
            >
              <img src={images["cusview.png"]} alt="Customer View" className="w-5 h-5" />
            </button>

            <button
              onClick={() => transactions.length && setShowHistoryModal(true)}
              disabled={!transactions.length}
              className={`p-1 rounded ${transactions.length ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"}`}
              title="History & Void Logs"
            >
              <img src={images["history.png"]} alt="History & Void" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-gray-400 text-sm">No items added.</div>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="relative group">
                <div
                  className="bg-white rounded p-2 transform transition-transform duration-200 group-hover:-translate-x-8"
                  onClick={() => openEditModal(item, i)}
                  role="button"
                  tabIndex={0}
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
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-gray-700 truncate">Size: {item.size.label}</div>
                        <div className="text-[10px] text-gray-700">
                          {item.quantity} × ₱{(item.totalPrice / item.quantity).toFixed(2)}
                        </div>
                        {item.addons.length > 0 && (
                          <div className="text-[10px] text-gray-700 truncate">
                            Add-ons: {item.addons.map(a => a.label).join(", ")}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] italic text-gray-600 truncate">“{item.notes}”</div>
                        )}
                      </div>
                    </div>
                    {/* Right: line total */}
                    <div className="flex flex-col items-end ml-2">
                      <div className="text-xs font-semibold whitespace-nowrap">
                        ₱{item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeCartItem(i)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-8 bg-red-100 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Remove item"
                >
                  <img src={images["remove_item.png"]} alt="Remove" className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
{/* Totals */}
<div className="bg-white p-3 rounded-lg mb-4 space-y-1 text-sm">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₱{subtotal.toFixed(2)}</span>
  </div>

  {discountPct > 0 && (
    <>
      <div className="flex justify-between">
        <span>
          Discount
          {discountType && (
            <>
              :
              {discountType === "senior" && "Senior"}
              {discountType === "pwd" && "PWD"}
              {discountType === "student" && "Student"}
            </>
          )}{" "}
          ({discountPct}%)
        </span>
        <span>-₱{discountAmt.toFixed(2)}</span>
      </div>

      {couponCode && (
        <div className="flex justify-between text-gray-700">
          <span>Coupon Code:</span>
          <span>{couponCode}</span>
        </div>
      )}
    </>
  )}

  <div className="flex justify-between">
    <span>VAT (12%)</span>
    <span>₱{tax.toFixed(2)}</span>
  </div>

  <hr className="border-t border-gray-300 my-1" />

  <div className="flex justify-between font-semibold">
    <span>Total</span>
    <span>₱{total.toFixed(2)}</span>
  </div>
</div>


        {/* Payment Methods */}
        <div className="space-y-3 relative">
          <div className="flex justify-around">
            {[
              { key: "Cash", icon: "cash.png" },
              { key: "Card", icon: "card.png" },
              { key: "QRS", icon: "qrs.png" }
            ].map((method) => (
              <button
                key={method.key}
                onClick={() => handleSelectPayment(method.key)}
                className={`bg-white h-16 w-16 rounded-lg flex flex-col items-center justify-center space-y-1 ${
                  paymentMethod === method.key
                    ? "bg-yellow-100 scale-105"
                    : "hover:scale-105 shadow-md transition-shadow"
                }`}
                title={method.key}
                aria-pressed={paymentMethod === method.key}
              >
                <img src={images[method.icon]} alt={method.key} className="w-6 h-6" />
                <span className="text-[10px]">{method.key}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleProceed}
            className={`w-full py-2 rounded-lg font-semibold text-sm ${
              paymentMethod ? "bg-red-800 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            title={!paymentMethod ? "Select payment method" : "Proceed to payment"}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
