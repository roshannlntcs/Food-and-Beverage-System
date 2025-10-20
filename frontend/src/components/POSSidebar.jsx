// src/components/Sidebar.jsx
import React from "react";
import { useCategories } from "../contexts/CategoryContext";
import { getImage } from "../utils/images";

export default function Sidebar({
  activeCategory,
  onCategorySelect,
  clearSearch,
  enabled = true,
}) {
  const { categories } = useCategories();
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="w-24 bg-[#F6F3EA] py-2 px-1 space-y-1.5 border-r overflow-y-auto no-scrollbar max-h-[calc(100vh-80px)]">
      {safeCategories
        .filter((cat) => cat && cat.key)
        .map((cat) => {
          const isActive = activeCategory === cat.key;
          const baseClasses =
            "w-full aspect-square flex flex-col items-center justify-center rounded transition-all duration-150";
          const enabledClasses = isActive
            ? "bg-[#F6EBCE] font-semibold shadow"
            : "bg-white shadow-md hover:scale-105";
          const disabledClasses = "bg-white/100 cursor-not-allowed";
          const iconSrc = getImage(
            typeof cat.icon === "string" && cat.icon.length ? cat.icon : cat.iconUrl || "",
            cat.key
          );

          return (
            <button
              key={cat.key}
              onClick={() => {
                if (!enabled) return;
                onCategorySelect && onCategorySelect(isActive ? null : cat.key);
                clearSearch && clearSearch();
              }}
              disabled={!enabled}
              aria-disabled={!enabled}
              className={`${baseClasses} ${
                enabled ? enabledClasses : disabledClasses
              }`}
              title={cat.key}
            >
              <img
                src={iconSrc}
                alt={cat.key}
                className="w-8 h-8 mb-1 object-contain"
              />
              <span className="uppercase text-[10px] text-center px-1 truncate w-full">
                {cat.key}
              </span>
            </button>
          );
        })}

      {!enabled && (
        <div className="mt-2 px-1 text-[11px] text-center text-gray-500">
          Categories are only selectable on the <strong>Menu</strong> or{" "}
          <strong>Status</strong> tab.
        </div>
      )}
    </div>
  );
}
