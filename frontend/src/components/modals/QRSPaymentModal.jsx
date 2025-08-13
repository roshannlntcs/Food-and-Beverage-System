// src/components/modals/QRSPaymentModal.jsx
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import images from "../../utils/images";

/**
 * QRSPaymentModal
 * Props:
 * - isOpen
 * - total
 * - onClose
 * - onSuccess({ method: "QRS", reference? })
 *
 * This generates a client-side QR code (data URL) that can be scanned
 * by a real phone wallet. For offline simulation we encode a simple
 * payload that includes amount, merchant and timestamp.
 *
 * NOTE: install `qrcode` package: npm i qrcode
 */
export default function QRSPaymentModal({ isOpen, total = 0, onClose, onSuccess }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [status, setStatus] = useState("waiting"); // waiting | scanned | paid
  const [reference, setReference] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setQrDataUrl(null);
      setStatus("waiting");
      setReference(null);
      return;
    }

    // Build a payload that a wallet could read (for simulation we use JSON)
    // In a real integration you'd follow the PSP's QR spec or generate a standardized payload.
    const payload = {
      t: Date.now(),
      amount: Number(total || 0).toFixed(2),
      merchant: (window.location.hostname || "POS"),
      txRef: "POS-" + Math.random().toString(36).slice(2,9).toUpperCase()
    };
    localStorage.setItem('pos_qr_payload', JSON.stringify(payload));
    setReference(payload.txRef);

    const text = JSON.stringify(payload);

    // generate QR data URL
    QRCode.toDataURL(text, { margin: 1, width: 360 })
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error("QR gen error", err);
        setQrDataUrl(null);
      });

    // reset state
    setStatus("waiting");
  }, [isOpen, total]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gcash / QR Payment</h3>
          <button onClick={() => onClose && onClose()} className="text-gray-500">✕</button>
        </div>

        <div className="text-sm text-gray-600 mb-2">Amount</div>
        <div className="text-2xl font-bold mb-4">₱{Number(total || 0).toFixed(2)}</div>

        <div className="flex flex-col items-center mb-4">
          <div className="bg-white p-2 rounded shadow-sm">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 object-contain" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-gray-400 bg-gray-100">QR Unavailable</div>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-600 text-center">
            Scan with Gcash (or any QR wallet) to pay.<br />
            Reference: <span className="font-mono text-xs">{reference}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">Simulation controls</div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStatus("scanned"); }}
              className="flex-1 py-2 rounded border hover:bg-gray-50"
            >
              Simulate Scanned
            </button>
            <button
              onClick={() => {
                // paid
                setStatus("paid");
                onSuccess && onSuccess({ method: "QRS", reference });
                onClose && onClose();
              }}
              className="flex-1 py-2 rounded bg-green-600 text-white"
            >
              Simulate Paid
            </button>
          </div>
        </div>

        <div className="text-sm text-center text-gray-600 mb-2">
          {status === "waiting" && "Waiting for customer to scan the QR"}
          {status === "scanned" && "QR scanned — awaiting payment confirmation from wallet"}
          {status === "paid" && "Payment received ✓"}
        </div>

        <div className="flex justify-end">
          <button onClick={() => onClose && onClose()} className="px-3 py-2 rounded border">Close</button>
        </div>
      </div>
    </div>
  );
}
