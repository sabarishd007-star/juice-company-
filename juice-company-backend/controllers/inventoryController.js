const db = require('../config/db');

exports.getAllProducts = (req, res) => {
  db.all('SELECT * FROM inventory', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, count: rows.length, data: rows });
  });
};

exports.updateStock = (req, res) => {
  const { id } = req.params;
  const { stock, status } = req.body;

  db.run(
    'UPDATE inventory SET stock = ?, status = ? WHERE id = ?',
    [stock, status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Product not found' });
      res.json({ success: true, message: `Product ${id} updated successfully.` });
    }
  );
};
