import React, { useEffect, useState } from 'react';

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/inventory')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Error fetching inventory:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <p>No inventory data found.</p>
        ) : (
          items.map((item) => (
            <li key={item.id} className="p-4 border rounded shadow">
              <strong>{item.name}</strong>: {item.quantity}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;