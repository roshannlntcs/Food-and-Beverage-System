// src/components/ProductGrid.jsx
import React from "react";
import images, { getProductImg } from "../utils/images";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

export default function ProductGrid({ products, onSelect }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: "12px" }}
    >
      {products.map((prod, index) => {
        const key =
          prod?.backendId ||
          prod?.id ||
          `${(prod?.name || "item").toLowerCase()}-${index}`;

        return (
        <div
          key={key}
          onClick={() => onSelect(prod)}
          className="bg-white p-4 rounded-lg shadow flex flex-col cursor-pointer hover:scale-105 transition-transform duration-150"
        >
          {/* Fixed aspect container + object-cover makes every card uniform */}
          <div className="w-full h-[155px] rounded mb-2 overflow-hidden bg-gray-50">
            <img
              src={getProductImg(prod)}
              alt={prod.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = images.placeholder;
              }}
            />
          </div>

          <div className="font-semibold text-lg truncate">{prod.name}</div>
          <div className="text-sm font-medium text-gray-700">
            {formatCurrency(prod.price)}
          </div>
        </div>
      );
      })}
    </div>
  );
}
