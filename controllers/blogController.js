const Blog = require('../models/Blog');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

function filePath(file) { return file ? `/uploads/${file.filename}` : ''; }
function cleanup(url) { if (!url?.startsWith('/uploads/')) return; const f = path.join(__dirname, '..', 'public', url); if (fs.existsSync(f)) fs.unlinkSync(f); }
async function list(req, res) { res.json({ success: true, posts: await Blog.find().sort({ publicationDate: -1 }) }); }
async function publicList(req, res) { res.json({ success: true, posts: await Blog.find({ published: true }).sort({ publicationDate: -1 }) }); }
async function getBySlug(req, res) { const post = await Blog.findOne({ slug: req.params.slug, published: true }); if (!post) return res.status(404).json({ success: false, message: 'Post not found' }); res.json({ success: true, post }); }
async function create(req, res) {
  const slug = (req.body.slug || req.body.title ? slugify(req.body.slug || req.body.title, { lower: true, strict: true }) : 'post');
  const post = await Blog.create({ ...req.body, slug, featuredImage: filePath(req.file) || req.body.featuredImage || '' });
  res.status(201).json({ success: true, post });
}
async function update(req, res) {
  const post = await Blog.findById(req.params.id); if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  Object.assign(post, req.body);
  if (req.body.slug || req.body.title) post.slug = slugify(req.body.slug || req.body.title, { lower: true, strict: true });
  if (req.file) { cleanup(post.featuredImage); post.featuredImage = filePath(req.file); }
  await post.save(); res.json({ success: true, post });
}
async function remove(req, res) { const p = await Blog.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ success: false, message: 'Post not found' }); cleanup(p.featuredImage); res.json({ success: true }); }
module.exports = { list, publicList, getBySlug, create, update, remove };
