// src/utils/productData.js
import { placeholders, shopDetails } from "../../utils/data";

export const allItemsFlat = Object.entries(placeholders).flatMap(([category, items]) =>
  items.map(item => ({
    name: item.name,
    price: item.price,
    category,
    quantity: item.quantity ?? 0,
    status: 'Available',
    allergens: item.allergens || '',
    addons: item.addons || [],
    description: item.description || '',
    sizes: item.sizes || [] 
  }))
);


