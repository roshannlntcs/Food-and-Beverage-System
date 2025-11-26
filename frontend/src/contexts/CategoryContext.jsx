// frontend/src/contexts/CategoryContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/client';
import mainDishIcon from '../assets/main-dish.png';
import appetizersIcon from '../assets/appetizers.png';
import sideDishIcon from '../assets/side-dish.png';
import soupIcon from '../assets/soup.png';
import dessertIcon from '../assets/dessert.png';
import drinksIcon from '../assets/drinks.png';
import { placeholders } from '../utils/data';
import {
  canonicalCategoryName,
  CATEGORY_ORDER,
} from '../utils/categories';
import { getImage } from '../utils/images';

const CategoryCtx = createContext(null);
export const useCategories = () => useContext(CategoryCtx);

const CATEGORY_ICON_MAP = {
  'Main Dish': mainDishIcon,
  Appetizers: appetizersIcon,
  'Side Dish': sideDishIcon,
  Soup: soupIcon,
  Dessert: dessertIcon,
  Drinks: drinksIcon,
};

const DEFAULT_ICON = getImage('placeholder.png');

const resolveCategoryIcon = (iconCandidate, canonical) => {
  if (typeof iconCandidate === 'string' && iconCandidate.trim()) {
    const resolved = getImage(iconCandidate, canonical);
    if (resolved) return resolved;
  }
  const fallback = CATEGORY_ICON_MAP[canonical];
  if (fallback) return fallback;
  return DEFAULT_ICON;
};

// normalizes a backend category to the shape the app has been using
function normalizeCategory(cat) {
  if (!cat) return null;
  const canonical = canonicalCategoryName(cat.name || cat.key || '');
  if (!canonical || canonical === 'All Menu') return null;
  const iconSource = cat.iconUrl || cat.icon || null;

  return {
    id: cat.id ?? null,
    key: canonical,
    name: canonical,
    active: cat.active ?? true,
    icon: resolveCategoryIcon(iconSource, canonical),
    iconUrl: iconSource || null,
  };
}

const FALLBACK_CATEGORIES = CATEGORY_ORDER.map((name) => {
  const bucket = placeholders?.[name];
  if (!bucket || bucket.length === 0) return null;
  return normalizeCategory({
    id: null,
    name,
    icon: CATEGORY_ICON_MAP[name] || null,
    iconUrl: CATEGORY_ICON_MAP[name] || null,
    active: true,
  });
}).filter(Boolean);

const orderCategories = (list) => {
  const map = new Map();
  (list || []).forEach((cat) => {
    const normalized = normalizeCategory(cat);
    if (!normalized) return;
    map.set(normalized.name.toLowerCase(), normalized);
  });

  const ordered = [];
  CATEGORY_ORDER.forEach((name) => {
    const existing = map.get(name.toLowerCase());
    if (existing) {
      ordered.push(existing);
      map.delete(name.toLowerCase());
    }
  });

  const remaining = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return ordered.concat(remaining);
};

export default function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(() =>
    orderCategories(FALLBACK_CATEGORIES)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api('/categories', 'GET');
      const normalized = (list || []).map(normalizeCategory).filter(Boolean);
      const next = orderCategories(normalized);
      setCategories(next);
      setError(null);
    } catch (err) {
      console.error('Category refresh failed:', err);
      setError(err);
      setCategories((prev) =>
        prev.length ? prev : orderCategories(FALLBACK_CATEGORIES)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(
    async (input, fallbackIcon) => {
      const rawName =
        typeof input === 'string'
          ? input
          : input?.key || input?.name || input?.label || '';
      const name = canonicalCategoryName(rawName);
      if (!name) return null;

      const iconUrl =
        (typeof input === 'object' && input
          ? input.icon || input.iconUrl
          : null) || fallbackIcon || null;

      const existing = categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (existing?.id) return existing;

      try {
        const created = await api('/categories', 'POST', {
          name,
          iconUrl: iconUrl || undefined,
        });
        const norm = normalizeCategory(created);
        if (!norm) return null;
        setCategories((prev) => {
          const deduped = prev.filter(
            (c) => c.name.toLowerCase() !== norm.name.toLowerCase()
          );
          return orderCategories([...deduped, norm]);
        });
        return norm;
      } catch (err) {
        console.error('Category creation failed:', err);
        const local = normalizeCategory({
          id: null,
          name,
          active: true,
          icon: iconUrl || CATEGORY_ICON_MAP[name] || null,
          iconUrl: iconUrl || null,
        });
        if (!local) return null;
        setCategories((prev) => {
          const deduped = prev.filter(
            (c) => c.name.toLowerCase() !== name.toLowerCase()
          );
          return orderCategories([...deduped, local]);
        });
        return local;
      }
    },
    [categories]
  );

  const updateCategory = useCallback(
    async (id, input = {}) => {
      if (!id) return null;
      const rawName =
        typeof input === 'string'
          ? input
          : input?.key || input?.name || input?.label || null;
      const nextName = rawName ? canonicalCategoryName(rawName) : null;
      const payload = {};
      if (nextName) payload.name = nextName;
      if (Object.prototype.hasOwnProperty.call(input, 'icon')) {
        payload.iconUrl = input.icon || null;
      } else if (Object.prototype.hasOwnProperty.call(input, 'iconUrl')) {
        payload.iconUrl = input.iconUrl || null;
      }
      if (!Object.keys(payload).length) return null;

      try {
        const updated = await api(`/categories/${id}`, 'PUT', payload);
        const norm = normalizeCategory(updated);
        if (!norm) return null;
        setCategories((prev) => {
          const filtered = prev.filter((cat) => cat.id !== id);
          const deduped = filtered.filter(
            (cat) => cat.name.toLowerCase() !== norm.name.toLowerCase()
          );
          return orderCategories([...deduped, norm]);
        });
        return norm;
      } catch (err) {
        console.error('Category update failed:', err);
        throw err;
      }
    },
    []
  );

  const removeCategory = useCallback(async (id, options = {}) => {
    if (!id) return false;
    try {
      const payload = {};
      if (options.behavior) payload.behavior = options.behavior;
      if (options.fallbackName) payload.fallbackName = options.fallbackName;
      const hasPayload = Object.keys(payload).length > 0;
      await api(
        `/categories/${id}`,
        'DELETE',
        hasPayload ? payload : undefined
      );
      setCategories((prev) =>
        prev.filter((category) => category.id !== id)
      );
      return true;
    } catch (err) {
      console.error('Category removal failed:', err);
      throw err;
    }
  }, []);

  const getIdByName = useCallback((name) => {
    const canonical = canonicalCategoryName(name);
    if (!canonical) return null;
    const hit = categories.find(
      (c) => c.name.toLowerCase() === canonical.toLowerCase()
    );
    return hit?.id || null;
  }, [categories]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const value = useMemo(() => ({
    categories,
    refresh,
    addCategory,
    updateCategory,
    removeCategory,
    getIdByName,
    loading,
    error,
  }), [categories, refresh, addCategory, updateCategory, removeCategory, getIdByName, loading, error]);

  return <CategoryCtx.Provider value={value}>{children}</CategoryCtx.Provider>;
}
