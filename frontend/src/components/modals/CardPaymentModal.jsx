// src/components/modals/CardPaymentModal.jsx
import React, { useEffect, useState } from "react";

/**
 * CardPaymentModal — Insert / Tap / Swipe simulation
 * Props: isOpen, total, onClose, onSuccess, onFailure
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
  const [action, setAction] = useState(null); // "insert"|"tap"|"swipe"
  const [animState, setAnimState] = useState("idle"); // idle | animating | done
  const SUCCESS_RATE = 0.92;

  useEffect(() => {
    if (!isOpen) {
      setCardNumber("");
      setCardName("");
      setPin("");
      setProcessing(false);
      setMessage("");
      setAction(null);
      setAnimState("idle");
    }
  }, [isOpen]);

  const formatNumber = (v) => v.replace(/\D/g, "").slice(0,16).replace(/(\d{4})/g, "$1 ").trim();

  const maskCard = (num) => {
    const s = (num || "").toString().replace(/\s+/g, "");
    if (!s) return "•••• •••• •••• ••••";
    return "**** **** **** " + s.slice(-4);
  };

  const authorize = () => {
    // require some action selected
    if (!action) {
      setMessage("Select Insert / Tap / Swipe first.");
      return;
    }
    if (cardNumber.replace(/\D/g, "").length < 8) {
      setMessage("Enter a valid card number.");
      return;
    }

    // run animation for the chosen action
    setAnimState("animating");
    setMessage(`${action.charAt(0).toUpperCase()+action.slice(1)} in progress...`);

    setTimeout(() => {
      // simulate outcome
      const ok = Math.random() < SUCCESS_RATE;
      setAnimState("done");
      setProcessing(false);
      if (ok) {
        const authCode = Math.random().toString(36).slice(2,8).toUpperCase();
        setMessage("Approved ✓ " + authCode);
        onSuccess && onSuccess({ method: "Card", cardNumberMasked: maskCard(cardNumber), authCode });
        onClose && onClose();
      } else {
        const reason = "Authorization declined";
        setMessage("Declined ✕");
        onFailure ? onFailure({ reason }) : alert("Card declined: " + reason);
      }
    }, 900 + Math.random() * 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <div className="text-sm font-semibold">Card Payment</div>
            <div className="text-xs text-gray-500">Terminal simulator</div>
          </div>
          <button onClick={() => onClose && onClose()} className="text-gray-600">✕</button>
        </div>

        <div className="p-4 overflow-auto">
          <div className="mb-3">
            <div className="text-xs text-gray-500">Amount</div>
            <div className="text-2xl font-semibold">₱{Number(total).toFixed(2)}</div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2">
            <input value={formatNumber(cardNumber)} onChange={e => setCardNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="Card number"/>
            <input value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-2 border rounded" placeholder="Cardholder name"/>
            <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0,6))} type="password" inputMode="numeric" className="w-full p-2 border rounded" placeholder="PIN (optional)"/>
          </div>

          {/* Terminal visualization */}
          <div className="mb-3">
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-gray-900/90 text-white p-3 flex justify-between items-center">
                <div className="text-sm">{formatNumber(cardNumber) || "•••• •••• •••• ••••"}</div>
                <div className="text-xs opacity-80">{cardName || "CARDHOLDER"}</div>
              </div>
              <div className="p-3 bg-gray-50">
                {/* action buttons */}
                <div className="flex gap-2 mb-3">
                  <button onClick={() => { setAction("insert"); setMessage("Insert selected"); }} className={`px-3 py-2 rounded ${action==="insert" ? "bg-blue-600 text-white" : "bg-white border"}`}>Insert</button>
                  <button onClick={() => { setAction("tap"); setMessage("Tap selected"); }} className={`px-3 py-2 rounded ${action==="tap" ? "bg-blue-600 text-white" : "bg-white border"}`}>Tap</button>
                  <button onClick={() => { setAction("swipe"); setMessage("Swipe selected"); }} className={`px-3 py-2 rounded ${action==="swipe" ? "bg-blue-600 text-white" : "bg-white border"}`}>Swipe</button>
                </div>

                {/* action animation area */}
                <div className="h-28 bg-white rounded border flex items-center justify-center relative overflow-hidden">
                  {/* card artwork */}
                  <div className={`w-48 h-28 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-400 text-white p-3 transform transition-transform duration-500 ${action === "insert" && animState==="animating" ? "translate-x-[-40px] scale-95" : ""} ${action === "swipe" && animState==="animating" ? "translate-x-[-120px]" : ""} ${action === "tap" && animState==="animating" ? "scale-105 shadow-lg" : ""}`}>
                    <div className="text-xs opacity-90">{cardName || "CARDHOLDER"}</div>
                    <div className="mt-4 text-lg font-mono">{maskCard(cardNumber)}</div>
                  </div>

                  {/* slot visual for insert */}
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-28 h-6 bg-gray-700 rounded-sm ${action==="insert" && animState==="animating" ? "animate-pulse" : ""}`}/>
                </div>
              </div>
            </div>
          </div>

          {/* message and controls */}
          {message && <div className="mb-3 text-sm text-gray-600">{message}</div>}

          <div className="flex justify-end gap-2">
            <button onClick={() => onClose && onClose()} className="px-3 py-2 rounded border">Cancel</button>
            <button onClick={authorize} disabled={animState==="animating"} className="px-4 py-2 rounded bg-blue-600 text-white">
              {animState==="animating" ? "Processing…" : "Authorize"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
