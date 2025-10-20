import React, { useMemo } from "react";
import images, { getImage } from "../utils/images";
import { useInventory } from "../contexts/InventoryContext";
import { canonicalCategoryName } from "../utils/categories";

export default function ItemsTab({
  products = [],
  activeCategory,
  searchTerm = "",
}) {
  const { inventory = [], getEffectiveStatus } = useInventory();

  const normalizedCategory = useMemo(() => {
    if (!activeCategory || activeCategory === "All Menu") return null;
    return canonicalCategoryName(activeCategory).toLowerCase();
  }, [activeCategory]);

  const inventoryLookup = useMemo(() => {
    const map = new Map();
    (inventory || []).forEach((item) => {
      if (!item) return;
      if (item.id) {
        map.set(String(item.id).toLowerCase(), item);
      }
      if (item.name) {
        map.set(`name|${String(item.name).toLowerCase()}`, item);
      }
    });
    return map;
  }, [inventory]);

  const filtered = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();

    const buildKey = (item) => {
      if (!item) return null;
      if (item.backendId) {
        return `backend:${String(item.backendId).toLowerCase()}`;
      }
      if (item.id) {
        return `id:${String(item.id).toLowerCase()}`;
      }
      if (item.name) {
        const categoryLabel = canonicalCategoryName(item.category || "").toLowerCase();
        return `name:${String(item.name).toLowerCase()}|${categoryLabel}`;
      }
      return null;
    };

    const mergeEntries = (current, incoming) => {
      if (!current) return incoming;
      if (!incoming) return current;

      const primary = incoming.hasBackend ? incoming : current;
      const secondary = primary === incoming ? current : incoming;

      const imageCandidates = [
        primary.image,
        primary.imageUrl,
        secondary?.image,
        secondary?.imageUrl,
      ].filter(Boolean);

      return {
        ...secondary,
        ...primary,
        id: primary.id || secondary?.id,
        backendId:
          primary.backendId ||
          secondary?.backendId ||
          primary.id ||
          secondary?.id ||
          null,
        hasBackend: Boolean(primary.hasBackend || secondary?.hasBackend),
        source: primary.source || secondary?.source,
        name: primary.name || secondary?.name,
        category: primary.category || secondary?.category || "",
        price: Number.isFinite(Number(primary.price))
          ? Number(primary.price)
          : Number(secondary?.price || 0),
        image: imageCandidates[0] || "",
        imageUrl: imageCandidates[0] || "",
        sizes:
          (Array.isArray(primary.sizes) && primary.sizes.length
            ? primary.sizes
            : Array.isArray(secondary?.sizes)
            ? secondary.sizes
            : []) || [],
        addons:
          (Array.isArray(primary.addons) && primary.addons.length
            ? primary.addons
            : Array.isArray(secondary?.addons)
            ? secondary.addons
            : []) || [],
      };
    };

    const byKey = new Map();

    (products || []).forEach((item) => {
      if (!item || !item.name) return;

      if (normalizedCategory) {
        const categoryLabel = canonicalCategoryName(item.category).toLowerCase();
        if (!categoryLabel || categoryLabel !== normalizedCategory) {
          return;
        }
      }
      if (term && !String(item.name).toLowerCase().includes(term)) {
        return;
      }

      const key = buildKey(item);
      if (!key) return;
      const existing = byKey.get(key);
      const merged = mergeEntries(existing, item);
      byKey.set(key, merged);
    });

    return Array.from(byKey.values());
  }, [products, normalizedCategory, searchTerm]);

  const resolveInventory = (item) => {
    if (!item) return null;
    const byId = item.id
      ? inventoryLookup.get(String(item.id).toLowerCase())
      : null;
    if (byId) return byId;
    return inventoryLookup.get(`name|${String(item.name || "").toLowerCase()}`);
  };

  const getProductImg = (item) => {
    if (!item) return images.placeholder;
    const candidates = [
      item.image,
      item.imageName,
      item.id,
      (item.name || "").toLowerCase().replace(/\s+/g, "_"),
      (item.name || "").toLowerCase().replace(/\s+/g, "-"),
      item.name || "",
    ];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const src = getImage(candidate);
      if (src) return src;
    }
    return images.placeholder;
  };

  return (
    <div className="flex-1 pt-2 px-6 pb-6 flex flex-col overflow-y-auto no-scrollbar">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))",
          gap: "12px",
        }}
      >
        {filtered.map((item, index) => {
          const itemKey =
            item.backendId ||
            item.id ||
            `${(item.name || "item").toLowerCase()}-${canonicalCategoryName(item.category || "")}`;
          const inv = resolveInventory(item);
          const status = inv
            ? getEffectiveStatus(inv)
            : item.hasBackend === false
            ? "Unavailable"
            : "Available";
          const isAvailable = status === "Available";
          const isLow = status === "Low Stock";
          const quantity = inv ? Number(inv.quantity ?? 0) : 0;
          const ordersToday = inv ? Number(inv.ordersToday || 0) : 0;

          return (
            <div
              key={itemKey}
              className="bg-white p-4 rounded-lg shadow flex flex-col justify-between hover:scale-105 transition-transform duration-150"
            >
              <div className="w-full h-[155px] rounded mb-2 overflow-hidden bg-gray-50">
                <img
                  src={getProductImg(inv || item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = images.placeholder;
                  }}
                />
              </div>

              <div className="font-semibold text-base mb-2 text-center">
                {item.name}
              </div>

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

              <div className="text-xs text-center mt-2 text-gray-600 space-y-1">
                <div>
                  {inv
                    ? `${quantity} pcs left`
                    : item.hasBackend === false
                    ? "Not in stock"
                    : "—"}
                </div>
                <div>
                  {ordersToday > 0
                    ? `Ordered today: ${ordersToday}`
                    : "No orders yet"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


