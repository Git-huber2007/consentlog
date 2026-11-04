const { app } = require('../server/src/index');
const { connectDB } = require('../server/src/config/db');
const { ensureSeedData } = require('../server/src/utils/seedHelper');

let dbPromise = null;

const initDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      await connectDB();
      try {
        await ensureSeedData(false);
      } catch (e) {
        console.warn('[Vercel Serverless] Seed initialization check:', e.message);
      }
    })();
  }
  return dbPromise;
};

module.exports = async (req, res) => {
  await initDb();

  // Normalize URL to ensure Express route mounting matches
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
