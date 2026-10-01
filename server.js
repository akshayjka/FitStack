require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const viewRoutes = require('./routes/viewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(viewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'Uploaded file is too large.' });
  if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ success: false, message: 'Unexpected upload field.' });
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const port = Number(process.env.PORT) || 3000;
connectDB().then(() => app.listen(port, () => console.log(`Server running on http://localhost:${port}`))).catch(err => { console.error('Startup failed:', err.message); process.exit(1); });
