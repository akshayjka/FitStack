const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true },
  featuredImage: { type: String, trim: true, default: '' },
  content: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  publicationDate: { type: Date, default: Date.now },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

blogSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });
module.exports = mongoose.model('Blog', blogSchema);
