const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'juice-enterprise-super-secret-key-2026';

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Simple validation for demo / enterprise setup
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Issue Token
  const token = jwt.sign(
    { email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: { email, name: 'Sabarish D', role: 'admin' }
  });
};

exports.verifySession = (req, res) => {
  res.json({ success: true, user: req.user });
};
