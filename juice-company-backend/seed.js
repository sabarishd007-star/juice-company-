const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database for seeding:', err.message);
    process.exitCode = 1;
    return;
  }

  console.log('Connected to SQLite database for seeding.');
});

const seedProducts = [
  ['P-101', 'Cold-Pressed Green Detox', 1420, 2000, 'In Stock', 6.99],
  ['P-102', 'Mango Passion Glow', 890, 1500, 'In Stock', 7.49],
  ['P-103', 'Citrus Electrolyte', 140, 1000, 'Low Stock', 5.99],
  ['P-104', 'Berry Antioxidant Burst', 310, 1200, 'Low Stock', 7.99],
  ['P-105', 'Dragonfruit Spark Boost', 950, 1500, 'In Stock', 8.49]
];

const seedEndpoints = [
  ['EP-1', '/v1/chat/completions', 'LLM-v4-Turbo', 'us-east-1', 'Active', 14.2],
  ['EP-2', '/v1/embeddings', 'Embed-v2', 'eu-west-1', 'Active', 8.6],
  ['EP-3', '/v1/vision/analyze', 'Vision-Transformer-H', 'ap-northeast-1', 'Syncing', 42.1],
  ['EP-4', '/v1/recommendations/juice', 'Recommendation-v1', 'us-west-2', 'Active', 11.5]
];

function finish(error) {
  if (error) {
    console.error('Database seeding failed:', error.message);
    process.exitCode = 1;
  } else {
    console.log('Database seeded successfully.');
  }

  db.close((closeError) => {
    if (closeError) {
      console.error('Error closing database:', closeError.message);
      process.exitCode = 1;
    }
  });
}

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS inventory');
  db.run('DROP TABLE IF EXISTS api_endpoints');

  db.run(`CREATE TABLE inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL,
    price REAL NOT NULL
  )`);

  db.run(`CREATE TABLE api_endpoints (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    model TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT NOT NULL,
    latency REAL NOT NULL
  )`);

  const productStatement = db.prepare('INSERT INTO inventory VALUES (?, ?, ?, ?, ?, ?)');
  seedProducts.forEach((product) => productStatement.run(product));
  productStatement.finalize();

  const endpointStatement = db.prepare('INSERT INTO api_endpoints VALUES (?, ?, ?, ?, ?, ?)');
  seedEndpoints.forEach((endpoint) => endpointStatement.run(endpoint));
  endpointStatement.finalize((err) => finish(err));
});

db.on('error', (err) => finish(err));
