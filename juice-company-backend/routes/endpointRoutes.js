const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM api_endpoints', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, count: rows.length, data: rows });
  });
});

router.post('/', authMiddleware, (req, res) => {
  const { path, model, region, status, latency } = req.body;
  const id = 'EP-' + Date.now();
  db.run(
    'INSERT INTO api_endpoints VALUES (?, ?, ?, ?, ?, ?)',
    [id, path, model, region, status, latency],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Endpoint deployed successfully' });
    }
  );
});

module.exports = router;
