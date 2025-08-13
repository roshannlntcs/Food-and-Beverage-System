// src/components/modals/CardPaymentModal.jsx
import React, { useState, useEffect } from "react";

/**
 * CardPaymentModal
 * Props:
 * - isOpen
 * - total
 * - onClose
 * - onSuccess({ method: "Card", cardNumberMasked, authCode })
 * - onFailure({ reason })
 *
 * This modal visually resembles a card terminal with a card summary,
 * simulated authorization and spinner. Success rate is configurable here.
 */
export default function CardPaymentModal({
  isOpen,
  total = 0,
  onClose,
  onSuccess,
  onFailure
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const SUCCESS_RATE = 0.92; // 92% simulated success

  useEffect(() => {
    if (!isOpen) {
      setCardNumber("");
      setCardName("");
      setPin("");
      setProcessing(false);
      setMessage("");
    }
  }, [isOpen]);

  const maskCard = (num) => {
    const s = (num || "").toString().replace(/\s+/g, "");
    if (s.length <= 4) return s;
    return "**** **** **** " + s.slice(-4);
  };

  const formatNumber = (v) => {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
  };

  const authorize = () => {
    setMessage("");
    if (cardNumber.replace(/\D/g, "").length < 8) {
      setMessage("Enter a valid card number (min 8 digits).");
      return;
    }
    setProcessing(true);
    setMessage("Contacting bank...");

    // simulated latency
    setTimeout(() => {
      const ok = Math.random() < SUCCESS_RATE;
      if (ok) {
        const authCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        setProcessing(false);
        setMessage("Approved ✓ Auth code: " + authCode);
        onSuccess && onSuccess({ method: "Card", cardNumberMasked: maskCard(cardNumber), authCode });
        onClose && onClose();
      } else {
        setProcessing(false);
        const reason = "Authorization declined";
        setMessage("Declined ✕");
        onFailure ? onFailure({ reason }) : alert("Card declined: " + reason);
      }
    }, 1200 + Math.random() * 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Card Payment</h3>
          <button onClick={() => onClose && onClose()} className="text-gray-500">✕</button>
        </div>

        {/* Card preview */}
        <div className="mb-4 rounded-lg overflow-hidden border">
          <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-4">
            <div className="text-xs opacity-80">Card Terminal</div>
            <div className="mt-3 text-sm">{formatNumber(cardNumber) || "•••• •••• •••• ••••"}</div>
            <div className="mt-1 text-xs opacity-80">{cardName || "CARDHOLDER NAME"}</div>
          </div>
          <div className="p-3 bg-gray-50 flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-600">Amount</div>
              <div className="font-semibold">₱{Number(total).toFixed(2)}</div>
            </div>
            <div className="text-right text-xs text-gray-500">Insert / Tap / Swipe</div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2 mb-3">
          <input
            type="text"
            value={formatNumber(cardNumber)}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Card number"
            className="w-full border rounded p-2"
            inputMode="numeric"
          />
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Cardholder name"
            className="w-full border rounded p-2"
          />
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0,6))}
            placeholder="PIN (optional)"
            className="w-full border rounded p-2"
            inputMode="numeric"
          />
        </div>

        {message && (
          <div className="mb-3 text-sm">
            <span className={message.includes("Approved") ? "text-green-600" : "text-gray-700"}>{message}</span>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={() => onClose && onClose()} disabled={processing} className="px-3 py-2 rounded border">Cancel</button>
          <button
            onClick={authorize}
            disabled={processing}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold flex items-center space-x-2"
          >
            {processing ? (
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" fill="none"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
            ) : null}
            <span>{processing ? "Authorizing…" : "Authorize Card"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
