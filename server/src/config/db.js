const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer = null;
let isReplicaSet = false;
let dbConnectionMode = 'disconnected';

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for serverless environments)
  if (mongoose.connection.readyState === 1) {
    return { connection: mongoose.connection, isReplicaSet, mode: dbConnectionMode };
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consentlog_enterprise';

  // 1. Try connecting to external/local MongoDB instance first
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    dbConnectionMode = 'external-mongodb';
    // Check if connected instance supports replica set transactions
    try {
      const admin = mongoose.connection.db.admin();
      const status = await admin.replSetGetStatus();
      isReplicaSet = Boolean(status && status.ok === 1);
    } catch {
      isReplicaSet = false;
    }
    const maskedUri = uri.replace(/\/\/.*@/, '//***@');
    console.log(`[Database] Connected to MongoDB at ${maskedUri} (ReplicaSet: ${isReplicaSet})`);
    return { connection: mongoose.connection, isReplicaSet, mode: dbConnectionMode };
  } catch (externalErr) {
    const maskedUri = uri.replace(/\/\/.*@/, '//***@');
    console.log(`[Database] MongoDB at ${maskedUri} not reachable (${externalErr.message}).`);
    if (process.env.VERCEL) {
      throw new Error(`[Database] Failed to connect to MongoDB Atlas on Vercel: ${externalErr.message}. Make sure MONGODB_URI is configured in Vercel project Environment Variables.`);
    }
    console.log('[Database] Launching embedded persistent MongoDB Replica Set (MongoMemoryReplSet) for ACID transactions & persistence...');
  }

  // 2. Fallback to persistent embedded MongoMemoryReplSet (or MongoMemoryServer)
  try {
    const { MongoMemoryReplSet, MongoMemoryServer } = require('mongodb-memory-server');
    const isTest = process.env.NODE_ENV === 'test' || process.env.TEST_DB === 'true';
    const dataDir = isTest ? undefined : path.join(__dirname, '..', '..', '.mongodb-data');
    if (dataDir && !fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    try {
      const replOpts = {
        replSet: {
          count: 1,
          storageEngine: dataDir ? 'wiredTiger' : 'ephemeralForTest',
          dbName: 'consentlog_enterprise',
        },
      };
      if (dataDir) {
        replOpts.instanceOpts = [{ dbPath: dataDir }];
      }
      mongoServer = await MongoMemoryReplSet.create(replOpts);
      const memUri = mongoServer.getUri('consentlog_enterprise');
      await mongoose.connect(memUri);
      isReplicaSet = true;
      dbConnectionMode = 'embedded-replica-set';
      console.log(`[Database] Connected to Persistent Embedded MongoDB Replica Set at ${memUri} ${dataDir ? `(Data Dir: ${dataDir})` : '(In-Memory Test Mode)'}`);
    } catch (replErr) {
      console.warn('[Database] Replica set startup fallback to standalone MongoMemoryServer:', replErr.message);
      const instanceOpts = {
        dbName: 'consentlog_enterprise',
        storageEngine: dataDir ? 'wiredTiger' : 'ephemeralForTest',
      };
      if (dataDir) {
        instanceOpts.dbPath = dataDir;
      }
      mongoServer = await MongoMemoryServer.create({
        instance: instanceOpts,
      });
      const memUri = mongoServer.getUri('consentlog_enterprise');
      await mongoose.connect(memUri);
      isReplicaSet = false;
      dbConnectionMode = 'embedded-standalone';
      console.log(`[Database] Connected to Embedded MongoDB Standalone at ${memUri}`);
    }

    return { connection: mongoose.connection, isReplicaSet, mode: dbConnectionMode };
  } catch (err) {
    console.error('[Database] CRITICAL: Failed to connect to any MongoDB instance:', err);
    throw err;
  }
};

/**
 * Helper to execute an operation inside a MongoDB ACID Transaction when replica set is active,
 * or safely execute sequentially if standalone.
 */
const withTransaction = async (workFn) => {
  if (isReplicaSet) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await workFn(session);
      });
      return result;
    } finally {
      await session.endSession();
    }
  } else {
    return await workFn(null);
  }
};

const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  isReplicaSet,
  mode: dbConnectionMode,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectDB,
  withTransaction,
  getDbStatus,
  disconnectDB,
};

