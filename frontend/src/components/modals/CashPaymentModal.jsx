// src/components/modals/CashPaymentModal.jsx
import React, { useEffect, useState, useRef } from "react";

/**
 * CashPaymentModal — cash register style with small animations
 * Props:
 *  - isOpen, total, onClose, onSuccess
 */
export default function CashPaymentModal({ isOpen, total = 0, onClose, onSuccess }) {
  const [tendered, setTendered] = useState("");
  const [displayTender, setDisplayTender] = useState(0); // animated display
  const [change, setChange] = useState(0);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coins, setCoins] = useState([]); // array of coin animation items
  const animRef = useRef(null);
  const finishTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setTendered("");
      setDisplayTender(0);
      setChange(0);
      setError("");
      setDrawerOpen(false);
      setCoins([]);
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      return;
    }
    // Focus input after open
    setTimeout(() => {
      const el = document.getElementById("cash-tender-input");
      if (el) el.focus();
    }, 80);
  }, [isOpen]);

  // animate displayed tender to feel like rolling numbers
  useEffect(() => {
    const target = parseFloat(tendered || 0) || 0;
    if (animRef.current) clearInterval(animRef.current);
    const start = displayTender;
    const diff = target - start;
    if (Math.abs(diff) < 0.005) {
      setDisplayTender(target);
      return;
    }
    const steps = 10;
    let i = 0;
    animRef.current = setInterval(() => {
      i++;
      const eased = start + (diff * i) / steps;
      setDisplayTender(+eased.toFixed(2));
      if (i >= steps) {
        clearInterval(animRef.current);
        animRef.current = null;
        setDisplayTender(target);
      }
    }, 25);
    return () => {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tendered]);

  const calcChange = (val) => {
    const n = parseFloat(val || 0);
    if (isNaN(n)) return 0;
    return +(n - total).toFixed(2);
  };

  const handleInput = (v) => {
    setError("");
    // sanitize numeric only
    const cleaned = v.toString().replace(/[^\d.]/g, "");
    // limit decimals to 2
    const parts = cleaned.split(".");
    const formatted = parts.length <= 1 ? parts[0] : parts[0] + "." + (parts[1] || "").slice(0,2);
    setTendered(formatted);
    setChange(calcChange(formatted));
  };

  const quickAdd = (amt) => {
    const cur = parseFloat(tendered || 0) || 0;
    const newVal = +(cur + amt).toFixed(2);
    handleInput(newVal.toString());
  };

  const handleKeypad = (key) => {
    if (key === "C") return handleInput("");
    if (key === "<") {
      handleInput((tendered || "").slice(0, -1));
      return;
    }
    handleInput((tendered || "") + key);
  };

  // run a small drawer + coin animation on confirm
  const animateConfirmAndClose = (finalTender, finalChange) => {
    // open drawer
    setDrawerOpen(true);

    // spawn coin visuals
    const coinCount = Math.min(8, Math.max(3, Math.floor((finalChange || 0) / 10)));
    const newCoins = Array.from({ length: coinCount }).map((_, idx) => ({
      id: Date.now() + "-" + idx,
      left: 28 + Math.random() * 220,
      delay: Math.random() * 300,
    }));
    setCoins(newCoins);

    // schedule finishing sequence: keep drawer open briefly, then close and finalize
    finishTimeoutRef.current = setTimeout(() => {
      setDrawerOpen(false);
      // clear coins after animation
      finishTimeoutRef.current = setTimeout(() => {
        setCoins([]);
        // finalize (call callback) slightly after animation to feel tactile
        onSuccess && onSuccess({ method: "Cash", tendered: parseFloat(finalTender), change: parseFloat(finalChange) });
        onClose && onClose();
      }, 900);
    }, 700);
  };

  const submit = () => {
    const n = parseFloat(tendered);
    if (isNaN(n) || n <= 0) {
      setError("Please enter a valid tendered amount.");
      return;
    }
    if (n + 0.0001 < total) {
      setError("Tendered amount is less than total.");
      return;
    }
    const ch = calcChange(n);
    setChange(ch);
    // run animation and close afterwards
    animateConfirmAndClose(n, ch);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden max-h-[100vh]">
        {/* header */}
        <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-sm bg-yellow-600 flex items-center justify-center text-white font-bold">₱</div>
            <div>
              <div className="text-sm font-semibold">Cash Register</div>
              <div className="text-xs text-gray-700">Simulated cash flow</div>
            </div>
          </div>
          <button className="text-gray-700" onClick={() => onClose && onClose()}>✕</button>
        </div>

        <div className="p-4 overflow-auto">
          {/* amount due */}
          <div className="mb-3">
            <div className="text-xs text-gray-500">Amount Due</div>
            <div className="text-2xl font-bold">₱{Number(total || 0).toFixed(2)}</div>
          </div>

          {/* input + display */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Tendered</label>
              <input
                id="cash-tender-input"
                value={tendered}
                onChange={(e) => handleInput(e.target.value)}
                inputMode="decimal"
                className="w-full p-2 border rounded text-lg"
                placeholder="0.00"
              />
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>
            <div className="flex flex-col justify-between">
              <div className="text-xs text-gray-600">Display (rolling)</div>
              <div className="text-xl font-semibold">₱{displayTender.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-2">Change</div>
              <div className="text-lg font-semibold">₱{Math.max(0, change).toFixed(2)}</div>
            </div>
          </div>

          {/* quick buttons */}
          <div className="mb-3 flex gap-2 flex-wrap">
            {[20,50,100,200,500,1000].map(b => (
              <button key={b} onClick={() => quickAdd(b)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">+₱{b}</button>
            ))}
            <button onClick={() => handleInput(Number(total).toFixed(2))} className="ml-auto px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-sm">Exact</button>
          </div>

          {/* keypad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["1","2","3","4","5","6","7","8","9",".","0","<"].map(k => (
              <button key={k} onClick={() => handleKeypad(k)} className="py-3 rounded bg-gray-50 hover:bg-gray-100 text-lg">{k === "<" ? "⌫" : k}</button>
            ))}
            <button onClick={() => handleKeypad("C")} className="col-span-3 py-2 rounded bg-red-100 hover:bg-red-200">Clear</button>
          </div>

          {/* actions */}
          <div className="flex justify-end space-x-2">
            <button onClick={() => onClose && onClose()} className="px-3 py-2 rounded border">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded bg-green-600 text-white font-semibold">Confirm & Tender</button>
          </div>
        </div>

        {/* drawer visual (bottom) */}
        <div className="relative h-4 bg-transparent">
          <div className={`absolute bottom-0 left-0 right-0 flex justify-center items-end transition-transform duration-400 ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}>
            <div className="w-[90%] max-w-[420px] h-20 bg-gray-800 rounded-t-lg shadow-inner relative overflow-visible">
              <div className="absolute -top-6 left-4 w-14 h-7 bg-yellow-400 rounded-sm flex items-center justify-center text-xs font-bold">PAID</div>
              {/* coins flying */}
              {coins.map((c, i) => (
                <span
                  key={c.id}
                  style={{
                    left: `${c.left}px`,
                    animationDelay: `${c.delay}ms`
                  }}
                  className="absolute bottom-4 w-5 h-5 rounded-full bg-yellow-300 opacity-90 transform translate-y-0 animate-coin"
                />
              ))}
            </div>
          </div>
        </div>

        {/* small style for coin animation */}
        <style>{`
          @keyframes coinFly {
            0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 1; }
            60% { transform: translateY(-60px) scale(1.05) rotate(180deg); opacity: 1; }
            100% { transform: translateY(-120px) scale(0.6) rotate(360deg); opacity: 0; }
          }
          .animate-coin {
            animation: coinFly 900ms cubic-bezier(.2,.8,.2,1) forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
