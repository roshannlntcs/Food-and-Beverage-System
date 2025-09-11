// src/components/modals/ItemDetailModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import images from "../../utils/images";
import { useInventory } from "../../contexts/InventoryContext";

function TooltipPortal({ children, visible }) {
  if (!visible) return null;
  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        zIndex: 9999,
        pointerEvents: "none",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="text-sm px-4 py-2 rounded-md shadow-md"
        style={{ background: "rgba(0,0,0,0.85)", color: "white" }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function ItemDetailModal({
  isOpen,
  product,              // the modalProduct object from parent
  editingIndex,         // null when adding, or an integer when editing
  onClose,              // () => void
  onAdd,                // (itemData) => void
  onApply,              // (itemData, index) => void
  onRemove              // (index) => void
}) {
  const MAX_GLOBAL = 100;
  const { inventory = [] } = useInventory();

  // find inventory record by name (case-insensitive)
  const invItem = inventory.find(
    it => String(it.name).toLowerCase() === String(product?.name || "").toLowerCase()
  );

  // compute effective maximum stock (min(inventoryQty, 100))
  const inventoryQuantity = typeof invItem?.quantity === "number" ? Math.max(0, Math.floor(invItem.quantity)) : null;
  const effectiveMax = inventoryQuantity !== null ? Math.min(inventoryQuantity, MAX_GLOBAL) : MAX_GLOBAL;
  const isOutOfStock = effectiveMax === 0;

  // Hooks
  const [quantity, setQuantity]     = useState(1);
  const [size, setSize]             = useState({ label: "", price: 0 });
  const [addons, setAddons]         = useState([]);
  const [notes, setNotes]           = useState("");
  const [dirty, setDirty]           = useState(false);

  // inline-editing state for the quantity label
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [editingQtyValue, setEditingQtyValue] = useState("");

  // info tooltip text (rendered via portal so it doesn't affect layout)
  const [infoMsg, setInfoMsg] = useState("");
  const tooltipTimerRef = useRef(null);

  // Seed state when modal opens or product changes
  useEffect(() => {
    if (!isOpen || !product) return;
    const initialQty = Number(product.quantity ?? 1) || 1;
    const seededQty = isOutOfStock ? 0 : Math.max(1, Math.min(Math.floor(initialQty), effectiveMax));
    setQuantity(seededQty);
    setSize(product.size ?? product.sizes?.[0] ?? { label: "", price: 0 });
    setAddons(product.selectedAddons ?? []);
    setNotes(product.notes ?? "");
    setDirty(false);
    setIsEditingQty(false);
    setEditingQtyValue(String(seededQty));
    setInfoMsg("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, effectiveMax]);

  useEffect(() => {
    if (isOutOfStock) {
      setQuantity(0);
      setEditingQtyValue("0");
      showTooltipOnce("Out of stock");
    } else if (quantity > effectiveMax) {
      setQuantity(effectiveMax);
      setEditingQtyValue(String(effectiveMax));
      showTooltipOnce(`Quantity reduced to available stock (${effectiveMax}).`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMax]);

  function showTooltipOnce(text, ms = 2500) {
    clearTimeout(tooltipTimerRef.current);
    setInfoMsg(text);
    tooltipTimerRef.current = setTimeout(() => {
      setInfoMsg("");
      tooltipTimerRef.current = null;
    }, ms);
  }

  useEffect(() => {
    return () => clearTimeout(tooltipTimerRef.current);
  }, []);

  // clamp helpers
  const clampToEffective = (raw) => {
    if (isOutOfStock) return 0;
    let n = Number(raw);
    if (!Number.isFinite(n) || Number.isNaN(n)) n = 1;
    n = Math.max(1, Math.floor(n));
    if (n > effectiveMax) {
      showTooltipOnce(`Cannot exceed available stock (${effectiveMax}).`);
      n = effectiveMax;
    }
    return n;
  };

  const setQtyWithClamp = (n) => {
    const clamped = clampToEffective(n);
    setQuantity(clamped);
    setEditingQtyValue(String(clamped));
  };

  const handleDecrease = () => {
    if (isOutOfStock) {
      showTooltipOnce("Out of stock");
      return;
    }
    if (quantity > 1) {
      setQtyWithClamp(quantity - 1);
      setDirty(true);
    }
  };

  const handleIncrease = () => {
    if (isOutOfStock) {
      showTooltipOnce("Out of stock");
      return;
    }
    if (quantity < effectiveMax) {
      setQtyWithClamp(quantity + 1);
      setDirty(true);
    } else {
      showTooltipOnce(`Reached available stock (${effectiveMax}).`);
    }
  };

  const startEditingQty = () => {
    if (isOutOfStock) {
      showTooltipOnce("Out of stock");
      return;
    }
    setIsEditingQty(true);
    setEditingQtyValue(String(quantity));
  };

  const commitEditingQty = () => {
    const raw = editingQtyValue.trim();
    if (raw === "") {
      setQtyWithClamp(1);
    } else {
      const clamped = clampToEffective(raw);
      setQuantity(clamped);
      setEditingQtyValue(String(clamped));
    }
    setIsEditingQty(false);
    setDirty(true);
  };

  const cancelEditingQty = () => {
    setIsEditingQty(false);
    setEditingQtyValue(String(quantity));
  };

  const canSubmit = () => !isOutOfStock && Number(quantity) >= 1;

  const handleAdd = () => {
    if (!canSubmit()) {
      showTooltipOnce(isOutOfStock ? "Out of stock" : "Invalid quantity");
      return;
    }
    onAdd({ quantity, size, addons, notes });
    onClose();
  };

  const handleApply = () => {
    if (!canSubmit()) {
      showTooltipOnce(isOutOfStock ? "Out of stock" : "Invalid quantity");
      return;
    }
    onApply({ quantity, size, addons, notes }, editingIndex);
    onClose();
  };

  // lock modal size
  if (!isOpen || !product) return null;

  const addonsTotalPerUnit = addons.reduce((sum, a) => sum + (a.price || 0), 0);
  const sizePrice = size?.price || 0;
  const lineTotal = ((product.price || 0) + sizePrice + addonsTotalPerUnit) * Math.max(0, quantity);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
        <div
          className="bg-white rounded-2xl shadow-xl w-[576px] h-[640px] flex flex-col overflow-hidden border"
          style={{ borderColor: "#800000" }}
        >
          {/* HEADER */}
          <div className="bg-gray-100 p-4 flex items-start gap-4">
            <img
              src={images[product.image]}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">{product.name}</h2>
              <p className="text-sm text-gray-600 truncate">{product.description}</p>
              <p className="text-xs text-gray-500 mt-1">Allergen: {product.allergens || "N/A"}</p>
              <p className="text-xs text-gray-500 mt-1">
                Stock: <span className={inventoryQuantity === 0 ? "text-red-600 font-semibold" : "font-semibold"}>
                  {inventoryQuantity !== null ? inventoryQuantity : "—"}
                </span>
                {inventoryQuantity !== null && inventoryQuantity > MAX_GLOBAL && (
                  <span className="text-xs text-gray-500 ml-2"> (capped at {MAX_GLOBAL})</span>
                )}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xl font-bold">₱{(product.price || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* BODY (scrollable) */}
          <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDecrease}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xl text-white ${(!isOutOfStock && quantity > 1) ? "bg-[#800000]" : "bg-gray-300 cursor-not-allowed"}`}
                    disabled={isOutOfStock || quantity <= 1}
                    aria-label="Decrease quantity"
                  >−</button>

                  {/* Quantity control */}
                  <div className="min-w-[48px] flex items-center justify-center">
                    {!isEditingQty ? (
                      <button
                        onClick={startEditingQty}
                        className="text-lg px-3 py-1 border rounded-lg w-full bg-white hover:bg-gray-50"
                        title={isOutOfStock ? "Out of stock" : "Click to edit quantity"}
                      >
                        {quantity}
                      </button>
                    ) : (
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editingQtyValue}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d]/g, "");
                          setEditingQtyValue(cleaned);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEditingQty();
                          else if (e.key === "Escape") cancelEditingQty();
                        }}
                        onBlur={() => commitEditingQty()}
                        className="text-center px-2 py-1 border rounded-lg"
                        min="1"
                        max={effectiveMax}
                      />
                    )}
                  </div>

                  <button
                    onClick={handleIncrease}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xl text-white ${(!isOutOfStock && quantity < effectiveMax) ? "bg-[#800000]" : "bg-gray-300 cursor-not-allowed"}`}
                    disabled={isOutOfStock || quantity >= effectiveMax}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <span className="font-medium block mb-2">Size</span>
              <div className="flex space-x-2">
                {(product.sizes || []).map(s => (
                  <button
                    key={s.label}
                    onClick={() => { setSize(s); setDirty(true); }}
                    className={`px-4 py-2 rounded-lg text-sm border ${
                      size.label === s.label
                        ? "bg-gray-200 border-gray-400 font-semibold"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}{s.price > 0 && ` +₱${s.price}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            {product.addons?.length > 0 && (
              <div>
                <span className="font-medium block mb-2">Add-ons</span>
                <div className="flex flex-wrap gap-2">
                  {product.addons.map(a => (
                    <button
                      key={a.label}
                      onClick={() => {
                        setAddons(prev =>
                          prev.some(x => x.label === a.label)
                            ? prev.filter(x => x.label !== a.label)
                            : [...prev, a]
                        );
                        setDirty(true);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm border ${
                        addons.some(x => x.label === a.label)
                          ? "bg-gray-200 border-gray-400 font-semibold"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {a.label}{a.price > 0 && ` +₱${a.price}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <span className="font-medium block mb-2">Special instructions</span>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setDirty(true); }}
                placeholder="e.g. No onions"
                className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring"
                rows={3}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-lg font-semibold px-2">Total</span>
              <span className="text-xl font-bold px-2">₱{lineTotal.toFixed(2)}</span>
            </div>
            <div className="flex space-x-4 mt-3">
              {editingIndex != null ? (
                <>
                  <button
                    onClick={() => { onRemove(editingIndex); onClose(); }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!canSubmit()}
                    className={`flex-1 py-2 rounded-lg font-semibold ${canSubmit() ? "bg-[#800000] text-white hover:font-bold" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                  >
                    {dirty ? "Apply Changes" : "Done"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-[#F6EBCE]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!canSubmit()}
                    className={`flex-1 py-2 rounded-lg font-semibold ${canSubmit() ? "bg-[#800000] text-white hover:font-bold" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                  >
                    Add to Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip portal (rendered into body so it doesn't affect layout/overflow) */}
      <TooltipPortal visible={!!infoMsg}>
        {infoMsg}
      </TooltipPortal>
    </>
  );
}
