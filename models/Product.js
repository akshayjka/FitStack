const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  demoUrl: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  videoUrl: { type: String, trim: true, default: '' },
  videoFile: { type: String, trim: true, default: '' },
  category: { type: String, trim: true, default: '' },
  price: { type: String, trim: true, default: '' },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });
module.exports = mongoose.model('Product', productSchema);
