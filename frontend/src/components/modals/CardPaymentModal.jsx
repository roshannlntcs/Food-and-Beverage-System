// src/components/modals/CardPaymentModal.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * CardPaymentModal — Insert / Tap / Swipe simulation with flip-card visual + animations
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
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [action, setAction] = useState(null); // insert|tap|swipe
  const [message, setMessage] = useState("");
  const [animState, setAnimState] = useState("idle"); // idle|animating|done
  const [isFlipped, setIsFlipped] = useState(false);
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  const timerRef = useRef(null);
  const cancelledRef = useRef(false);
  const SUCCESS_RATE = 0.92;

  // Reset / focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        try {
          firstInputRef.current?.focus();
        } catch (e) {}
      }, 60);
      cancelledRef.current = false;
    } else {
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");
      setAction(null);
      setMessage("");
      setAnimState("idle");
      setErrors({});
      setIsFlipped(false);
    }
  }, [isOpen]);

  // Helpers
  const onlyDigits = (s) => (s || "").replace(/\D/g, "");
  const formatCardNumberDisplay = (raw) => {
    const digits = onlyDigits(raw).slice(0, 19);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };
  const maskCard = (raw) => {
    const d = onlyDigits(raw);
    if (!d) return "•••• •••• •••• ••••";
    return "**** **** **** " + d.slice(-4);
  };
  const last4 = (raw) => onlyDigits(raw).slice(-4);

  const formatExpiryInput = (v) => {
    const digits = onlyDigits(v).slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2);
  };

  const expiryValid = (s) => {
    if (!s || s.length !== 5) return false;
    const [mmS, yyS] = s.split("/");
    const mm = parseInt(mmS, 10);
    const yy = parseInt(yyS, 10);
    if (!mm || !yy) return false;
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const thisYear = now.getFullYear() % 100;
    const thisMonth = now.getMonth() + 1;
    if (yy < thisYear) return false;
    if (yy === thisYear && mm < thisMonth) return false;
    return true;
  };

  const validateForm = () => {
    const e = {};
    const digits = onlyDigits(cardNumber);
    if (digits.length !== 16) e.cardNumber = "Card number must be 16 digits";
    if (!cardName.trim()) e.cardName = "Cardholder name required";
    if (!expiryValid(expiry)) e.expiry = "Expiry invalid or expired";
    if (!(cvv.length === 3 || cvv.length === 4)) e.cvv = "CVV must be 3 or 4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const simulateAuthorize = () => {
    if (animState === "animating") return;
    setMessage("");
    if (!validateForm()) {
      setMessage("Fix validation errors before authorizing.");
      return;
    }
    if (!action) {
      setMessage("Select Insert / Tap / Swipe first.");
      return;
    }

    setAnimState("animating");
    setMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} in progress…`);

    const delay = 900 + Math.random() * 900;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (cancelledRef.current) return;
      const ok = Math.random() < SUCCESS_RATE;
      setAnimState("done");
      if (ok) {
        const authCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        setMessage("Approved ✓ " + authCode);
        const paymentInfo = {
          method: "Card",
          tendered: Number(total) || 0,
          change: 0,
          cardNumberMasked: maskCard(cardNumber),
          cardLast4: last4(cardNumber),
          authCode,
          cardholderName: cardName,
          expiry
        };
        setTimeout(() => {
          if (cancelledRef.current) return;
          onSuccess && onSuccess(paymentInfo);
          onClose && onClose();
        }, 350);
      } else {
        const reason = "Authorization declined";
        setMessage("Declined ✕");
        onFailure ? onFailure({ reason }) : alert("Card declined: " + reason);
      }
    }, delay);
  };

  // Handlers
  const onCardNumberChange = (e) => {
    const digits = onlyDigits(e.target.value).slice(0, 16);
    setCardNumber(digits);
  };
  const onNameChange = (e) => setCardName(e.target.value);
  const onExpiryChange = (e) => setExpiry(formatExpiryInput(e.target.value));
  const onCvvChange = (e) => setCvv(onlyDigits(e.target.value).slice(0, 4));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Card payment"
    >
      <style>{`
        .flip-card-3d { perspective: 1000px; }
        .flip-card-inner-3d { transform-style: preserve-3d; transition: transform 0.7s; }
        .flip-card-inner-3d.flipped { transform: rotateY(180deg); }
        .flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; transform-style: preserve-3d; }
        .flip-face-back { transform: rotateY(180deg); }
      `}</style>

      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-sm font-semibold">Card Payment</div>
            <div className="text-xs text-gray-500">Terminal simulator</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setAction("insert")}
                className={`px-3 py-1 rounded text-sm ${
                  action === "insert" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Insert
              </button>
              <button
                onClick={() => setAction("tap")}
                className={`px-3 py-1 rounded text-sm ${
                  action === "tap" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Tap
              </button>
              <button
                onClick={() => setAction("swipe")}
                className={`px-3 py-1 rounded text-sm ${
                  action === "swipe" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Swipe
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Card with animations */}
          <div className="flex items-center justify-center">
            <div
              className={`flip-card-3d w-80 h-48 relative select-none transform transition-transform duration-500 ${
                animState === "animating" && action === "insert"
                  ? "translate-x-[-40px] scale-95"
                  : ""
              } ${
                animState === "animating" && action === "swipe"
                  ? "translate-x-[-120px]"
                  : ""
              } ${
                animState === "animating" && action === "tap"
                  ? "scale-105 shadow-lg"
                  : ""
              }`}
              onMouseEnter={() => setIsFlipped(true)}
              onMouseLeave={() => setIsFlipped(false)}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
            >
              <div
                className={`flip-card-inner-3d ${
                  isFlipped ? "flipped" : ""
                } absolute inset-0`}
              >
                {/* Front */}
                <div className="flip-face absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-8 bg-yellow-300 rounded-sm shadow-inner" />
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 7c4 2 6 6 6 10"
                        stroke="#fff"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                      <path
                        d="M7 7c2 1.1 3 3 3 6"
                        stroke="#fff"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.75"
                      />
                      <path
                        d="M11 7c0.4 0.2 1 1 1 3"
                        stroke="#fff"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                  <div className="text-lg font-mono tracking-widest">
                    {cardNumber ? maskCard(cardNumber) : "•••• •••• •••• ••••"}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-gray-300">VALID THRU</div>
                      <div className="text-sm font-semibold">
                        {expiry || "MM/YY"}
                      </div>
                      <div className="mt-2 text-sm font-semibold">
                        {cardName || "CARDHOLDER NAME"}
                      </div>
                    </div>
                    <div>
                    <svg width="50" height="40" viewBox="0 0 60 40" aria-hidden>
                      <circle cx="20" cy="20" r="12" fill="#ff9800" />
                      <circle cx="36" cy="20" r="12" fill="#d50000" />
                      <path
                        d="M26 20a8 8 0 0 1 10 0 8 8 0 0 1 -10 0"
                        fill="#ff3d00"
                        opacity="0.9"
                      />
                    </svg>
                    </div>
                  </div>
                </div>
                {/* Back */}
                <div className="flip-face flip-face-back absolute inset-0 bg-gray-900 rounded-lg p-4">
                  <div className="h-6 bg-black/90 rounded-sm mb-3" />
                  <div className="bg-white p-2 rounded flex items-center justify-between">
                    <div className="text-xs text-gray-800">Signature</div>
                    <div className="bg-gray-200 w-12 h-8 rounded flex items-center justify-center text-sm">
                      CVV
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-mono text-right text-white">
                    {cvv ? cvv.replace(/./g, "*") : "***"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                simulateAuthorize();
              }}
              className="space-y-3"
            >
              <label className="block">
                <div className="text-xs text-gray-600 mb-1">Card holder full name</div>
                <input
                  ref={firstInputRef}
                  value={cardName}
                  onChange={onNameChange}
                  className={`w-full p-3 rounded-xl bg-transparent border ${
                    errors.cardName ? "border-red-500" : "border-gray-200"
                  } focus:border-amber-500 outline-none text-sm`}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.cardName}
                />
                {errors.cardName && (
                  <div className="text-xs text-red-500 mt-1">{errors.cardName}</div>
                )}
              </label>

              <label className="block">
                <div className="text-xs text-gray-600 mb-1">Card Number</div>
                <input
                  value={formatCardNumberDisplay(cardNumber)}
                  onChange={onCardNumberChange}
                  className={`w-full p-3 rounded-xl bg-transparent border ${
                    errors.cardNumber ? "border-red-500" : "border-gray-200"
                  } focus:border-amber-500 outline-none text-sm font-mono`}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  aria-invalid={!!errors.cardNumber}
                />
                {errors.cardNumber && (
                  <div className="text-xs text-red-500 mt-1">{errors.cardNumber}</div>
                )}
              </label>

              <div className="flex gap-3">
                <label className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Expiry Date</div>
                  <input
                    value={expiry}
                    onChange={onExpiryChange}
                    className={`w-full p-3 rounded-xl bg-transparent border ${
                      errors.expiry ? "border-red-500" : "border-gray-200"
                    } focus:border-amber-500 outline-none text-sm`}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    aria-invalid={!!errors.expiry}
                  />
                  {errors.expiry && (
                    <div className="text-xs text-red-500 mt-1">{errors.expiry}</div>
                  )}
                </label>

                <label className="w-32">
                  <div className="text-xs text-gray-600 mb-1">CVV</div>
                  <input
                    type="password"
                    value={cvv}
                    onChange={onCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    className={`w-full p-3 rounded-xl bg-transparent border ${
                      errors.cvv ? "border-red-500" : "border-gray-200"
                    } focus:border-amber-500 outline-none text-sm`}
                    placeholder="CVV"
                    inputMode="numeric"
                    aria-invalid={!!errors.cvv}
                  />
                  {errors.cvv && (
                    <div className="text-xs text-red-500 mt-1">{errors.cvv}</div>
                  )}
                </label>
              </div>

              {message && <div className="text-sm text-gray-600">{message}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    cancelledRef.current = true;
                    if (timerRef.current) {
                      clearTimeout(timerRef.current);
                      timerRef.current = null;
                    }
                    onClose && onClose();
                  }}
                  className="px-4 py-2 rounded border"
                  disabled={animState === "animating"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={animState === "animating"}
                  className={`px-4 py-2 rounded bg-amber-600 text-white font-semibold flex items-center gap-2 ${
                    animState === "animating" ? "opacity-80" : "hover:opacity-90"
                  }`}
                >
                  {animState === "animating" ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray="60"
                        strokeDashoffset="20"
                      />
                    </svg>
                  ) : (
                    "Authorize"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
