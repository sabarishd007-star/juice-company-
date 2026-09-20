const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

router.get('/', authMiddleware, inventoryController.getAllProducts);
router.put('/:id', authMiddleware, inventoryController.updateStock);

router.post('/', authMiddleware, (req, res) => {
  const { id, name, stock, capacity, status, price } = req.body;
  db.run(
    'INSERT INTO inventory VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, stock, capacity, status, price],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Product created successfully' });
    }
  );
});

module.exports = router;
