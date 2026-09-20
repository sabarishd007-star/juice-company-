const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('📦 Connected to SQLite Database.');
});

db.serialize(() => {
  // Inventory Table
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL,
    price REAL NOT NULL
  )`);

  // Endpoints Table
  db.run(`CREATE TABLE IF NOT EXISTS api_endpoints (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    model TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT NOT NULL,
    latency REAL NOT NULL
  )`);

  // Seed default items if empty
  db.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO inventory VALUES 
        ('P-101', 'Cold-Pressed Green Detox', 1420, 2000, 'In Stock', 6.99),
        ('P-102', 'Mango Passion Glow', 890, 1500, 'In Stock', 7.49),
        ('P-103', 'Citrus Electrolyte', 140, 1000, 'Low Stock', 5.99),
        ('P-104', 'Berry Antioxidant Burst', 310, 1200, 'Low Stock', 7.99)
      `);
    }
  });

  db.get('SELECT COUNT(*) as count FROM api_endpoints', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO api_endpoints VALUES 
        ('EP-1', '/v1/chat/completions', 'LLM-v4-Turbo', 'us-east-1', 'Active', 14.2),
        ('EP-2', '/v1/embeddings', 'Embed-v2', 'eu-west-1', 'Active', 8.6),
        ('EP-3', '/v1/vision/analyze', 'Vision-Transformer-H', 'ap-northeast-1', 'Syncing', 42.1)
      `);
    }
  });
});

module.exports = db;
