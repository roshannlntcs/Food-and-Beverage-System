// frontend/src/utils/categories.js
// Shared helpers for normalising category labels across POS/Admin.

export const CATEGORY_ORDER = [
  "Main Dish",
  "Appetizers",
  "Side Dish",
  "Soup",
  "Dessert",
  "Drinks",
];

const CATEGORY_ALIASES = {
  "all": "All Menu",
  "all menu": "All Menu",
  "menu": "All Menu",
  "main": "Main Dish",
  "main dish": "Main Dish",
  "main dishes": "Main Dish",
  "appetizer": "Appetizers",
  "appetizers": "Appetizers",
  "side": "Side Dish",
  "side dish": "Side Dish",
  "side dishes": "Side Dish",
  "soups": "Soup",
  "soup": "Soup",
  "dessert": "Dessert",
  "desserts": "Dessert",
  "sweet": "Dessert",
  "drink": "Drinks",
  "drinks": "Drinks",
  "beverage": "Drinks",
  "beverages": "Drinks",
};

/**
 * Returns a canonical category name used throughout the UI.
 */
export function canonicalCategoryName(value) {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const alias = CATEGORY_ALIASES[raw.toLowerCase()];
  if (alias) return alias;

  // Title-case unknown categories while keeping the original spacing.
  return raw
    .split(/\s+/)
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
    )
    .join(" ")
    .trim();
}

/**
 * Ensures the canonical category exists in CATEGORY_ORDER.
 * If the label is outside the default order, it is returned untouched.
 */
export function ensureCategoryInOrder(label) {
  const canonical = canonicalCategoryName(label);
  if (CATEGORY_ORDER.includes(canonical)) return canonical;
  return canonical;
}
