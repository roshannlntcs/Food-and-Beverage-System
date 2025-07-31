import React from "react";
import images from "../utils/images";

export default function ItemsTab({
  placeholders,
  activeCategory,
  searchTerm,
  itemAvailability,
  setItemAvailability
}) {
  const filteredItems = Object.entries(placeholders)
    .flatMap(([cat, list]) =>
      activeCategory === "All Menu" ? list : list.filter(i => cat === activeCategory)
    )
    .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 pt-2 px-6 pb-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Item Availability</h2>
      <div className="flex-1 overflow-y-auto pr-2">
        <div
          className="grid content-start auto-rows-min"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            gap: "12px",
          }}
        >
          {filteredItems.map((item, i) => (
            <div
              key={i}
              className="bg-white p-2 rounded-lg shadow flex flex-col justify-between hover:scale-105 transition-transform duration-150 cursor-pointer"
            >
              <img
                src={images[item.image] || images["react.svg"]}
                alt={item.name}
                className="w-full h-[155px] object-cover rounded mb-2"
              />
              <div className="font-semibold text-base mb-2 text-center">{item.name}</div>
              <button
                onClick={() =>
                  setItemAvailability(prev => ({
                    ...prev,
                    [item.name]: !prev[item.name],
                  }))
                }
                className={`py-2 rounded-lg text-sm font-semibold ${
                  itemAvailability[item.name]
                    ? "bg-yellow-300 text-black"
                    : "bg-red-800 text-white"
                }`}
              >
                {itemAvailability[item.name] ? "Available" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
