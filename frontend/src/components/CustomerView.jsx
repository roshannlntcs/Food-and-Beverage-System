// src/pages/CustomerView.jsx
import React, { useEffect, useState } from "react";

/**
 * CustomerView — black background, green monospace text, read-only.
 * Listens for cart updates and a close command.
 */
export default function CustomerView() {
  const [state, setState] = useState({ cart: [], subtotal: 0, tax: 0, total: 0, discountPct: 0 });
  const bcRef = React.useRef(null);

  useEffect(() => {
    // BroadcastChannel (if available)
    if ("BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("pos-cart");
      bcRef.current.onmessage = (ev) => {
        if (!ev.data) return;
        setState(prev => ({ ...prev, ...ev.data }));
      };
    }

    const msgHandler = (ev) => {
      // accept only same origin messages
      try { if (ev.origin && ev.origin !== window.location.origin) return; } catch(e) {}
      const d = ev.data;
      if (!d) return;
      // close command
      if (d.type === "close_customer_view") {
        try { window.close(); } catch(e) {}
        return;
      }
      setState(prev => ({ ...prev, ...d }));
    };
    window.addEventListener("message", msgHandler);

    // localStorage snapshot
    try {
      const raw = localStorage.getItem("pos_cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {}

    const storageHandler = (e) => {
      if (e.key === "pos_cart" && e.newValue) {
        try { const parsed = JSON.parse(e.newValue); setState(prev => ({ ...prev, ...parsed })); } catch(e) {}
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      if (bcRef.current) bcRef.current.close();
      window.removeEventListener("message", msgHandler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#7CFC00", fontFamily: "monospace", padding: 24 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: "700" }}>ORDER SUMMARY</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date().toLocaleString()}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          {state.cart && state.cart.length ? state.cart.map((it, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(124,252,0,0.06)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{it.name} {it.size?.label ? `(${it.size.label})` : ""}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{(it.selectedAddons || []).map(a=>a.label).join(", ")} {it.notes ? ` — ${it.notes}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>₱{(it.totalPrice || 0).toFixed(2)}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{it.quantity}×</div>
              </div>
            </div>
          )) : <div style={{ opacity: 0.7, fontSize: 14 }}>No items yet</div>}
        </div>

        <div style={{ background: "rgba(124,252,0,0.02)", padding: 12, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div>Subtotal</div><div>₱{(state.subtotal || 0).toFixed(2)}</div></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div>Tax</div><div>₱{(state.tax || 0).toFixed(2)}</div></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 8 }}><div>Total</div><div>₱{(state.total || 0).toFixed(2)}</div></div>
        </div>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 12 }}>
          Display is read-only. Payment will be processed by the cashier.
        </div>
      </div>
    </div>
  );
}
