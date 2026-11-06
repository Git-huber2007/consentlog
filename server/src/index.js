require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const { connectDB, getDbStatus } = require('./config/db');
const { ensureSeedData } = require('./utils/seedHelper');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const consentRoutes = require('./routes/consentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const externalConsentRoutes = require('./routes/externalConsentRoutes');

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// 3. Body Parsers & Input Sanitization against NoSQL Injection
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// 4. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again shortly.',
  },
});
app.use('/api', apiLimiter);

// 6. Health & Architecture Info Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    platform: 'ConsentLog – Intelligent Consent & Preference Management Platform (Enterprise Edition)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
});

// 7. REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/consent', externalConsentRoutes);

// 8. Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureSeedData(false);

  const server = app.listen(PORT, () => {
    console.log(`\n========================================================================`);
    console.log(`  CONSENTLOG ENTERPRISE EDITION - BACKEND API SERVER`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  Database Mode: ${getDbStatus().mode} (Transactions: ${getDbStatus().isReplicaSet})`);
    console.log(`========================================================================\n`);
  });

  return server;
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };

