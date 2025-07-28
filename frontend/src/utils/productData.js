// src/utils/productData.js
import { placeholders } from '../pages/pos/POSMain';


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


