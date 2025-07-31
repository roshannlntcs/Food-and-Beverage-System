// src/components/modals/ItemDetailModal.jsx
import React, { useState, useEffect } from "react";
import images from "../../utils/images";

export default function ItemDetailModal({
  isOpen,
  product,              // the modalProduct object from parent
  editingIndex,         // null when adding, or an integer when editing
  onClose,              // () => void
  onAdd,                // (itemData) => void
  onApply,              // (itemData, index) => void
  onRemove              // (index) => void
}) {
  // 1️⃣ Hooks always at top
  const [quantity, setQuantity]     = useState(1);
  const [size, setSize]             = useState({ label: "", price: 0 });
  const [addons, setAddons]         = useState([]);
  const [notes, setNotes]           = useState("");
  const [dirty, setDirty]           = useState(false);

  // 2️⃣ When modal opens or product changes, seed state
  useEffect(() => {
    if (!isOpen || !product) return;
    setQuantity(product.quantity  ?? 1);
    setSize(product.size          ?? product.sizes?.[0] ?? { label: "", price: 0 });
    setAddons(product.selectedAddons ?? []);
    setNotes(product.notes       ?? "");
    setDirty(false);
  }, [isOpen, product]);

  // 3️⃣ Never render until after Hooks
  if (!isOpen || !product) return null;

  // 4️⃣ Compute line total
  const lineTotal =
    (product.price + (size.price || 0)) * quantity +
    addons.reduce((sum, a) => sum + a.price, 0) * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
      <div className="bg-white rounded-2xl shadow-xl w-[576px]">
        {/* HEADER */}
        <div className="bg-gray-100 rounded-t-2xl p-6 flex">
          <img
            src={images[product.image]}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg mr-4"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600 truncate">{product.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Allergen: {product.allergens || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold">₱{product.price.toFixed(2)}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setQuantity(q => Math.max(1, q - 1)); setDirty(true); }}
                className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-xl text-white"
              >−</button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() => { setQuantity(q => q + 1); setDirty(true); }}
                className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-xl text-white"
              >+</button>
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

          {/* Add‑ons */}
          {product.addons?.length > 0 && (
            <div>
              <span className="font-medium block mb-2">Add‑ons</span>
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
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring"
              rows={3}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 rounded-b-2xl p-4">
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
                  onClick={() => { onApply({ quantity, size, addons, notes }, editingIndex); onClose(); }}
                  className="flex-1 py-2 bg-[#800000] text-white rounded-lg font-semibold hover:font-bold"
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
                  onClick={() => { onAdd({ quantity, size, addons, notes }); onClose(); }}
                  className="flex-1 py-2 bg-[#800000] text-white rounded-lg font-semibold hover:font-bold"
                >
                  Add to Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
