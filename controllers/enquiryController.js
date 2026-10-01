const Enquiry = require('../models/Enquiry');

async function create(req, res) {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !phone || !subject || !message) return res.status(400).json({ success: false, message: 'Name, email, subject and message are required.' });
  const enquiry = await Enquiry.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, enquiry });
}
async function list(req, res) { res.json({ success: true, enquiries: await Enquiry.find().sort({ createdAt: -1 }) }); }
async function remove(req, res) { await Enquiry.findByIdAndDelete(req.params.id); res.json({ success: true }); }
module.exports = { create, list, remove };
