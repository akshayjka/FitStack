require('dotenv').config();
const connectDB = require('./config/db');
const { seedAdmin } = require('./controllers/adminController');

(async () => {
  try {
    await connectDB();
    const admin = await seedAdmin({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!'
    });
    console.log(`Admin ready: ${admin.username} / ${admin.email}`);
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
