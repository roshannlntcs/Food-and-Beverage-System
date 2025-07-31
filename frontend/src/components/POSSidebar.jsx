// src/components/Sidebar.jsx
import React from "react";

import allMenuIcon    from "../assets/all-menu.png";
import mainDishIcon   from "../assets/main-dish.png";
import appetizersIcon from "../assets/appetizers.png";
import sideDishIcon   from "../assets/side-dish.png";
import soupIcon       from "../assets/soup.png";
import dessertIcon    from "../assets/dessert.png";
import drinksIcon     from "../assets/drinks.png";

// Manual list, including "All Menu"
const categoriesWithIcons = [
  { key: "All Menu", icon: allMenuIcon },
  { key: "Main Dish", icon: mainDishIcon },
  { key: "Appetizers", icon: appetizersIcon },
  { key: "Side Dish", icon: sideDishIcon },
  { key: "Soup", icon: soupIcon },
  { key: "Desserts", icon: dessertIcon },
  { key: "Drinks", icon: drinksIcon }
];

export default function Sidebar({
  activeCategory,
  onCategorySelect,
  clearSearch
}) {
  return (
    <div className="w-24 bg-[#F6F3EA] py-0.5 px-1 space-y-1.5 border-r">
      {categoriesWithIcons.map((cat) => (
        <button
          key={cat.key}
          onClick={() => {
            onCategorySelect(cat.key);
            clearSearch();
          }}
          className={`w-full aspect-square flex flex-col items-center justify-center rounded shadow ${
            activeCategory === cat.key
              ? "bg-[#F6EBCE] font-semibold"
              : "bg-white hover:scale-105 shadow-md transition-shadow duration-150"
          }`}
        >
          <img
            src={cat.icon}
            alt={cat.key}
            className="w-8 h-8 mb-1 object-contain"
          />
          <span className="uppercase text-[10px]">{cat.key}</span>
        </button>
      ))}
    </div>
  );
}
