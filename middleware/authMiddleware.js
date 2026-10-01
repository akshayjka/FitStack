const jwt = require('jsonwebtoken');

function getToken(req) {
  if (req.cookies?.admin_token) return req.cookies.admin_token;
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('admin_token');
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
}

function requireAuthPage(req, res, next) {
  const token = getToken(req);
  if (!token) return res.redirect('/admin/login');
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('admin_token');
    return res.redirect('/admin/login');
  }
}

module.exports = { requireAuth, requireAuthPage };
