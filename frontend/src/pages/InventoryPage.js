import React, { useEffect, useState } from 'react';
import { fetchInventory } from '../api/inventory';

const InventoryList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInventory()
      .then(res => setItems(res.data))
      .catch(err => console.error('Error fetching inventory:', err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inventory</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-2 border rounded shadow-sm">
            <strong>{item.name}</strong>: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
