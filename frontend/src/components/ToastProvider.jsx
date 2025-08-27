import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";

const ToastContext = createContext(null);

/**
 * Toast shape:
 * { id, message, type: "info"|"success"|"warning"|"error", ttl, anchorId? }
 *
 * showToast accepts optional anchorId to render the toast inside a DOM element
 * with that id (useful for in-panel toasts). If anchorId is not present, a
 * default viewport-level container (bottom-right) is used.
 */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message = "", type = "info", ttl = 3500, anchorId = null } = {}) => {
    const id = Date.now().toString(36) + "-" + Math.floor(Math.random() * 10000);
    const t = { id, message, type, ttl, anchorId };
    setToasts((s) => [t, ...s]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter(t => t.id !== id));
  }, []);

  // Auto remove based on ttl
  useEffect(() => {
    const timers = toasts.map(t => {
      if (!t.ttl) return null;
      const timer = setTimeout(() => removeToast(t.id), t.ttl);
      return timer;
    });
    return () => timers.forEach(tm => tm && clearTimeout(tm));
  }, [toasts, removeToast]);

  // Group toasts by anchorId (null => default viewport)
  const grouped = toasts.reduce((acc, t) => {
    const key = t.anchorId || "__DEFAULT__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Default viewport container (when anchorId not provided) */}
      {grouped["__DEFAULT__"] && grouped["__DEFAULT__"].length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-6 right-6 z-60 flex flex-col gap-2 pointer-events-none"
        >
          {grouped["__DEFAULT__"].map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Render inlined toasts into anchor elements (if present) using portals */}
      {Object.keys(grouped).filter(k => k !== "__DEFAULT__").map(anchorId => {
        const items = grouped[anchorId];
        // find the target element
        const target = typeof window !== "undefined" ? document.getElementById(anchorId) : null;
        if (!target) {
          // if target isn't present, fallback to viewport area (but still render)
          return (
            <div key={anchorId} className="fixed bottom-6 right-6 z-60 flex flex-col gap-2 pointer-events-none">
              {items.map(t => (
                <div key={t.id} className="pointer-events-auto">
                  <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
                </div>
              ))}
            </div>
          );
        }

        // Portal into the target
        return ReactDOM.createPortal(
          <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-2 pointer-events-none">
            {items.map(t => (
              <div key={t.id} className="pointer-events-auto">
                <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
              </div>
            ))}
          </div>,
          target
        );
      })}
    </ToastContext.Provider>
  );
}

function Toast({ message, type = "info", onClose }) {
  // simple color mapping
  const colors = {
    info: { bg: "bg-white", border: "border-blue-300", text: "text-gray-800" },
    success: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    warning: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800" },
    error: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800" },
  };

  const c = colors[type] || colors.info;

  return (
    <div
      role="status"
      className={`max-w-xs w-full rounded-lg shadow-md border ${c.border} ${c.bg} p-3 transform transition-all duration-300 ease-out animate-toast-in`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 text-sm font-medium break-words">
          <div className={`${c.text}`}>{message}</div>
        </div>
        <button onClick={onClose} className="text-xs text-gray-500 ml-2 hover:opacity-80">✕</button>
      </div>

      <style>{`
        @keyframes toastIn {
          0% { transform: translateY(-8px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-toast-in { animation: toastIn 220ms cubic-bezier(.2,.9,.2,1); }
      `}</style>
    </div>
  );
}
