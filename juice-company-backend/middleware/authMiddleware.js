const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'juice-enterprise-super-secret-key-2026';

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: Missing Authorization Token' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
  }
};
