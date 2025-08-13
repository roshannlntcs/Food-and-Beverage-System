// src/components/TabsPanel.jsx
import React from "react";
import images from "../utils/images";

const tabs = [
  { key: "Menu", icon: "menu.png" },
  { key: "KVS", icon: "orders.png" },
  { key: "Logs", icon: "transactions.png" },
  { key: "Items", icon: "items.png" },
  { key: "Discount", icon: "discount.png" },
];

export default function TabsPanel({ activeTab, onTabSelect }) {
  return (
    <div className="bg-[#F6F3EA] border-b px-4 mt-2 pb-2">
      <div
        className="grid gap-x-6"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabSelect(tab.key)}
            className={`w-full h-[55px] flex items-center justify-center space-x-2 rounded uppercase shadow ${
              activeTab === tab.key
                ? "bg-[#F6EBCE] font-bold"
                : "bg-white hover:scale-105 shadow-md transition-shadow duration-150"
            }`}
          >
            <img
              src={images[tab.icon]}
              alt={tab.key}
              className="w-8 h-8"
            />
            <span>{tab.key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}