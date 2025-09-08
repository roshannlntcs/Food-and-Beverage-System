// src/components/ItemsTab.jsx
import React from "react";
import images from "../utils/images";
import { useInventory } from "../contexts/InventoryContext";

export default function ItemsTab({
  placeholders,
  activeCategory,
  searchTerm,
}) {
  const { inventory = [], getEffectiveStatus } = useInventory();

  const filteredItems = Object.entries(placeholders)
    .flatMap(([cat, list]) => {
      if (!activeCategory || activeCategory === "All Menu") {
        return list; // show all items if no category or "All Menu"
      }
      return list.filter(i => cat === activeCategory);
    })
    .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // helper to find inventory item by name
  const findInv = (name) =>
    inventory.find(
      it => String(it.name).toLowerCase() === String(name).toLowerCase()
    );

  return (
    <div className="flex-1 pt-2 px-6 pb-6 flex flex-col overflow-y-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))",
          gap: "12px",
        }}
      >
        {filteredItems.map((item, i) => {
          const inv = findInv(item.name);
          const status = inv ? getEffectiveStatus(inv) : "Available";
          const isAvailable = status === "Available";
          const isLow = status === "Low Stock";

          return (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow flex flex-col justify-between hover:scale-105 transition-transform duration-150"
            >
              <img
                src={images[item.image] || images["react.svg"]}
                alt={item.name}
                className="w-full h-[155px] object-cover rounded mb-2"
              />
              <div className="font-semibold text-base mb-2 text-center">
                {item.name}
              </div>

              {/* Read-only status badge */}
              <div
                aria-hidden
                className={`py-2 rounded-full text-sm font-semibold text-center ${
                  isAvailable
                    ? "bg-yellow-300 text-black"
                    : isLow
                    ? "bg-orange-400 text-black"
                    : "bg-red-800 text-white"
                }`}
              >
                {status}
              </div>

              {/* stock + orders summary */}
              <div className="text-xs text-center mt-2 text-gray-600 space-y-1">
                <div>{inv ? `${inv.quantity} pcs left` : "—"}</div>
                <div>
                  {inv ? `Ordered today: ${inv.ordersToday || 0}` : "No orders"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
