// src/pages/CustomerView.jsx
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const INITIAL_STATE = {
  cart: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  discountPct: 0,
  discountAmt: 0,
  discountType: null,
  couponCode: null,
  paymentMethod: "",
  qrPayment: { status: "idle", reference: null, payload: null, amount: 0 },
};

const QR_STATUS_LABELS = {
  idle: "QR payment inactive",
  preparing: "Preparing QR payment…",
  waiting: "Waiting for customer to scan",
  scanned: "QR scanned - awaiting payment confirmation",
  paid: "Payment received",
  closed: "QR session closed",
  cancelled: "QR session cancelled",
};

function formatDiscountType(value) {
  const raw = (value || "").toString().toLowerCase();
  if (raw === "senior") return "Senior";
  if (raw === "pwd") return "PWD";
  if (raw === "student") return "Student";
  return value || "";
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

export default function CustomerView() {
  const [state, setState] = useState(INITIAL_STATE);
  const bcRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    if ("BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("pos-cart");
      bcRef.current.onmessage = (event) => {
        if (!event.data) return;
        setState((prev) => ({ ...prev, ...event.data }));
      };
    }

    const handleMessage = (event) => {
      try {
        if (event.origin && event.origin !== window.location.origin) return;
      } catch (error) {
        // ignore cross-origin access issue
      }

      const data = event.data;
      if (!data) return;

      if (data.type === "close_customer_view") {
        try {
          window.close();
        } catch (_) {}
        return;
      }

      setState((prev) => ({ ...prev, ...data }));
    };

    window.addEventListener("message", handleMessage);

    return () => {
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const generateQr = async () => {
      const payload = state.qrPayment?.payload;
      if (!payload) {
        setQrCodeUrl(null);
        return;
      }

      try {
        const text =
          typeof payload === "string" ? payload : JSON.stringify(payload);
        const dataUrl = await QRCode.toDataURL(text, { margin: 1, width: 220 });
        if (active) setQrCodeUrl(dataUrl);
      } catch (error) {
        console.error("Customer view failed to build QR code:", error);
        if (active) setQrCodeUrl(null);
      }
    };

    generateQr();

    return () => {
      active = false;
    };
  }, [state.qrPayment?.payload, state.qrPayment?.status]);

  const discountPct = Number(state.discountPct || 0);
  const discountAmt = Number(state.discountAmt || 0);
  const hasDiscount = discountPct > 0 || discountAmt > 0;
  const discountTypeLabel = formatDiscountType(state.discountType);
  const couponCode = (state.couponCode || "").toString().trim();
  const paymentLabel = state.paymentMethod
    ? state.paymentMethod.toString().toUpperCase()
    : "NOT SELECTED";
  const qrPayment = state.qrPayment || {};
  const qrStatusKey = (qrPayment.status || "idle").toLowerCase();
  const qrStatusLabel =
    QR_STATUS_LABELS[qrStatusKey] ||
    (qrPayment.status ? String(qrPayment.status) : QR_STATUS_LABELS.idle);
  const showQrSection =
    qrStatusKey !== "idle" &&
    (qrPayment.status || qrPayment.payload || paymentLabel === "QRS");

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#7CFC00",
        fontFamily: "monospace",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>ORDER SUMMARY</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {new Date().toLocaleString()}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          {state.cart && state.cart.length ? (
            state.cart.map((item, idx) => {
              const addons = Array.isArray(item?.selectedAddons)
                ? item.selectedAddons
                    .map((addon) => addon?.label)
                    .filter(Boolean)
                    .join(", ")
                : "";

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(124,252,0,0.06)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {item.name}{" "}
                      {item.size?.label ? `(${item.size.label})` : ""}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      {addons}
                      {item.notes ? ` - ${item.notes}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>
                      {formatCurrency(item.totalPrice || 0)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      {Number(item.quantity || 0)}x
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ opacity: 0.7, fontSize: 14 }}>No items yet</div>
          )}
        </div>

        <div
          style={{
            background: "rgba(124,252,0,0.02)",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div>Subtotal</div>
            <div>{formatCurrency(state.subtotal)}</div>
          </div>

          {hasDiscount && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div>
                  Discount
                  {discountTypeLabel ? ` (${discountTypeLabel})` : ""}
                  {discountPct ? ` (${discountPct.toFixed(0)}%)` : ""}
                </div>
                <div>-{formatCurrency(Math.abs(discountAmt))}</div>
              </div>

              {discountTypeLabel && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  <div>Type</div>
                  <div>{discountTypeLabel}</div>
                </div>
              )}

              {couponCode && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  <div>Coupon</div>
                  <div>{couponCode}</div>
                </div>
              )}
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div>Tax</div>
            <div>{formatCurrency(state.tax)}</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            <div>Total</div>
            <div>{formatCurrency(state.total)}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "rgba(124,252,0,0.05)",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
            Payment Method
          </div>
          <div style={{ fontWeight: 600 }}>{paymentLabel}</div>

          {!hasDiscount && couponCode && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              Coupon: {couponCode}
            </div>
          )}

          {showQrSection && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>QR Payment</div>
              <div style={{ fontWeight: 600 }}>{qrStatusLabel}</div>
              {qrPayment.reference && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Reference: {qrPayment.reference}
                </div>
              )}
              {qrPayment.amount && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Amount: {formatCurrency(qrPayment.amount)}
                </div>
              )}
              {qrCodeUrl && qrStatusKey !== "paid" && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR code"
                    style={{
                      width: 160,
                      height: 160,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 12 }}>
          Display is read-only. Payment will be processed by the cashier.
        </div>
      </div>
    </div>
  );
}

