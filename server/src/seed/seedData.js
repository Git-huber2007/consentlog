require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { ensureSeedData } = require('../utils/seedHelper');

(async () => {
  try {
    await connectDB();
    await ensureSeedData(true);
    console.log('[Seed CLI] Database successfully reset and seeded with enterprise demo data.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed CLI] Failed:', err);
    process.exit(1);
  }
})();

