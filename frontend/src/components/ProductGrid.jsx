// src/components/ProductGrid.jsx
import React from "react";
import images from "../utils/images";

export default function ProductGrid({ products, onSelect }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: "12px" }}>
      {products.map((prod, i) => (
        <div
          key={i}
          onClick={() => onSelect(prod)}
          className="bg-white p-4 rounded-lg shadow flex flex-col cursor-pointer hover:scale-105 transition-transform duration-150"
        >
          <img
            src={images[prod.image] || images["react.svg"]}
            alt={prod.name}
            className="w-full h-[155px] object-cover rounded mb-2"
          />
          <div className="font-semibold text-lg truncate">{prod.name}</div>
          <div className="text-m">₱{prod.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
