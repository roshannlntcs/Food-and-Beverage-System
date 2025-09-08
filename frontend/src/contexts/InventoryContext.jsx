// src/contexts/InventoryContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { allItemsFlat } from "../utils/data";

const STORAGE_KEY = "app_inventory_v1";
const LAST_RESET_KEY = "inventory_last_orders_reset";
const LOW_STOCK_THRESHOLD = 10;
const DEFAULT_QUANTITY = 100;

const InventoryContext = createContext(null);

/**
 * InventoryProvider
 * - Loads inventory from localStorage or falls back to allItemsFlat
 * - Ensures each item has: id, quantity (default 100), ordersToday, statusManual
 * - Persists updates to localStorage
 * - Exposes updateItem, addItem, applyTransaction, computeAutoStatus, getEffectiveStatus
 */
export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // parse existing data and migrate any non-positive / missing quantities to DEFAULT_QUANTITY
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let migrated = false;
          const normalized = parsed.map(item => {
            const qty = (typeof item.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0)
              ? item.quantity
              : DEFAULT_QUANTITY; // migrate 0 / negative / missing -> default 100
            if (qty !== item.quantity) migrated = true;
            return {
              id: item.id || (item.name || "").replace(/\s+/g, "_").toLowerCase(),
              name: item.name,
              price: item.price ?? 0,
              category: item.category ?? "",
              quantity: qty,
              status: item.status || (qty <= 0 ? "Unavailable" : qty <= LOW_STOCK_THRESHOLD ? "Low Stock" : "Available"),
              statusManual: !!item.statusManual,
              ordersToday: item.ordersToday || 0,
              allergens: item.allergens || "",
              addons: item.addons || [],
              description: item.description || "",
              sizes: item.sizes || []
            };
          });

          // if we migrated any quantities, persist a backup and overwrite stored inventory
          if (migrated) {
            try {
              // save a backup of the previous raw payload (timestamped key)
              const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
              localStorage.setItem(backupKey, raw);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            } catch (e) {
              console.error("Failed to persist inventory migration/backup:", e);
            }
          }
          return normalized;
        }
      }
    } catch (e) {
      // ignore parse errors and fallback
      console.error("Inventory parse error, falling back to defaults:", e);
    }

    // fallback mapping from allItemsFlat (set default quantity = 100 when quantity not positive)
    return allItemsFlat.map(item => {
      const qty = (typeof item.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0)
        ? item.quantity
        : DEFAULT_QUANTITY;
      return {
        id: item.id || (item.name || "").replace(/\s+/g, "_").toLowerCase(),
        name: item.name,
        price: item.price ?? 0,
        category: item.category ?? "",
        quantity: qty,
        status: item.status || (qty <= 0 ? "Unavailable" : qty <= LOW_STOCK_THRESHOLD ? "Low Stock" : "Available"),
        statusManual: !!item.statusManual,
        ordersToday: item.ordersToday || 0,
        allergens: item.allergens || "",
        addons: item.addons || [],
        description: item.description || "",
        sizes: item.sizes || []
      };
    });
  });

  // persist inventory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.error("Inventory persist error:", e);
    }
  }, [inventory]);

  // compute automatic status by numeric quantity
  const computeAutoStatus = useCallback((quantity) => {
    const q = Number(quantity || 0);
    if (q <= 0) return "Unavailable";
    if (q <= LOW_STOCK_THRESHOLD) return "Low Stock";
    return "Available";
  }, []);

  const getEffectiveStatus = useCallback((item) => {
    if (!item) return "Unavailable";
    if (item.statusManual) return item.status;
    return computeAutoStatus(item.quantity);
  }, [computeAutoStatus]);

  // update item by id with patch object (merge)
  const updateItem = useCallback((id, patch = {}) => {
    setInventory(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  }, []);

  // addItem convenience (creates id if missing) — default quantity DEFAULT_QUANTITY if not provided / non-positive
  const addItem = useCallback((item) => {
    const id = item.id || (item.name || "").replace(/\s+/g, "_").toLowerCase();
    const qty = (typeof item.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0)
      ? item.quantity
      : DEFAULT_QUANTITY;
    const normalized = {
      id,
      name: item.name,
      price: item.price ?? 0,
      category: item.category ?? "",
      quantity: qty,
      status: item.status || (qty <= 0 ? "Unavailable" : qty <= LOW_STOCK_THRESHOLD ? "Low Stock" : "Available"),
      statusManual: !!item.statusManual,
      ordersToday: item.ordersToday || 0,
      allergens: item.allergens || "",
      addons: item.addons || [],
      description: item.description || "",
      sizes: item.sizes || []
    };
    setInventory(prev => [...prev, normalized]);
  }, []);

  /**
   * applyTransaction(orderItems)
   * orderItems: [{ id, qty }] or [{ name, qty }]
   * Decrements stock, increments ordersToday, recomputes status if not manual
   */
  const applyTransaction = useCallback((orderItems = []) => {
    if (!Array.isArray(orderItems) || orderItems.length === 0) return;

    setInventory(prev => {
      // create a shallow clone and map updates
      const result = prev.map(it => {
        const found = orderItems.find(o => (o.id && o.id === it.id) || (o.name && o.name === it.name));
        if (!found) return it;
        const qtyOrdered = Math.max(0, Number(found.qty || found.quantity || 1));
        const newQty = Math.max(0, Number(it.quantity || 0) - qtyOrdered);
        const newOrdersToday = (Number(it.ordersToday || 0) + qtyOrdered);
        const newStatus = it.statusManual ? it.status : computeAutoStatus(newQty);
        return { ...it, quantity: newQty, ordersToday: newOrdersToday, status: newStatus };
      });
      return result;
    });
  }, [computeAutoStatus]);

  // daily reset of ordersToday (once per calendar day)
  useEffect(() => {
    const resetIfNeeded = () => {
      try {
        const last = localStorage.getItem(LAST_RESET_KEY);
        const today = new Date().toISOString().slice(0, 10);
        if (last !== today) {
          setInventory(prev => prev.map(it => ({ ...it, ordersToday: 0 })));
          localStorage.setItem(LAST_RESET_KEY, today);
        }
      } catch (e) {
        console.error("Error in daily reset:", e);
      }
    };

    resetIfNeeded();
    const timer = setInterval(resetIfNeeded, 1000 * 60 * 60); // hourly guard
    return () => clearInterval(timer);
  }, []);

  // cross-tab sync: if localStorage changes in another tab, reload inventory
  useEffect(() => {
    const onStorage = (ev) => {
      if (ev.key === STORAGE_KEY && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          if (Array.isArray(parsed)) {
            setInventory(parsed);
          }
        } catch (e) {
          // ignore invalid payload
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = {
    inventory,
    setInventory,
    updateItem,
    addItem,
    applyTransaction,
    computeAutoStatus,
    getEffectiveStatus
  };

  return <InventoryContext.Provider value={api}>{children}</InventoryContext.Provider>;
}

// named hook — matches imports across your app
export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used inside an InventoryProvider");
  }
  return ctx;
};

export default InventoryContext;
