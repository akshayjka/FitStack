const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function login(req, res) {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
  const admin = await Admin.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  const token = jwt.sign({ id: admin._id.toString(), username: admin.username, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  res.cookie('admin_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 });
  res.json({ success: true, admin: { username: admin.username, email: admin.email } });
}

function logout(req, res) { res.clearCookie('admin_token'); res.json({ success: true }); }
function me(req, res) { res.json({ success: true, admin: req.admin }); }

async function seedAdmin({ username, email, password }) {
  if (!username || !email || !password) throw new Error('username, email and password are required');
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { username: username.toLowerCase() },
    { username: username.toLowerCase(), email: email.toLowerCase(), passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return admin;
}

module.exports = { login, logout, me, seedAdmin };
