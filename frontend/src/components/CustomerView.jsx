// src/components/CustomerView.jsx
import React, { useEffect, useState } from "react";
import { placeholders } from "../utils/data";

export default function CustomerView() {
  const [payload, setPayload] = useState({ cart: [], subtotal: 0, tax: 0, total: 0, discountPct: 0 });
  const [confirmed, setConfirmed] = useState(false);

  const categorize = (items) => {
    const categorized = {};
    Object.keys(placeholders).forEach(cat => (categorized[cat] = []));
    items.forEach(item => {
      for (const [cat, itemsList] of Object.entries(placeholders)) {
        if (itemsList.some(p => p.name === item.name)) {
          categorized[cat].push(item);
          break;
        }
      }
    });
    return categorized;
  };

  useEffect(() => {
    const applyPayload = (p) => {
      if (!p) return;
      setPayload({
        cart: p.cart || [],
        subtotal: p.subtotal ?? 0,
        tax: p.tax ?? 0,
        total: p.total ?? 0,
        discountPct: p.discountPct ?? 0
      });
      // Any incoming cart update invalidates prior confirmation
      setConfirmed(false);
    };

    // BroadcastChannel listener (if available) — will receive messages from cashier
    let bc;
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('pos-cart');
        bc.onmessage = (ev) => {
          applyPayload(ev.data);
        };
      } catch (e) {
        // ignore if BroadcastChannel instantiation fails
      }
    }

    // message listener for postMessage from opener
    const msgHandler = (ev) => {
      // Only accept same-origin messages
      try { if (ev.origin !== window.location.origin) return; } catch (e) {}
      applyPayload(ev.data);
    };
    window.addEventListener('message', msgHandler);

    // storage event fallback (for same-origin windows)
    const storageHandler = (ev) => {
      if (ev.key === 'pos_cart' && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          applyPayload(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', storageHandler);

    // try to read existing localStorage state on mount
    try {
      const existing = JSON.parse(localStorage.getItem('pos_cart') || '{}');
      applyPayload(existing);
    } catch (e) {}

    return () => {
      if (bc) bc.close();
      window.removeEventListener('message', msgHandler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const categorized = categorize(payload.cart);

  // Send confirm/unconfirm back to the opener (cashier) and via BroadcastChannel
  const sendConfirmation = (isConfirm) => {
    const msg = { type: isConfirm ? 'customer_confirm' : 'customer_unconfirm' };

    // postMessage to opener (cashier)
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(msg, window.location.origin);
      }
    } catch (e) {
      // ignore
    }

    // BroadcastChannel fallback
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('pos-cart');
        bc.postMessage(msg);
        bc.close();
      } catch (e) {
        // ignore
      }
    }

    setConfirmed(isConfirm);
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h2 className="text-xl font-semibold mb-2">Confirm Your Order</h2>

      <div style={{ maxHeight: '62vh', overflowY: 'auto' }}>
        {Object.entries(categorized).map(([category, items]) => (
          items.length > 0 ? (
            <div key={category} className="mb-4">
              <h3 className="font-semibold text-sm mb-2">{category}</h3>
              {items.map((it, i) => {
                const itemTotal = (() => {
                  const base = typeof it.price === 'number' ? it.price : 0;
                  const sizeUp = it.size?.price || 0;
                  const addons = (it.selectedAddons || []).reduce((s,a) => s + (a.price||0), 0);
                  return ((base + sizeUp + addons) * (it.quantity || 1)).toFixed(2);
                })();

                return (
                  <div key={i} className="p-2 mb-2 border rounded bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {it.name} <span className="text-xs text-gray-500">x{it.quantity}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {it.size?.label ? `${it.size.label}` : ''}
                          {it.selectedAddons?.length ? ` · ${it.selectedAddons.map(a => a.label).join(', ')}` : ''}
                        </div>
                        {it.notes && <div className="text-xs italic text-gray-500">Notes: {it.notes}</div>}
                      </div>
                      <div className="text-sm font-medium">₱{itemTotal}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null
        ))}
        {payload.cart.length === 0 && <div className="text-gray-500">No items yet.</div>}
      </div>

      <div className="mt-3 p-3 border rounded bg-gray-50">
        <div className="flex justify-between"><span>Subtotal</span><strong>₱{(payload.subtotal || 0).toFixed(2)}</strong></div>
        <div className="flex justify-between"><span>Tax</span><strong>₱{(payload.tax || 0).toFixed(2)}</strong></div>
        <div className="flex justify-between mt-2 text-lg"><span>Total</span><strong>₱{(payload.total || 0).toFixed(2)}</strong></div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => sendConfirmation(true)}
          disabled={confirmed || payload.cart.length === 0}
          className={`flex-1 py-2 rounded-lg font-semibold ${confirmed ? "bg-green-200 text-green-800" : "bg-[#800000] text-white"}`}
        >
          {confirmed ? "Confirmed" : "Confirm Order"}
        </button>
        <button
          onClick={() => sendConfirmation(false)}
          className="py-2 px-3 rounded-lg border"
        >
          Cancel
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500">Tip: resize window to tablet portrait for best layout.</div>
    </div>
  );
}
