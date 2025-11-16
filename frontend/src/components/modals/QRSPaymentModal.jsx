// src/components/modals/QRSPaymentModal.jsx
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * QRSPaymentModal â€” generates QR code for "Gcash" style
 * Props: isOpen, total, onClose, onScanned, onSuccess
 *
 * Behavior:
 * - Simulate Scanned: sets status "scanned" and calls onScanned(payload)
 * - Simulate Paid: sets status "paid", calls onSuccess({ method: "QRS", reference, payload }) and closes
 *
 * The green scanning line is vertical and constrained to the QR box.
 */
export default function QRSPaymentModal({
  isOpen,
  total = 0,
  onClose,
  onScanned,
  onSuccess,
  onReady,
  onStatusChange,
}) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [status, setStatus] = useState("waiting"); // waiting | scanned | paid
  const [reference, setReference] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      onStatusChange?.({ status: "idle" });
      onReady?.(null);
      setQrDataUrl(null);
      setStatus("waiting");
      setReference(null);
      setPayload(null);
      return;
    }

    const payloadObj = {
      t: Date.now(),
      amount: Number(total || 0).toFixed(2),
      merchant: window.location.hostname || "POS",
      txRef: "POS-" + Math.random().toString(36).slice(2, 9).toUpperCase()
    };
    setReference(payloadObj.txRef);
    setPayload(payloadObj);

    const text = JSON.stringify(payloadObj);
    QRCode.toDataURL(text, { margin: 1, width: 360 })
      .then(url => {
        setQrDataUrl(url);
        onReady?.({ code: url, reference: payloadObj.txRef, payload: payloadObj, status: "waiting" });
        onStatusChange?.({ status: "waiting", reference: payloadObj.txRef, payload: payloadObj });
      })
      .catch(err => {
        console.error("QR gen error", err);
        setQrDataUrl(null);
        onReady?.(null);
      });

    setStatus("waiting");
  }, [isOpen, total, onReady, onStatusChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-lg font-semibold mb-1">QR Payment</div>
            <div className="text-xs text-gray-500">Ask customer to scan</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">Amount</div>
        <div className="text-2xl font-bold mb-4">{`\u20B1${Number(total || 0).toFixed(2)}`}</div>

        <div className="flex flex-col items-center mb-4">
          <div className="bg-white p-2 rounded shadow-sm relative">
            {qrDataUrl ? (
              <div className="relative w-56 h-56 overflow-hidden rounded">
                <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 object-contain block" />
                <div
                  className={`absolute left-0 right-0 h-1.5 bg-green-400/90 rounded-full ${status === "scanned" ? "scan-line" : "opacity-0"}`}
                />
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-gray-400 bg-gray-100">QR Unavailable</div>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-600 text-center">Reference: <span className="font-mono text-xs">{reference}</span></div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">Controls</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatus("scanned");
                onScanned && onScanned(payload);
                onStatusChange?.({ status: "scanned", reference, payload });
              }}
              className="flex-1 py-2 rounded border hover:bg-gray-50"
            >
              Simulate Scanned
            </button>

            <button
              onClick={() => {
                setStatus("paid");
                onSuccess && onSuccess({ method: "QRS", reference, payload });
                onStatusChange?.({ status: "paid", reference, payload });
                onClose && onClose();
              }}
              className="flex-1 py-2 rounded bg-green-600 text-white"
            >
              Simulate Paid
            </button>
          </div>
        </div>

        <div className="text-sm text-center text-gray-600 mb-2">
          {status === "waiting" && "Waiting for the customer to scan the QR"}
          {status === "scanned" && "QR scanned ï¿½ awaiting payment confirmation"}
          {status === "paid" && "Payment received!"}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              onStatusChange?.({ status: "closed", reference, payload });
              onReady?.(null);
              onClose && onClose();
            }}
            className="px-3 py-2 rounded border"
          >
            Close
          </button>
        </div>

        <style>{`
          @keyframes scanVertical {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            50% { top: calc(100% - 6px); opacity: 1; }
            90% { opacity: 1; }
            100% { top: 0; opacity: 0; }
          }
          .scan-line {
            animation: scanVertical 1.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

