// frontend/src/contexts/InventoryContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/client';
import { useCategories } from './CategoryContext';
import { canonicalCategoryName } from '../utils/categories';

const DEFAULT_STOCK = 100;

const InventoryCtx = createContext(null);
export const useInventory = () => useContext(InventoryCtx);

// map server product -> client product
function normalize(p) {
  if (!p) return null;
  const categoryName =
    p.category?.name || p.categoryName || p.category || '';
  const canonicalCategory = canonicalCategoryName(categoryName);

  const normalizedQuantity = Number.isFinite(p.quantity)
    ? Number(p.quantity)
    : DEFAULT_STOCK;

  return {
    id: p.id,
    name: p.name,
    price: Number(p.price ?? 0),
    categoryId: p.categoryId ?? null,
    category: canonicalCategory || '',
    quantity: normalizedQuantity,
    status: p.status || 'Available',
    allergens: p.allergens || '',
    sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? [p.sizes] : []),
    addons: Array.isArray(p.addons) ? p.addons : (p.addons ? [p.addons] : []),
    description: p.description || '',
    image: p.imageUrl || p.image || '',
    active: p.active ?? true,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export default function InventoryProvider({ children }) {
  const { getIdByName, addCategory } = useCategories() || {};
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api('/products', 'GET');
      setInventory((list || []).map(normalize));
      setError(null);
    } catch (err) {
      console.error('Inventory refresh failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (input) => {
    const canonicalCategory = canonicalCategoryName(input.category);
    let categoryId = input.categoryId || getIdByName?.(canonicalCategory);
    if (!categoryId && addCategory && input.category) {
      const c = await addCategory(canonicalCategory);
      categoryId = c?.id || null;
    }

    const payload = {
      id: input.id,
      name: input.name,
      price: Number(input.price ?? 0),
      imageUrl: input.image || '',
      categoryId,
      quantity: Number.isFinite(Number(input.quantity))
        ? Number(input.quantity)
        : DEFAULT_STOCK,
      status: input.status || 'Available',
      allergens: input.allergens || '',
      sizes: Array.isArray(input.sizes) ? input.sizes : [],
      addons: Array.isArray(input.addons) ? input.addons : [],
      description: input.description || '',
      active: true,
      category: canonicalCategory || undefined,
    };

    const created = await api('/products', 'POST', payload);
    const norm = normalize(created);
    setInventory((prev) => {
      const i = prev.findIndex((it) => it.id === norm.id);
      if (i >= 0) {
        const copy = prev.slice();
        copy[i] = norm;
        return copy;
      }
      return [...prev, norm];
    });
    return norm;
  }, [addCategory, getIdByName]);

  const updateItem = useCallback(async (id, patch) => {
    const canonicalCategory = canonicalCategoryName(patch.category);
    let categoryId = patch.categoryId;
    if (!categoryId && canonicalCategory && getIdByName) {
      categoryId = getIdByName(canonicalCategory);
      if (!categoryId && addCategory) {
        const c = await addCategory(canonicalCategory);
        categoryId = c?.id || null;
      }
    }

    const hasQuantity = patch.quantity !== undefined && patch.quantity !== null;

    const payload = {
      name: patch.name,
      price: Number(patch.price ?? 0),
      imageUrl: patch.image || '',
      categoryId,
      category: canonicalCategory || undefined,
      status: patch.status || 'Available',
      allergens: patch.allergens || '',
      sizes: Array.isArray(patch.sizes) ? patch.sizes : [],
      addons: Array.isArray(patch.addons) ? patch.addons : [],
      description: patch.description || '',
      active: patch.active ?? true,
    };

    if (hasQuantity) {
      payload.quantity = Number.isFinite(Number(patch.quantity))
        ? Number(patch.quantity)
        : DEFAULT_STOCK;
    }

    const updated = await api(`/products/${id}`, 'PUT', payload);
    const norm = normalize(updated);
    setInventory((prev) => prev.map((it) => (it.id === id ? norm : it)));
    return norm;
  }, [addCategory, getIdByName]);

  const removeItem = useCallback(async (id) => {
    if (!id) return;
    try {
      await api(`/products/${id}`, 'DELETE');
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Inventory deletion failed:', error);
      throw error;
    }
  }, []);

  const getEffectiveStatus = useCallback((item) => {
    const qty = Number(item?.quantity ?? 0);
    if (qty <= 0) return 'Unavailable';
    if (qty <= 10) return 'Low Stock';
    return 'Available';
  }, []);

  const applyTransaction = useCallback((items = []) => {
    if (!Array.isArray(items) || !items.length) return;

    setInventory((prev) => {
      if (!prev.length) return prev;

      const next = prev.map((product) => {
        const matchQty = items.reduce((sum, entry) => {
          if (!entry) return sum;
          const matchesId =
            entry.id && String(entry.id).toLowerCase() === String(product.id).toLowerCase();
          const matchesBackend =
            entry.backendId && String(entry.backendId).toLowerCase() === String(product.id).toLowerCase();
          const matchesProductId =
            entry.productId && String(entry.productId).toLowerCase() === String(product.id).toLowerCase();
          const matchesName =
            entry.name && String(entry.name).toLowerCase() === String(product.name).toLowerCase();
          if (!matchesId && !matchesBackend && !matchesProductId && !matchesName) return sum;
          const qty = Number(entry.qty ?? entry.quantity ?? 0);
          return sum + (Number.isFinite(qty) ? qty : 0);
        }, 0);

        if (!matchQty) return product;

        const currentQty = Number(product.quantity ?? 0);
        const newQty = Math.max(0, currentQty - matchQty);
        const soldToday = Number(product.ordersToday ?? 0) + matchQty;

        return {
          ...product,
          quantity: newQty,
          ordersToday: soldToday,
        };
      });

      return next;
    });
  }, []);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const value = useMemo(() => ({
    inventory,
    refresh: fetchAll,
    addItem: createItem,
    updateItem,
    removeItem,
    getEffectiveStatus,
    applyTransaction,
    loading,
    error,
  }), [inventory, fetchAll, createItem, updateItem, removeItem, getEffectiveStatus, applyTransaction, loading, error]);

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>;
}
