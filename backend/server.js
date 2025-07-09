const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to SQLite database');
});

// Create sample table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS inventory (
    
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  quantity INTEGER
)`);

// Insert sample data only if table is empty
db.get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
  if (row.count === 0) {
    const stmt = db.prepare("INSERT INTO inventory (name, quantity) VALUES (?, ?)");
    stmt.run("Burger", 50);
    stmt.run("Fries", 30);
    stmt.run("Soft Drink", 100);
    stmt.finalize();
    console.log("Inserted sample inventory data.");
  }
});

// Sample GET route
app.get('/api/inventory', (req, res) => {
  db.all("SELECT * FROM inventory", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});