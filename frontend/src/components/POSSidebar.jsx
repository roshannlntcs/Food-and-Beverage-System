// src/components/Sidebar.jsx
import React from "react";
import { useCategories } from "../contexts/CategoryContext";

export default function Sidebar({
  activeCategory,
  onCategorySelect,
  clearSearch,
  enabled = true,
}) {
  const { categories } = useCategories();

  return (
    <div className="w-24 bg-[#F6F3EA] py-2 px-1 space-y-1.5 border-r">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;
        const baseClasses =
          "w-full aspect-square flex flex-col items-center justify-center rounded transition-all duration-150";
        const enabledClasses = isActive
          ? "bg-[#F6EBCE] font-semibold shadow"
          : "bg-white shadow-md hover:scale-105";
        const disabledClasses = "bg-white/100 cursor-not-allowed";

        return (
          <button
            key={cat.key}
            onClick={() => {
              if (!enabled) return;
              onCategorySelect && onCategorySelect(cat.key);
              clearSearch && clearSearch();
            }}
            disabled={!enabled}
            aria-disabled={!enabled}
            className={`${baseClasses} ${
              enabled ? enabledClasses : disabledClasses
            }`}
          >
            <img
              src={cat.icon}
              alt={cat.key}
              className="w-8 h-8 mb-1 object-contain"
            />
            <span className="uppercase text-[10px]">{cat.key}</span>
          </button>
        );
      })}

      {!enabled && (
        <div className="mt-2 px-1 text-[11px] text-center text-gray-500">
          Categories are only selectable on the <strong>Menu</strong> or{" "}
          <strong>Items</strong> tab.
        </div>
      )}
    </div>
  );
}
