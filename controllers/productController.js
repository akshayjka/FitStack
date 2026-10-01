const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

function filePath(file) { return file ? `/uploads/${file.filename}` : ''; }
function cleanup(url) {
  if (!url?.startsWith('/uploads/')) return;
  const file = path.join(__dirname, '..', 'public', url);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

async function list(req, res) { res.json({ success: true, products: await Product.find().sort({ createdAt: -1 }) }); }
async function publicList(req, res) { res.json({ success: true, products: await Product.find({ published: true }).sort({ createdAt: -1 }) }); }
async function create(req, res) {
  const p = await Product.create({ ...req.body, imageUrl: filePath(req.files?.image?.[0]) || req.body.imageUrl || '', videoFile: filePath(req.files?.video?.[0]) || '' });
  res.status(201).json({ success: true, product: p });
}
async function update(req, res) {
  const p = await Product.findById(req.params.id); if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  Object.assign(p, req.body);
  if (req.files?.image?.[0]) { cleanup(p.imageUrl); p.imageUrl = filePath(req.files.image[0]); }
  if (req.files?.video?.[0]) { cleanup(p.videoFile); p.videoFile = filePath(req.files.video[0]); }
  await p.save(); res.json({ success: true, product: p });
}
async function remove(req, res) {
  const p = await Product.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  cleanup(p.imageUrl); cleanup(p.videoFile); res.json({ success: true });
}
module.exports = { list, publicList, create, update, remove };
